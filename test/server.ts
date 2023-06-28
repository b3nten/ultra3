import { Ultra, UltraPlugin } from "../ultra.ts";

class React extends UltraPlugin {
	name = "React";
	async render(req: Request){
		return new Response("Hello World")
	}
}

const app = new Ultra()

const react = new React()
app.Plugin(react)

app.ServeStatic()
app.ServeCompiler()

app.Get("*", async (request) => {
	return react.render(request)
})

app.Serve()