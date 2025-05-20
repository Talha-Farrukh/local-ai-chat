import AsyncStorage from "@react-native-async-storage/async-storage";
import { initLlama, releaseAllLlama } from "llama.rn";
import { Conversation, Message, ModelContext } from "../types/app.types";
import { ModelService } from "./model.service";

const CONVERSATIONS_STORAGE_KEY = "@local_ai_chat/conversations";
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export class ChatService {
  private static instance: ChatService;
  private conversations: Map<string, Conversation> = new Map();
  private activeContext: ModelContext | null = null;
  private activeModelId: string | null = null;
  private initialized: boolean = false;

  private constructor() {
    // We'll initialize asynchronously to ensure data is loaded
    this.initialize();
  }

  private async initialize() {
    await this.loadConversations();
    this.initialized = true;
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private async loadConversations() {
    try {
      console.log("Loading conversations from storage");
      const stored = await AsyncStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (stored) {
        const conversations = JSON.parse(stored) as Conversation[];
        console.log(`Loaded ${conversations.length} conversations`);

        // Clear existing conversations before loading new ones
        this.conversations.clear();

        // Add all conversations to the map
        conversations.forEach((conv) => {
          this.conversations.set(conv.id, conv);
          console.log(
            `Loaded conversation ${conv.id} with ${conv.messages.length} messages`,
          );
        });
      } else {
        console.log("No conversations found in storage");
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  }

  private async saveConversations() {
    try {
      const conversations = Array.from(this.conversations.values());
      console.log(`Saving ${conversations.length} conversations to storage`);

      // Log details about each conversation being saved
      conversations.forEach((conv) => {
        console.log(
          `Saving conversation ${conv.id} with ${conv.messages.length} messages`,
        );
      });

      await AsyncStorage.setItem(
        CONVERSATIONS_STORAGE_KEY,
        JSON.stringify(conversations),
      );
      console.log("Conversations saved successfully");
    } catch (error) {
      console.error("Failed to save conversations:", error);
    }
  }

  /**
   * Ensure the service is initialized before performing operations
   */
  private async ensureInitialized() {
    if (!this.initialized) {
      console.log("Waiting for initialization to complete");
      await this.loadConversations();
      this.initialized = true;
    }
  }

  async loadModel(modelId: string): Promise<void> {
    if (this.activeModelId === modelId && this.activeContext) {
      return;
    }

    const modelService = ModelService.getInstance();
    const modelPath = await modelService.getModelPath(modelId);

    if (!modelPath) {
      throw new Error("Model not found");
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
      console.error("Failed to load model:", error);
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

  /**
   * Checks if the conversation is older than one day
   */
  public isConversationExpired(conversation: Conversation): boolean {
    const now = Date.now();
    return now - conversation.updatedAt > ONE_DAY_MS;
  }

  /**
   * Gets the current conversation for a model or creates a new one
   */
  async getOrCreateActiveConversation(modelId: string): Promise<Conversation> {
    await this.ensureInitialized();

    // Find any conversation for this model
    const modelConversations = Array.from(this.conversations.values())
      .filter((c) => c.modelId === modelId)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    // Always use the most recent conversation (no expiration for now)
    const latestConversation = modelConversations[0];

    if (latestConversation) {
      console.log(
        `Using existing conversation ${latestConversation.id} with ${latestConversation.messages.length} messages`,
      );

      // Preload the model for this conversation for better UX
      this.loadModel(modelId).catch((err) => {
        console.error("Failed to preload model:", err);
      });

      return latestConversation;
    }

    // Create a new conversation if none exists
    console.log("Creating new conversation for model", modelId);
    const dateStr = new Date().toLocaleDateString();
    const newConversation = await this.createConversation(
      modelId,
      `Chat - ${dateStr}`,
    );

    return newConversation;
  }

  async createConversation(
    modelId: string,
    name: string,
  ): Promise<Conversation> {
    await this.ensureInitialized();

    const conversation: Conversation = {
      id: Date.now().toString(),
      modelId,
      name,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.conversations.set(conversation.id, conversation);
    console.log(
      `Created new conversation ${conversation.id} for model ${modelId}`,
    );
    await this.saveConversations();
    return conversation;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.ensureInitialized();

    this.conversations.delete(conversationId);
    console.log(`Deleted conversation ${conversationId}`);
    await this.saveConversations();
  }

  async getConversations(): Promise<Conversation[]> {
    await this.ensureInitialized();

    return Array.from(this.conversations.values());
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    await this.ensureInitialized();

    return this.conversations.get(conversationId) || null;
  }

  async updateConversationMessages(
    conversationId: string,
    messages: Message[],
  ): Promise<void> {
    await this.ensureInitialized();

    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    conversation.messages = messages;
    conversation.updatedAt = Date.now();
    console.log(
      `Updated conversation ${conversationId} with ${messages.length} messages`,
    );
    await this.saveConversations();
  }

  async sendMessage(
    conversationId: string,
    content: string,
    onToken?: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    await this.ensureInitialized();

    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // We're not checking for expiration to ensure messages are not lost

    if (!this.activeContext || this.activeModelId !== conversation.modelId) {
      await this.loadModel(conversation.modelId);
    }

    if (!this.activeContext) {
      throw new Error("Model not loaded");
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = Date.now();

    // Save immediately after adding user message
    await this.saveConversations();
    console.log(`Added user message to conversation ${conversationId}`);

    try {
      const stopWords = [
        "</s>",
        "<|end|>",
        "user:",
        "assistant:",
        "<|im_end|>",
        "<|eot_id|>",
      ];

      // Check if we've been aborted before starting the completion
      if (signal?.aborted) {
        throw new Error("Request aborted by user");
      }

      // Add the signal to the completion options if provided
      const completionOptions: any = {
        messages: conversation.messages,
        n_predict: 10000,
        stop: stopWords,
      };

      // Add signal handler to check for aborts
      if (signal) {
        // Monitor the signal for cancellation
        signal.addEventListener("abort", () => {
          console.log("Abort signal received in ChatService");
        });
      }

      const result = await this.activeContext.completion(
        completionOptions,
        onToken ? (data: { token: string }) => onToken(data.token) : undefined,
      );

      // Check if we've been aborted before saving the result
      if (signal?.aborted) {
        throw new Error("Request aborted by user");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.text.trim(),
        timestamp: Date.now(),
      };

      conversation.messages.push(assistantMessage);
      conversation.updatedAt = Date.now();

      // Save again after adding AI response
      await this.saveConversations();
      console.log(`Added AI response to conversation ${conversationId}`);
    } catch (error) {
      // Check if this was an abort error
      if (signal?.aborted) {
        console.log("Request was aborted, not saving error state");
        throw new Error("Request aborted by user");
      }

      console.error("Failed to get model response:", error);
      throw error;
    }
  }

  /**
   * Clean up old conversations (optional utility method)
   * Could be called periodically to remove very old conversations
   */
  async cleanupOldConversations(olderThanDays: number = 7): Promise<void> {
    await this.ensureInitialized();

    const now = Date.now();
    const threshold = now - olderThanDays * ONE_DAY_MS;

    let hasDeleted = false;

    for (const [id, conversation] of this.conversations.entries()) {
      if (conversation.updatedAt < threshold) {
        this.conversations.delete(id);
        hasDeleted = true;
        console.log(`Cleaned up old conversation ${id}`);
      }
    }

    if (hasDeleted) {
      await this.saveConversations();
    }
  }
}
