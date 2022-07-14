import Debug from "debug";

export const debug = {
  hmr: Debug("wilson:pages:hmr"),
  virtual: Debug("wilson:pages:virtual"),
};

export function slash(path: string): string {
  return path.replace(/\\/g, "/");
}
