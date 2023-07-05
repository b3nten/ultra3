import { Ultra } from "../ultra.ts";
import { UltraPluginReact } from "../UltraPluginReact.tsx";

const app = new Ultra();
const react = new UltraPluginReact();
console.log(app.importMap, app.clientImportMap)

app.Plugin(react);

app.ServeStatic();
app.ServeCompiler();

const AppEntry = (await import("./app.tsx")).default

app.Get("*", async () => {
  const html = react.RenderStatic(<AppEntry/>);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
});

app.Serve();
