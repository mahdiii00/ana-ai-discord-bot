export class ToolRegistry {
  constructor() {
    this.tools = new Map();
  }

  register(tool) {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name) {
    return this.tools.get(name);
  }

  getAll() {
    return Array.from(this.tools.values());
  }

  getDefinitions() {
    return this.getAll().map(t => t.toDefinition());
  }

  findByName(name) {
    const lower = name.toLowerCase();
    for (const tool of this.tools.values()) {
      if (tool.name.toLowerCase() === lower) return tool;
    }
    for (const tool of this.tools.values()) {
      if (tool.name.toLowerCase().includes(lower)) return tool;
    }
    return null;
  }

  getByCategory(category) {
    return this.getAll().filter(t => t.category === category);
  }

  count() {
    return this.tools.size;
  }
}
