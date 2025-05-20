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
  // Add a ref to track if a request has been cancelled
  const isCancelled = useRef(false);
  // Add a ref to track the current controller for AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to stop the current response generation
  const stopResponseGeneration = useCallback(() => {
    if (isLoading && abortControllerRef.current) {
      console.log("Stopping AI response generation");
      isCancelled.current = true;
      abortControllerRef.current.abort();
      
      // Finalize the current response if there is one
      if (responseBuffer.current) {
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: responseBuffer.current + " [Response stopped by user]",
          timestamp: Date.now(),
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update the conversation if it exists
        if (conversation) {
          const updatedMessages = [...messages, assistantMessage];
          chatService.updateConversationMessages(conversation.id, updatedMessages)
            .catch(err => console.error("Failed to save stopped message:", err));
        }
        
        // Clear the response buffer
        setCurrentResponse("");
        responseBuffer.current = "";
      }
      
      // Reset loading state
      setIsLoading(false);
    }
  }, [isLoading, conversation, messages]);

  const loadConversation = useCallback(async () => {
    try {
      console.log(`Loading conversation for model ${modelId}`);
      setIsLoading(true);
      
      // Use the method to get or create an active conversation
      const activeConversation = await chatService.getOrCreateActiveConversation(modelId);
      console.log(`Got conversation with ${activeConversation.messages.length} messages`);
      
      setConversation(activeConversation);
      setMessages(activeConversation.messages);
      setError(null);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setError("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  }, [modelId]);

  // Load conversation on mount and when model changes
  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Function to manually refresh the conversation
  const refreshConversation = useCallback(async () => {
    try {
      console.log("Manually refreshing conversation");
      if (conversation) {
        // Get the fresh conversation data
        const refreshedConversation = await chatService.getConversation(conversation.id);
        if (refreshedConversation) {
          console.log(`Refreshed conversation with ${refreshedConversation.messages.length} messages`);
          setConversation(refreshedConversation);
          setMessages(refreshedConversation.messages);
        } else {
          // If conversation was deleted, load a new one
          await loadConversation();
        }
      } else {
        // If no conversation loaded yet, do a full load
        await loadConversation();
      }
      setError(null);
    } catch (err) {
      console.error("Failed to refresh conversation:", err);
      setError("Failed to refresh conversation");
    }
  }, [conversation, loadConversation]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversation || !content.trim()) return;

      setIsLoading(true);
      setCurrentResponse("");
      setError(null);
      responseBuffer.current = "";
      isCancelled.current = false;
      
      // Create a new AbortController for this request
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      try {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: content.trim(),
          timestamp: Date.now(),
        };

        // Update local state immediately for better UX
        setMessages((prev) => [...prev, userMessage]);

        // Send the message via the service, which will persist it
        await chatService.sendMessage(
          conversation.id, 
          content, 
          (token) => {
            if (!isCancelled.current) {
              responseBuffer.current += token;
              setCurrentResponse(responseBuffer.current);
            }
          },
          signal
        );

        // If we haven't been cancelled, finalize the response
        if (!isCancelled.current) {
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
          
          // Refresh conversation to ensure we have the latest persisted state
          setTimeout(() => refreshConversation(), 300);
        }
      } catch (err) {
        // Check if this was a cancellation
        if (isCancelled.current) {
          console.log("Message processing was cancelled by user");
          return;
        }
        
        const errorMessage = err instanceof Error ? err.message : "Failed to send message";
        setError(errorMessage);
        console.error("Failed to send message:", err);
        
        // Refresh to ensure UI state matches persisted state
        setTimeout(() => refreshConversation(), 300);
      } finally {
        // Clean up
        abortControllerRef.current = null;
        isCancelled.current = false;
        setIsLoading(false);
      }
    },
    [conversation, refreshConversation],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!conversation) return;

      try {
        // Find the index of the message to delete
        const messageIndex = messages.findIndex((msg) => msg.id === messageId);
        
        if (messageIndex === -1) {
          console.warn(`Message with id ${messageId} not found`);
          return;
        }

        // Make sure it's a user message
        if (messages[messageIndex].role !== 'user') {
          console.warn('Only user messages can be deleted directly');
          return;
        }

        // Check if there's a response message immediately after
        const hasResponseAfter = 
          messageIndex + 1 < messages.length && 
          messages[messageIndex + 1].role === 'assistant';

        // Create a new array of messages excluding the deleted ones
        const updatedMessages = [...messages];
        
        // If there's a response after this message, also remove that
        if (hasResponseAfter) {
          updatedMessages.splice(messageIndex, 2);
        } else {
          updatedMessages.splice(messageIndex, 1);
        }

        // Update the conversation in the service
        await chatService.updateConversationMessages(conversation.id, updatedMessages);
        
        // Update local state
        setMessages(updatedMessages);
      } catch (err) {
        const errorMessage = 
          err instanceof Error ? err.message : "Failed to delete message";
        setError(errorMessage);
        console.error("Failed to delete message:", err);
        
        // Refresh to ensure UI state matches persisted state
        setTimeout(() => refreshConversation(), 300);
      }
    },
    [conversation, messages, refreshConversation],
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
    deleteMessage,
    clearConversation,
    refreshConversation,
    stopResponseGeneration,
  };
}
