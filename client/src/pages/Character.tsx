import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  MessageSquare, Sparkles, Star, Brain, Heart, Zap, Eye,
  MessageCircle, Shuffle, ArrowLeft, BookOpen, Gamepad2, Swords, Users,
} from "lucide-react";
import { useLocation, useParams } from "wouter";
import { Link } from "wouter";
import { toast } from "sonner";

// NNECCO types
const TRAIT_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  playfulness: { label: "Playfulness", icon: <Sparkles className="w-3.5 h-3.5" />, color: "text-yellow-500" },
  intelligence: { label: "Intelligence", icon: <Brain className="w-3.5 h-3.5" />, color: "text-blue-500" },
  chaotic: { label: "Chaotic", icon: <Zap className="w-3.5 h-3.5" />, color: "text-purple-500" },
  empathy: { label: "Empathy", icon: <Heart className="w-3.5 h-3.5" />, color: "text-red-500" },
  sarcasm: { label: "Sarcasm", icon: <MessageCircle className="w-3.5 h-3.5" />, color: "text-orange-500" },
  selfAwareness: { label: "Self-Awareness", icon: <Eye className="w-3.5 h-3.5" />, color: "text-cyan-500" },
};

const FRAME_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  strategy: { label: "Strategy", icon: <Swords className="w-4 h-4" />, description: "Long-term thinking, optimization, tactical analysis" },
  play: { label: "Play", icon: <Gamepad2 className="w-4 h-4" />, description: "Exploration, creativity, experimentation" },
  chaos: { label: "Chaos", icon: <Shuffle className="w-4 h-4" />, description: "Unpredictability, assumption-breaking, edge cases" },
  social: { label: "Social", icon: <Users className="w-4 h-4" />, description: "Relationship building, emotional resonance" },
  learning: { label: "Learning", icon: <BookOpen className="w-4 h-4" />, description: "Knowledge acquisition, pattern recognition" },
};

function TraitBar({ traitKey, value }: { traitKey: string; value: number }) {
  const meta = TRAIT_META[traitKey];
  if (!meta) return null;
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <span className={`${meta.color} flex-shrink-0`}>{meta.icon}</span>
      <span className="text-xs w-24 truncate">{meta.label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right text-muted-foreground">{value.toFixed(1)}</span>
    </div>
  );
}

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

  // Parse NNECCO data
  const traits = character?.traits ? (() => { try { return JSON.parse(character.traits); } catch { return null; } })() : null;
  const frame = character?.frame ? (() => { try { return JSON.parse(character.frame); } catch { return null; } })() : null;
  const tags: string[] = character?.tags ? (() => { try { return JSON.parse(character.tags); } catch { return []; } })() : [];

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
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">Loading character...</span>
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
            <div className="flex items-center gap-3">
              <Link href="/explore">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">{APP_TITLE}</span>
                </div>
              </Link>
            </div>
            <Link href="/explore">
              <Button variant="ghost">Back to Explore</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-[350px_1fr] gap-8">
            {/* Left Column: Avatar and Actions */}
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                  {character.avatarUrl ? (
                    <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Sparkles className="w-24 h-24 text-primary/30" />
                    </div>
                  )}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button onClick={handleStartChat} disabled={createChat.isPending} className="flex-1" size="lg">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
                <Button
                  variant={isStarred ? "default" : "outline"}
                  onClick={handleToggleStar}
                  disabled={toggleStar.isPending}
                  size="lg"
                >
                  <Star className={`w-4 h-4 ${isStarred ? "fill-current" : ""}`} />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground justify-center">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>{character.starCount} stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{character.chatCount} chats</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{character.viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Right Column: Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{character.name}</h1>
                <p className="text-lg text-muted-foreground">{character.description}</p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* NNECCO Cognitive Architecture Panel */}
              {(traits || frame) && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      NNECCO Cognitive Architecture
                    </h3>

                    {/* Cognitive Frame */}
                    {frame && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Cognitive Frame</p>
                        <div className="flex items-center gap-2">
                          {FRAME_META[frame.primary] && (
                            <Badge variant="default" className="gap-1">
                              {FRAME_META[frame.primary].icon}
                              {FRAME_META[frame.primary].label}
                            </Badge>
                          )}
                          {frame.secondary && FRAME_META[frame.secondary] && (
                            <>
                              <span className="text-muted-foreground text-xs">+</span>
                              <Badge variant="outline" className="gap-1">
                                {FRAME_META[frame.secondary].icon}
                                {FRAME_META[frame.secondary].label}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Personality Traits */}
                    {traits && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Personality Traits</p>
                        <div className="space-y-2.5">
                          {Object.entries(traits).map(([key, value]) => (
                            <TraitBar key={key} traitKey={key} value={value as number} />
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Personality Description */}
              {character.personality && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2">Personality</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.personality}</p>
                  </CardContent>
                </Card>
              )}

              {/* Scenario */}
              {character.scenario && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2">Scenario</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{character.scenario}</p>
                  </CardContent>
                </Card>
              )}

              {/* First Message Preview */}
              {character.firstMessage && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-2">First Message</h3>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex-shrink-0">
                          {character.avatarUrl ? (
                            <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-primary/60" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1">{character.name}</p>
                          <p className="text-sm whitespace-pre-wrap">{character.firstMessage}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
