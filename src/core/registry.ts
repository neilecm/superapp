// Minimal plugin registry for later.
// For now, it's a safe placeholder so the app compiles without plugins.

export type SuperAppPlugin = {
  name: string;
  // Optional root renderer; most of your future plugins will auto-mount via host.
  Root?: React.ComponentType<any>;
};

class Registry {
  private map = new Map<string, SuperAppPlugin>();
  // Optional navigation hook future plugins can read.
  navigate?: (pluginName: string) => void;

  register(p: SuperAppPlugin) {
    if (!p?.name) throw new Error("Plugin must have a name");
    this.map.set(p.name, p);
  }

  get(name: string) {
    return this.map.get(name);
  }

  list() {
    return Array.from(this.map.values());
  }
}

export const registry = new Registry();
