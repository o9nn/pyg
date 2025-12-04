import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const { data: chat } = trpc.chats.get.useQuery({ id: parseInt(id!) });
  const { data: messages, refetch: refetchMessages } = trpc.chats.getMessages.useQuery({
    chatId: parseInt(id!),
  });
  const { data: character } = trpc.characters.get.useQuery(
    { id: chat?.characterId ?? 0 },
    { enabled: !!chat?.characterId }
  );

  const sendMessage = trpc.chats.sendMessage.useMutation({
    onSuccess: async (data) => {
      setMessage("");
      await refetchMessages();
      // Trigger AI response via streaming endpoint
      triggerAIResponse(data.content);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const triggerAIResponse = async (userMessage: string) => {
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: parseInt(id!),
          userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start streaming");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.chunk) {
                setStreamingMessage((prev) => prev + data.chunk);
              } else if (data.done) {
                setIsStreaming(false);
                setStreamingMessage("");
                await refetchMessages();
              } else if (data.error) {
                toast.error(data.error);
                setIsStreaming(false);
                setStreamingMessage("");
              }
            } catch (e) {
              console.error("Failed to parse SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      toast.error("Failed to get AI response");
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  const handleSend = () => {
    if (!message.trim() || isStreaming) return;
    sendMessage.mutate({
      chatId: parseInt(id!),
      content: message.trim(),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!chat || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">{APP_TITLE}</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href={`/character/${character.id}`}>
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                  {character.avatarUrl && (
                    <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover" />
                  )}
                  <span className="font-semibold">{character.name}</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-4">
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <Card className={`max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      {msg.role === "assistant" && character.avatarUrl && (
                        <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">
                          {msg.role === "user" ? user?.name : character.name}
                        </p>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
            
            {/* Streaming message display */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-card">
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      {character.avatarUrl && (
                        <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">{character.name}</p>
                        <p className="whitespace-pre-wrap">{streamingMessage}</p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            {/* Typing indicator when no content yet */}
            {isStreaming && !streamingMessage && (
              <div className="flex justify-start">
                <Card className="max-w-[80%] bg-card">
                  <div className="p-4">
                    <div className="flex items-start gap-2">
                      {character.avatarUrl && (
                        <img src={character.avatarUrl} alt={character.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold mb-1">{character.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      <div className="border-t border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sendMessage.isPending || isStreaming}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!message.trim() || sendMessage.isPending || isStreaming}
            >
              {sendMessage.isPending || isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
