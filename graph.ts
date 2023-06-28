export interface LoadResponseModule {
  /** A module with code has been loaded. */
  kind: "module";
  /** The string URL of the resource. If there were redirects, the final
   * specifier should be set here, otherwise the requested specifier. */
  specifier: string;
  /** For remote resources, a record of headers should be set, where the key's
   * have been normalized to be lower case values. */
  headers?: Record<string, string>;
  /** The string value of the loaded resources. */
  content: string;
}

export interface LoadResponseExternal {
  /** The loaded module is either _external_ or _built-in_ to the runtime. */
  kind: "external";
  /** The strung URL of the resource. If there were redirects, the final
   * specifier should be set here, otherwise the requested specifier. */
  specifier: string;
}

export type LoadResponse = LoadResponseModule | LoadResponseExternal;
const hasPermissions = "permissions" in Deno;
let readRequested = false;
const netRequested = new Set<string>();

async function requestRead(path: URL): Promise<void> {
  if (readRequested || !hasPermissions) {
    return;
  }
  readRequested = true;
  await Deno.permissions.request({ name: "read", path });
}

async function requestNet(host: string): Promise<void> {
  if (!hasPermissions || netRequested.has(host)) {
    return;
  }
  netRequested.add(host);
  await Deno.permissions.request({ name: "net", host });
}

/** A Deno specific loader function that can be passed to the
 * `createModuleGraph` which will use `Deno.readTextFile` for local files, or
 * use `fetch()` for remote modules.
 *
 * @param specifier The string module specifier from the module graph.
 */
export async function load(
  specifier: string,
  dynamic: boolean,
): Promise<LoadResponse | undefined> {
  if (dynamic) return undefined;
  const url = new URL(specifier);
  try {
    switch (url.protocol) {
      case "file:": {
        await requestRead(url);
        const content = await Deno.readTextFile(url);
        return {
          kind: "module",
          specifier,
          content,
        };
      }
      case "http:":
      case "https:": {
        await requestNet(url.host);
        const response = await fetch(String(url), { redirect: "follow" });
        if (response.status !== 200) {
          // ensure the body is read as to not leak resources
          await response.arrayBuffer();
          return undefined;
        }
        const content = await response.text();
        const headers: Record<string, string> = {};
        for (const [key, value] of response.headers) {
          headers[key.toLowerCase()] = value;
        }
        return {
          kind: "module",
          specifier: response.url,
          headers,
          content,
        };
      }
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}
