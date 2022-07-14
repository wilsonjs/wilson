import { renderToString as reactRenderToString } from "react-dom/server";
import App from "./app";

export async function renderToString(url: string): Promise<string> {
  return reactRenderToString(<App />);
}
