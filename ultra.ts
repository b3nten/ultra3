import { deno_graph, getMimeType, Hono, type Next, toFileUrl } from "./deps.ts";
import { esbuild, esbuildPlugins } from "./deps.ts";
import { load } from "./graph.ts";
import { Logger } from "./log.ts";
import { serve } from "./deps.ts";

interface SpecifierMap {
  [url: string]: string | null;
}
interface Scopes {
  [url: string]: SpecifierMap;
}
interface ImportMap {
  imports?: SpecifierMap;
  scopes?: Scopes;
}

export class Ultra {
  private ULTRA_MODE = "development";
  private ULTRA_BUILD_DIR = Deno.cwd() + "/ultra";
  private ULTRA_VENDOR_DIR = this.ULTRA_BUILD_DIR + "/vendor";

  importMap: ImportMap | undefined;
  vendorImportMap: ImportMap | undefined;

  private plugins: UltraPlugin[] = [];

  private hono = new Hono();

  static readonly Log = new Logger("DEBUG");

  public Esbuild = esbuild;

  private compilers: {
    extensions: string | string[];
    compiler: (
      { code, fileName }: {
        code: string;
        fileName: string;
      },
    ) => Promise<Response>;
  }[] = [];

  private Utils = {
    DirectoryExists: (path: string) => {
      try {
        Deno.readDirSync(path);
        return true;
      } catch {
        return false;
      }
    },
  };

  static Response = {
    NotFound: new Response("Not Found", { status: 404 }),
    Invalid: new Response("Invalid Request", { status: 400 }),
  };

  constructor() {
    try {
      this.importMap = JSON.parse(Deno.readTextFileSync(
        "./importMap.json",
      ));
    } catch {
      Ultra.Log.warning("No import map found. Ensure ./importMap.json exists.");
    }

    this.ULTRA_MODE = "development";

    try {
      Deno.mkdirSync(this.ULTRA_BUILD_DIR);
    } catch {
      Ultra.Log.debug("Build directory already exists.");
    }
    try {
      Deno.mkdirSync(this.ULTRA_VENDOR_DIR);
    } catch {
      Ultra.Log.debug("Vendor directory already exists.");
    }
  }

  private async vendorImportMapDependencies() {
    if (!this.importMap) return;
    this.vendorImportMap = {
      imports: {},
      scopes: {},
    };
    for (
      const [module, url] of Object.entries(
        this.importMap?.imports as Record<string, string>,
      )
    ) {
      const urlObject = new URL(url);
      const folderURL =
        `${this.ULTRA_VENDOR_DIR}/${urlObject.hostname}${urlObject.pathname}`;
      if (!this.Utils.DirectoryExists(folderURL)) {
        await Deno.mkdir(folderURL, { recursive: true });
        await esbuild.build({
          plugins: [...esbuildPlugins({
            loader: "portable",
            requestOptions: {
              headers: {
                "user-agent": "Mozilla/5.0",
              },
            },
          })],
          entryPoints: [url],
          outfile: folderURL + "/index.js",
          bundle: true,
          minify: false,
          format: "esm",
        });
        esbuild.stop();
        Ultra.Log.info(`Vendored ${module} to ${folderURL}.`);
      } else {
        Ultra.Log.debug(`Vendor folder already exists for ${module}.`);
      }
      this.vendorImportMap.imports![module] = import.meta.resolve(
        folderURL + "/index.js",
      ).replace("c:\\dev\\ultra3\\test", "")
    }
    await Deno.writeTextFile(
      `${this.ULTRA_BUILD_DIR}/importMap.json`,
      JSON.stringify(this.vendorImportMap),
    );
    this.ServeVendor()
  }

  private async build() {
    const t = performance.now();
    await this.vendorImportMapDependencies();
    Ultra.Log.success(
      "Successfully built Ultra in " + Math.trunc(performance.now() - t) +
        "ms.",
    );
  }

