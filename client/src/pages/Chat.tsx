import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Send, Sparkles, Loader2, ArrowLeft, Brain, Zap, Heart,
  Eye, MessageCircle, Shuffle, Settings2, ChevronDown,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

// NNECCO trait display helpers
const TRAIT_ICONS: Record<string, React.ReactNode> = {
  playfulness: <Sparkles className="w-3 h-3" />,
  intelligence: <Brain className="w-3 h-3" />,
  chaotic: <Zap className="w-3 h-3" />,
  empathy: <Heart className="w-3 h-3" />,
  sarcasm: <MessageCircle className="w-3 h-3" />,
  selfAwareness: <Eye className="w-3 h-3" />,
};

const FRAME_LABELS: Record<string, string> = {
  strategy: "Strategy",
  play: "Play",
  chaos: "Chaos",
  social: "Social",
  learning: "Learning",
};

function TraitBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-muted-foreground">{icon}</span>
      <span className="w-16 truncate text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-6 text-right font-mono text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showTraits, setShowTraits] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: chat } = trpc.chats.get.useQuery({ id: parseInt(id!) });
  const { data: messages, refetch: refetchMessages } = trpc.chats.getMessages.useQuery({
    chatId: parseInt(id!),
  });
  const { data: character } = trpc.characters.get.useQuery(
    { id: chat?.characterId ?? 0 },
    { enabled: !!chat?.characterId }
  );

  // Parse NNECCO traits and frame from character
  const traits = character?.traits ? (() => { try { return JSON.parse(character.traits); } catch { return null; } })() : null;
  const frame = character?.frame ? (() => { try { return JSON.parse(character.frame); } catch { return null; } })() : null;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, scrollToBottom]);

  const triggerAIResponse = async (userMessage: string) => {
    setIsStreaming(true);
    setStreamingMessage("");

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: parseInt(id!), userMessage }),
      });

      if (!response.ok) throw new Error("Failed to start streaming");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response body");

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

  const handleSend = async () => {
    if (!message.trim() || isStreaming) return;
    const userMsg = message.trim();
    setMessage("");

    // Save user message via tRPC, then trigger streaming
    try {
      await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId: parseInt(id!), userMessage: userMsg }),
      }).then(async (response) => {
        if (!response.ok) throw new Error("Failed to start streaming");

        // Refetch to show user message immediately
        await refetchMessages();

        setIsStreaming(true);
        setStreamingMessage("");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) throw new Error("No response body");

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
      });
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
      setIsStreaming(false);
      setStreamingMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [message]);

  if (!chat || !character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading conversation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 z-50 flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/character/${character.id}`}>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                    {character.avatarUrl ? (
                      <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm leading-tight">{character.name}</h2>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {frame && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {FRAME_LABELS[frame.primary] || frame.primary}
                        </Badge>
                      )}
                      <span className="text-green-500">Active</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {traits && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTraits(!showTraits)}
                  className="text-xs gap-1"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">NNECCO</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${showTraits ? "rotate-180" : ""}`} />
                </Button>
              )}
            </div>
          </div>

          {/* Collapsible NNECCO Traits Panel */}
          {showTraits && traits && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(traits).map(([key, value]) => (
                  <TraitBar
                    key={key}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={value as number}
                    icon={TRAIT_ICONS[key] || <Brain className="w-3 h-3" />}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          <div className="space-y-4">
            {messages?.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-2.5 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0 mt-1">
                      {character.avatarUrl ? (
                        <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-primary/60" />
                        </div>
                      )}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border/50 rounded-bl-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming message */}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="flex gap-2.5 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0 mt-1">
                    {character.avatarUrl ? (
                      <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card border border-border/50">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{streamingMessage}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary/60">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>generating</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isStreaming && !streamingMessage && (
              <div className="flex justify-start">
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0 mt-1">
                    {character.avatarUrl ? (
                      <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card border border-border/50">
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <div className="border-t border-border/40 bg-background/95 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-3 max-w-3xl">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${character.name}...`}
                disabled={isStreaming}
                className="min-h-[44px] max-h-[200px] resize-none pr-12 rounded-xl"
                rows={1}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isStreaming}
              size="sm"
              className="h-[44px] w-[44px] rounded-xl flex-shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-1.5">
            Powered by Aphrodite Engine with NNECCO cognitive architecture
          </p>
        </div>
      </div>
    </div>
  );
}
