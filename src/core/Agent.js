import { ToolRegistry } from './ToolRegistry.js';
import { ContextManager } from './ContextManager.js';
import { GroqProvider } from '../llm/GroqProvider.js';
import { PromptBuilder } from '../llm/PromptBuilder.js';
import { ConversationMemory } from '../memory/ConversationMemory.js';
import { PersistentMemory } from '../memory/PersistentMemory.js';
import { RateLimiter } from '../services/RateLimiter.js';
import { registerAllTools } from '../tools/index.js';
import { config } from '../config/index.js';

const CONFIRM_WORDS = new Set(['yes', 'yeah', 'yep', 'confirm', 'do it', 'proceed', 'ok', 'okay', 'naam', 'oui', '3ayech', '3lah']);

function isConfirming(content) {
  const lower = content.toLowerCase().trim();
  return CONFIRM_WORDS.has(lower) || CONFIRM_WORDS.has(lower.replace(/[.!?]+$/, ''));
}

export class Agent {
  constructor() {
    this.toolRegistry = new ToolRegistry();
    registerAllTools(this.toolRegistry);

    this.contextManager = new ContextManager();
    this.llm = new GroqProvider(config.groq.apiKey, config.groq.model);
    this.promptBuilder = new PromptBuilder();
    this.conversationMemory = new ConversationMemory();
    this.persistentMemory = new PersistentMemory();
    this.rateLimiter = new RateLimiter();
  }

  async processMessage(message) {
    if (!this.rateLimiter.check(message.author.id)) {
      return 'Please slow down.';
    }

    const context = this.contextManager.buildContext(message, this.conversationMemory, this.persistentMemory);
    const pending = this.contextManager.getPending(message.author.id);
    const toolDefs = this.toolRegistry.getDefinitions();

    const systemPrompt = this.promptBuilder.buildSystemPrompt(toolDefs);
    const userPrompt = this.promptBuilder.buildUserMessage(context, message.content, pending);

    let llmResponse;
    try {
      llmResponse = await this.llm.generate(systemPrompt, [{ role: 'user', content: userPrompt }]);
    } catch (error) {
      console.error('[Agent] LLM error:', error.message);
      return 'I had trouble processing that. Try again in a moment.';
    }

    const handled = await this.handleResponse(llmResponse, context, message, pending);
    return handled;
  }

  async handleResponse(response, context, message, pending) {
    if (!response || !response.type) {
      return "I'm not sure I understood. Could you rephrase that?";
    }

    switch (response.type) {
      case 'chat':
        this.conversationMemory.add(message.author.id, 'user', message.content);
        this.conversationMemory.add(message.author.id, 'assistant', response.message);
        this.contextManager.clearPending(message.author.id);
        return response.message;

      case 'tool':
        return this.executeTool(response, context, message, pending);

      case 'clarify':
        this.contextManager.setPending(message.author.id, {
          question: response.question,
          suggestions: response.suggestions || [],
          context: message.content,
        });
        this.conversationMemory.add(message.author.id, 'user', message.content);
        this.conversationMemory.add(message.author.id, 'assistant', response.question);
        return response.question;

      default:
        return "I'm not sure I understood. Could you rephrase that?";
    }
  }

  async executeTool(response, context, message, pending) {
    const toolName = response.tool;
    const args = response.arguments || {};

    const tool = this.toolRegistry.get(toolName);
    if (!tool) {
      const fuzzy = this.toolRegistry.findByName(toolName);
      if (fuzzy) {
        return this.handleToolWithPerms(fuzzy, args, context, message);
      }
      return `I don't have a tool for that.`;
    }

    return this.handleToolWithPerms(tool, args, context, message);
  }

  async handleToolWithPerms(tool, args, context, message) {
    const permCheck = tool.canExecute(context);
    if (!permCheck.allowed) {
      return permCheck.reason;
    }

    if (tool.dangerous) {
      const pending = this.contextManager.getPending(message.author.id);
      if (pending && pending.toolName === tool.name && isConfirming(message.content)) {
        this.contextManager.clearPending(message.author.id);
        return this.runTool(tool, context, message, args);
      }
      this.contextManager.setPending(message.author.id, {
        question: `Are you sure you want to ${tool.description.toLowerCase()}? Reply with "yes" or "confirm" to proceed.`,
        toolName: tool.name,
        args: args,
      });
      return `Are you sure? Reply with **yes** or **confirm** to proceed.`;
    }

    return this.runTool(tool, context, message, args);
  }

  async runTool(tool, context, message, args) {
    try {
      const result = await tool.execute(context, args);
      this.conversationMemory.add(message.author.id, 'user', message.content);
      const reply = result.message || 'Done.';
      this.conversationMemory.add(message.author.id, 'assistant', reply);
      if (result.success) {
        this.persistentMemory.addMemory(message.author.id, `Used ${tool.name}`);
      }
      return reply;
    } catch (error) {
      console.error(`[Agent] Tool ${tool.name} error:`, error);
      return `Error: ${error.message}`;
    }
  }

  getToolCount() {
    return this.toolRegistry.count();
  }
}
