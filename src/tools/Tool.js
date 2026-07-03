export class Tool {
  constructor() {
    this.name = '';
    this.description = '';
    this.parameters = {};
    this.required = [];
    this.dangerous = false;
    this.botPermissions = [];
    this.category = 'general';
  }

  canExecute(context) {
    return { allowed: true, reason: null };
  }

  async execute(context, args) {
    throw new Error(`Tool ${this.name} must implement execute()`);
  }

  toDefinition() {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      required: this.required,
      dangerous: this.dangerous,
      category: this.category,
    };
  }
}
