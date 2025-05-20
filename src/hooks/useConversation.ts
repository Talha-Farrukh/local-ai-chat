import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, Message } from "../types/app.types";
import { ChatService } from "../lib/chat.service";

export function useConversation(modelId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState("");
  const responseBuffer = useRef("");
  const chatService = ChatService.getInstance();

  const loadConversation = useCallback(async () => {
    try {
      const conversations = await chatService.getConversations();
      const existingConversation = conversations.find(
        (c) => c.modelId === modelId,
      );

      if (existingConversation) {
        setConversation(existingConversation);
        setMessages(existingConversation.messages);
      } else {
        const newConversation = await chatService.createConversation(
          modelId,
          "New Chat",
        );
        setConversation(newConversation);
        setMessages(newConversation.messages);
      }
      setError(null);
    } catch (err) {
      setError("Failed to load conversation");
      console.error("Failed to load conversation:", err);
    }
  }, [modelId]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation || !content.trim()) return;

      setIsLoading(true);
      setCurrentResponse("");
      setError(null);
      responseBuffer.current = "";

      try {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, userMessage]);

        await chatService.sendMessage(conversation.id, content, (token) => {
          responseBuffer.current += token;
          setCurrentResponse(responseBuffer.current);
        });

        // Small delay to ensure the final response is complete
        await new Promise((resolve) => setTimeout(resolve, 100));

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseBuffer.current,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setCurrentResponse("");
        responseBuffer.current = "";
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Failed to send message:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [conversation],
  );

  const clearConversation = useCallback(async () => {
    if (!conversation) return;

    try {
      await chatService.deleteConversation(conversation.id);
      await loadConversation();
      setError(null);
      setCurrentResponse("");
      responseBuffer.current = "";
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to clear conversation";
      setError(errorMessage);
      console.error("Failed to clear conversation:", err);
    }
  }, [conversation, loadConversation]);

  return {
    conversation,
    messages,
    isLoading,
    error,
    currentResponse,
    sendMessage,
    clearConversation,
  };
}
