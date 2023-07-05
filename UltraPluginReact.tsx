import { renderToString } from "https://esm.sh/v122/react-dom@18.2.0/server?dev";
import { UltraPlugin } from "./ultra.ts";
import { ImportMap } from "https://deno.land/x/importmap@0.2.1/mod.ts";
import { esbuild } from "./deps.ts";

export class UltraPluginReact implements UltraPlugin {
  public name = "React";

  importMap: ImportMap | undefined;
  moduleGraph = new Map<string, string>();
  clientEntry: string;

  Component: any;

  constructor(clientEntry: string) {
    this.clientEntry = clientEntry;
  }

  private async compile(code: string) {
    const result = await esbuild.transform(code, {
      loader: "tsx",
      format: "esm",
      jsx: "automatic",
    });
    return new Response(result.code, {
      headers: {
        "content-type": "application/javascript; charset=utf-8",
      },
    });
  }

  async init(
    input: any,
  ) {
    this.importMap = input.vendorImportMap ?? input.importMap;
    input.compiler.createCompiler(
      ["jsx", "tsx"],
      async ({ code }: { code: string }) => await this.compile(code),
    );
    this.moduleGraph = input.createModuleGraph(this.clientEntry);
    this.Component = (await import(this.clientEntry)).default;
  }

  async renderStatic() {
    const Component = this.Component;
    const html = renderToString(<Component />);
    const transformedHtml = html.replace(
      "</head>",
      `<script type="importmap">
    ${JSON.stringify(this.importMap)}
    </script></head>`,
    ).replace(
      "</body>",
      `<script type="module" async src="/__compiler/app.tsx"></script></body>`,
    );
    return new Response(transformedHtml, {
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
}
