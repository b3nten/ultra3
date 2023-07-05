import { Ultra } from "../ultra.ts";
import { UltraPluginReact } from "../UltraPluginReact.tsx";

const app = new Ultra();
await app.Build();

const react = new UltraPluginReact(import.meta.resolve("./app.tsx"));

app.Plugin(react);

app.ServeStatic();
app.ServeCompiler()

app.Get("*", async () => {
  return react.renderStatic();
});

app.Serve();
