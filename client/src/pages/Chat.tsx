import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Send, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat } = trpc.chats.get.useQuery({ id: parseInt(id!) });
  const { data: messages, refetch: refetchMessages } = trpc.chats.getMessages.useQuery({
    chatId: parseInt(id!),
  });
  const { data: character } = trpc.characters.get.useQuery(
    { id: chat?.characterId ?? 0 },
    { enabled: !!chat?.characterId }
  );

  const sendMessage = trpc.chats.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      refetchMessages();
      // TODO: Trigger AI response via streaming endpoint
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
  }, [messages]);

  const handleSend = () => {
    if (!message.trim()) return;
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
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!message.trim() || sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
