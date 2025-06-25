import { Agent } from "@/common/types/agent";

export interface PromptContext {
  agents: Agent[];
  capabilities?: string;
  [key: string]: unknown;
}

export interface IPromptTemplate {
  name: string;
  generate: (context: PromptContext) => string;
}

export class PromptRegistry {
  private static instance: PromptRegistry;
  private templates: Map<string, IPromptTemplate> = new Map();

  private constructor() {}

  static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry();
    }
    return PromptRegistry.instance;
  }

  register(template: IPromptTemplate): void {
    this.templates.set(template.name, template);
  }

  registerAll(templates: IPromptTemplate[]): void {
    templates.forEach(template => this.register(template));
  }

  getTemplate(name: string): IPromptTemplate | undefined {
    return this.templates.get(name);
  }

  generatePrompt(name: string, context: PromptContext): string {
    const template = this.getTemplate(name);
    if (!template) {
      throw new Error(`Prompt template "${name}" not found`);
    }
    return template.generate(context);
  }

  generateCombinedPrompt(names: string[], context: PromptContext): string {
    return names
      .map(name => this.generatePrompt(name, context))
      .join('\n\n');
  }
} 