import { type Next, deno_graph, Hono } from "./deps.ts";
import { esbuild, esbuildPlugins } from "./deps.ts";
import { Logger } from "./log.ts";
import { load } from "./graph.ts";

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
  clientEntry: "./app.ts",
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
    plugin.setup();
    this.plugins.push(plugin);
  }

  public ServeStatic() {
    // implement static file serving
  }

  public ServeCompiler() {}

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

  public async Serve() {
    await this.build();
  }
}

export abstract class UltraPlugin {
  abstract name: string;
  setup(): void {}
  onBuild(): void {}
  onServeStatic(): void {}
  onCompile(): void {}
}
