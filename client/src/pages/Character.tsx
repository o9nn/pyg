import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Sparkles, Star } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Character() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: character, isLoading } = trpc.characters.get.useQuery({
    id: parseInt(id!),
  });

  const createChat = trpc.chats.create.useMutation({
    onSuccess: (data) => {
      setLocation(`/chat/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const toggleStar = trpc.characters.toggleStar.useMutation({
    onSuccess: () => {
      utils.characters.get.invalidate({ id: parseInt(id!) });
    },
  });

  const { data: isStarred } = trpc.characters.isStarred.useQuery(
    { characterId: parseInt(id!) },
    { enabled: isAuthenticated }
  );

  const handleStartChat = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    createChat.mutate({ characterId: parseInt(id!) });
  };

  const handleToggleStar = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    toggleStar.mutate({ characterId: parseInt(id!) });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Character not found</h2>
          <Link href="/explore">
            <Button>Browse Characters</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
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
            <Link href="/explore">
              <Button variant="ghost">Back to Explore</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="grid md:grid-cols-[300px_1fr] gap-6">
                <div className="aspect-square md:aspect-auto relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  {character.avatarUrl ? (
                    <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-24 h-24 text-primary/40" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
                  <p className="text-muted-foreground mb-6">{character.description}</p>

                  <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      <span>{character.starCount} stars</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{character.chatCount} chats</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-6">
                    <Button onClick={handleStartChat} disabled={createChat.isPending} className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                    <Button variant={isStarred ? "default" : "outline"} onClick={handleToggleStar} disabled={toggleStar.isPending}>
                      <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {character.personality && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Personality</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.personality}</p>
                    </div>
                  )}

                  {character.scenario && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Scenario</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.scenario}</p>
                    </div>
                  )}

                  {character.firstMessage && (
                    <div>
                      <h3 className="font-semibold mb-2">First Message</h3>
                      <div className="bg-muted/50 rounded-lg p-4 text-sm">{character.firstMessage}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
