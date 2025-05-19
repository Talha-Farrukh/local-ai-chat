import AsyncStorage from '@react-native-async-storage/async-storage';
import { initLlama, releaseAllLlama } from 'llama.rn';
import { Conversation, Message, ModelContext } from '../types/app.types';
import { ModelService } from './model.service';

const CONVERSATIONS_STORAGE_KEY = '@local_ai_chat/conversations';

export class ChatService {
  private static instance: ChatService;
  private conversations: Map<string, Conversation> = new Map();
  private activeContext: ModelContext | null = null;
  private activeModelId: string | null = null;

  private constructor() {
    this.loadConversations();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private async loadConversations() {
    try {
      const stored = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (stored) {
        const conversations = JSON.parse(stored) as Conversation[];
        conversations.forEach(conv => this.conversations.set(conv.id, conv));
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }

  private async saveConversations() {
    try {
      const conversations = Array.from(this.conversations.values());
      await AsyncStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  async loadModel(modelId: string): Promise<void> {
    if (this.activeModelId === modelId && this.activeContext) {
      return;
    }

    const modelService = ModelService.getInstance();
    const modelPath = await modelService.getModelPath(modelId);

    if (!modelPath) {
      throw new Error('Model not found');
    }

    if (this.activeContext) {
      await this.releaseModel();
    }

    try {
      this.activeContext = await initLlama({
        model: modelPath,
        use_mlock: true,
        n_ctx: 2048,
        n_gpu_layers: 1,
      });
      this.activeModelId = modelId;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    }
  }

  async releaseModel(): Promise<void> {
    if (this.activeContext) {
      await releaseAllLlama();
      this.activeContext = null;
      this.activeModelId = null;
    }
  }

  async createConversation(modelId: string, name: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: Date.now().toString(),
      modelId,
      name,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.set(conversation.id, conversation);
    await this.saveConversations();
    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    this.conversations.delete(conversationId);
    await this.saveConversations();
  }

  async getConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  async sendMessage(
    conversationId: string,
    content: string,
    onToken?: (token: string) => void
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (!this.activeContext || this.activeModelId !== conversation.modelId) {
      await this.loadModel(conversation.modelId);
    }

    if (!this.activeContext) {
      throw new Error('Model not loaded');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = Date.now();

    try {
      const stopWords = [
        '</s>',
        '<|end|>',
        'user:',
        'assistant:',
        '<|im_end|>',
        '<|eot_id|>',
      ];

      const result = await this.activeContext.completion(
        {
          messages: conversation.messages,
          n_predict: 10000,
          stop: stopWords,
        },
        onToken ? (data: { token: string }) => onToken(data.token) : undefined
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.text.trim(),
        timestamp: Date.now(),
      };

      conversation.messages.push(assistantMessage);
      conversation.updatedAt = Date.now();
      await this.saveConversations();
    } catch (error) {
      console.error('Failed to get model response:', error);
      throw error;
    }
  }
} 