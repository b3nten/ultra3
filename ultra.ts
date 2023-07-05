import { deno_graph, getMimeType, Hono, type Next, toFileUrl } from "./deps.ts";
import { esbuild, esbuildPlugins } from "./deps.ts";
import { Logger } from "./log.ts";
import { load } from "./graph.ts";
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

type UltraOptions = {
  mode?: "development" | "production";
  importMap?: string;
  clientEntry: string;
};

const DefaultUltraOptions: Required<UltraOptions> = {
  mode: "development",
  importMap: "./importMap.json",
  clientEntry: "./app.tsx",
};

export class Ultra {
  private ULTRA_MODE = "development";
  private ULTRA_BUILD_DIR = "./ultra";
  private ULTRA_VENDOR_DIR = this.ULTRA_BUILD_DIR + "/vendor";

  clientModuleGraph: deno_graph.ModuleGraphJson | undefined;
  clientModules: Array<string> | undefined;

  importMap: ImportMap | undefined;
  clientImportMap: ImportMap | undefined;
  clientEntry: string | undefined;

  public esbuild = esbuild;

  private plugins: UltraPlugin[] = [];

  private hono = new Hono();

  static readonly Log = new Logger("DEBUG");

  constructor(options: UltraOptions = DefaultUltraOptions) {
    try {
      this.importMap = JSON.parse(Deno.readTextFileSync(
        options.importMap ?? DefaultUltraOptions.importMap,
      ));
    } catch {
      Ultra.Log.warning("No import map found.");
    }

    this.ULTRA_MODE = options?.mode ?? DefaultUltraOptions.mode;

    this.clientEntry = options?.clientEntry ?? DefaultUltraOptions.clientEntry;

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

  private utils = {
    directoryExists: (path: string) => {
      try {
        Deno.readDirSync(path);
        return true;
      } catch {
        return false;
      }
    },
    notFound: new Response("Not Found", { status: 404 }),
  };

  private async vendorImportMapDependencies() {
    if (!this.importMap) return;
    this.clientImportMap = {
      imports: {},
    };
    for (
      const [module, url] of Object.entries(
        this.importMap?.imports as Record<string, string>,
      )
    ) {
      const urlObject = new URL(url);
      const folderURL =
        `${this.ULTRA_VENDOR_DIR}/${urlObject.hostname}${urlObject.pathname}`;
      if (!this.utils.directoryExists(folderURL)) {
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
      this.clientImportMap.imports![module] = import.meta.resolve(
        folderURL + "/index.js",
      );
    }
    await Deno.writeTextFile(
      `${this.ULTRA_BUILD_DIR}/importMap.json`,
      JSON.stringify(this.clientImportMap),
    );
    // need to delete folders that are no longer in the import map
  }

  private async generateModuleGraph() {
    if (!this.clientEntry) return;
    this.clientModuleGraph = await deno_graph.createGraph(
      import.meta.resolve(this.clientEntry),
      {
        kind: "codeOnly",
        load,
        resolve: (specifier: string, referrer: string): string => {
          if (this.clientImportMap?.imports?.[specifier]) {
            return this.clientImportMap.imports[specifier]!;
          }
          return new URL(specifier, referrer).href;
        },
      },
    );
    this.clientModules = [];
    for (const module of this.clientModuleGraph.modules) {
      this.clientModules.push(module.specifier);
    }
    await Deno.writeTextFile(
      `${this.ULTRA_BUILD_DIR}/moduleGraph.json`,
      JSON.stringify(this.clientModuleGraph),
    );
    Ultra.Log.info(`Generated module graph for ${this.clientEntry}.`);
  }

  private async build() {
    const t = performance.now();
    await this.vendorImportMapDependencies();
    await this.generateModuleGraph();
    Ultra.Log.success(
      "Successfully built Ultra in " + Math.trunc(performance.now() - t) +
        "ms.",
    );
  }

  public Plugin(plugin: UltraPlugin) {
    plugin.init({importMap: this.importMap});
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
    this.hono.use(async (ctx, next) => {
      if (ctx.finalized) {
        await next();
        return;
      }
      const requestUrl = new URL(ctx.req.raw.url);
      const path = requestUrl.pathname.replace("/__compiler/", "/");
      const staticPath = `${Deno.cwd()}${path}`;
      try {
        let res = await fetch(toFileUrl(staticPath));
        console.log(res.ok)
        if (!res.ok) {
          await next();
          return;
        }
        const code = await res.text();
        const transpiled = await this.esbuild.transform(code, {
          loader: "tsx",
          format: "esm",
          jsx: "automatic",
          jsxImportSource: "react",
        });
        const headers = new Headers(res.headers);
        headers.append("Content-Type", "application/javascript");
        return new Response(
          transpiled.code,
          { status: 200, headers },
        );
      } catch(e) {
        Ultra.Log.error("Failed to serve compiler: " + e.message);
        await next();
        return;
      }
    });
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
    await this.build();
    await serve(this.hono.fetch, { port });
  }
}

export abstract class UltraPlugin {
  abstract name: string;
  init({importMap}: any): void {}
  onBuild(): void {}
  onServeStatic(): void {}
  onCompile(): void {}
}