  private useHonoHandler = (
    type: "get" | "post" | "put" | "patch" | "delete" | "all",
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => {
    // @ts-expect-error
    return this.hono[type](path, async (ctx, next) => {
      const request = ctx.req.raw;
      return callback(request, next);
    });
  };

  public async Build() {
    await this.build();
  }

  public async Plugin(plugin: UltraPlugin) {
    await plugin.init?.({
      importMap: this.importMap,
      vendorImportMap: this.vendorImportMap,
      createModuleGraph: this.CreateModuleGraph,
      compiler: {
        esbuild: this.Esbuild,
        createCompiler: this.CreateCompiler,
      },
      ULTRA_BUILD_DIR: this.ULTRA_BUILD_DIR,
      ULTRA_VENDOR_DIR: this.ULTRA_VENDOR_DIR,
      ULTRA_MODE: this.ULTRA_MODE,
      router: {
        get: this.Get,
        post: this.Post,
        put: this.Put,
        patch: this.Patch,
        delete: this.Delete,
        all: this.All,
      },
    });
    this.plugins.push(plugin);
  }

  public ServeStatic() {
    const params = {
      path: "/static",
    };
    // implement static file serving
    // serve from static folder and ultra folder
    this.hono.use(async (ctx, next) => {
      if (ctx.finalized) {
        await next();
        return;
      }
      const requestUrl = new URL(ctx.req.raw.url);
      const path = params.path + "/" + requestUrl.pathname;
      const staticPath = `${Deno.cwd()}${path}`;
      const ultraPath = `${this.ULTRA_BUILD_DIR}${path}`;
      try {
        let res = await fetch(toFileUrl(staticPath));
        if (!res.ok) {
          res = await fetch(toFileUrl(ultraPath));
        }
        if (!res.ok) {
          await next();
          return;
        }
        const headers = new Headers(res.headers);
        const mimeType = getMimeType(path) || headers.get("content-type");
        if (mimeType) {
          headers.append("Content-Type", mimeType);
        }
        Ultra.Log.info(`Serving static file at ${path}.`);
        return new Response(
          res.body,
          { status: 200, headers },
        );
      } catch {
        await next();
        return;
      }
    });
    Ultra.Log.info(`Serving static files at ${params.path}.`);
  }

  public ServeVendor(){
    this.hono.use(async (ctx, next) => {
      if (ctx.finalized) {
        await next();
        return;
      }
      const requestUrl = new URL(ctx.req.raw.url);
      const path = `${Deno.cwd()}${requestUrl.pathname}`;
      if(!requestUrl.pathname.startsWith("/ultra/vendor/")){
        await next();
        return;
      }
      try {
        console.log("ServeVendor", toFileUrl(path))
        const res = await fetch(toFileUrl(path));
        if (!res.ok) {
          await next();
          return;
        }
        const headers = new Headers(res.headers);
        const mimeType = getMimeType(path) || headers.get("content-type");
        if (mimeType) {
          headers.append("Content-Type", mimeType);
        }
        Ultra.Log.info(`Serving vendored dependency at ${path}.`);
        return new Response(
          res.body,
          { status: 200, headers },
        );
      } catch {
        await next();
        return;
      }
    });
  }

  public ServeCompiler() {
    // TODO: Check module graph to ensure that the file is imported by the client.
    this.hono.get("/__compiler/*", async (ctx, next) => {
      if (ctx.finalized) {
        await next();
        return;
      }
      const requestUrl = new URL(ctx.req.raw.url);
      Ultra.Log.debug(`Serving compiler for request ${ requestUrl.pathname}`);
      const path = requestUrl.pathname.replace("/__compiler/", "/");
      const staticPath = `${Deno.cwd()}${path}`;
      try {
        let res = await fetch(toFileUrl(staticPath));
        if (!res.ok) {
          await next();
          return;
        }
        const code = await res.text();
        const compiler = this.compilers.find((compiler) =>
          compiler.extensions.includes(path.split(".").pop()!)
        )?.compiler;
        if (compiler) {
          const compiled = await compiler({ code, fileName: path });
          Ultra.Log.info(`Compiled ${path}.`);
          return compiled;
        }
        const transpiled = await this.Esbuild.transform(code, {
          loader: "ts",
          format: "esm",
        });
        const headers = new Headers(res.headers);
        headers.append("Content-Type", "application/javascript");
        Ultra.Log.info(`Compiled ${path}.`);
        return new Response(
          transpiled.code,
          { status: 200, headers },
        );
      } catch (e) {
        await next();
        return;
      }
    });
  }

  public CreateCompiler = (
    extensions: string | string[],
    compiler: (
      { code, fileName }: { code: string; fileName: string },
    ) => Promise<Response>,
  ) => {
    this.compilers.push({
      extensions,
      compiler,
    });
    Ultra.Log.info(`Created compiler for ${extensions}.`);
  }

  public async CreateModuleGraph(entry: string, options?: {
    dynamic?: boolean;
    verbose?: boolean;
  }) {
    const graph = await deno_graph.createGraph(
      import.meta.resolve(entry),
      {
        kind: "codeOnly",
        load: !options?.dynamic ? load : undefined,
        resolve: (specifier: string, referrer: string): string => {
          if (this.importMap) {
            if (this.importMap.imports?.[specifier]) {
              return this.importMap.imports[specifier]!;
            }
          }
          return new URL(specifier, referrer).href;
        },
      },
    );
    Ultra.Log.info(`Generated module graph for ${entry}.`);
    if (options?.verbose) {
      return graph;
    } else {
      const modules = graph.modules.map((module) => module.specifier);
      return modules;
    }
  }

  public Get = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("get", path, callback);
  public Post = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("post", path, callback);
  public Put = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("put", path, callback);
  public Patch = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("patch", path, callback);
  public Delete = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("delete", path, callback);
  public All = (
    path: string,
    callback: (request: Request, next: Next) => Promise<Response>,
  ) => this.useHonoHandler("all", path, callback);

  public async Serve(port: number = 8000) {
    await serve(this.hono.fetch, { port });
  }
}

type UltraPluginInput = {
  importMap: ImportMap | undefined;
  vendorImportMap: ImportMap | undefined;
  createModuleGraph: Ultra["CreateModuleGraph"];
  compiler: {
    esbuild: typeof esbuild;
    createCompiler: (
      extensions: string | string[],
      compiler: (
        { code, fileName }: { code: string; fileName: string },
      ) => Promise<Response>,
    ) => void;
  };
  ULTRA_BUILD_DIR: string;
  ULTRA_VENDOR_DIR: string;
  ULTRA_MODE: string;
  router: {
    get: Ultra["Get"];
    post: Ultra["Post"];
    put: Ultra["Put"];
    patch: Ultra["Patch"];
    delete: Ultra["Delete"];
    all: Ultra["All"];
  };
};

export abstract class UltraPlugin {
  abstract name: string;
  abstract init?(input: UltraPluginInput): Promise<void> | void;
  abstract build?(input: UltraPluginInput): Promise<void> | void;
  abstract serve?(input: UltraPluginInput): Promise<void> | void;
}
