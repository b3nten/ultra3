import { renderToString } from "https://esm.sh/v122/react-dom@18.2.0/server?dev";
import { UltraPlugin } from "./ultra.ts";

export class UltraPluginReact extends UltraPlugin {
  public name = "React";
  public importMap: any;
  init({ importMap }: any) {
    this.importMap = importMap;
  }
  public RenderStatic = (component: any) => {
    const code = renderToString(component);
    return code.replace(
      "</head>",
      `<script type="importmap">${
        JSON.stringify(this.importMap)
      }</script></head>`,
    ).replace(
      "</body>",
      `<script type="module" async src="/__compiler/app.tsx"></script></body>`,
    )
  };
}
