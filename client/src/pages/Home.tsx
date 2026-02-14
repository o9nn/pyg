import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  MessageSquare, Sparkles, Users, Zap, Brain, Star,
  Shield, Cpu, ArrowRight, ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: trendingCharacters } = trpc.characters.list.useQuery({
    sortBy: "trending",
    limit: 4,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/explore">
                <Button variant="ghost">Explore</Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/create">
                    <Button variant="ghost">Create</Button>
                  </Link>
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>Sign In</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-background -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.15),transparent_60%)] -z-10" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />

          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm mb-6">
                <Brain className="w-4 h-4" />
                <span>Powered by NNECCO Cognitive Architecture</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-secondary bg-clip-text text-transparent leading-tight">
                AI Characters with
                <br />
                Real Personality
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create and chat with AI characters that have genuine cognitive depth. Powered by Aphrodite Engine and the NNECCO personality system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8 gap-2">
                    Explore Characters
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <Link href="/create">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Create Character
                    </Button>
                  </Link>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Get Started
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Trending Characters */}
        {trendingCharacters && trendingCharacters.length > 0 && (
          <section className="py-16 bg-card/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Trending Characters</h2>
                <Link href="/explore">
                  <Button variant="ghost" className="gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {trendingCharacters.map((character: any) => (
                  <Link key={character.id} href={`/character/${character.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group hover:border-primary/30">
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                        {character.avatarUrl ? (
                          <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm truncate">{character.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{character.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Star className="w-3 h-3" />{character.starCount}</span>
                          <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{character.chatCount}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Built Different
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Not just another chatbot. A cognitive architecture that gives AI characters genuine personality depth.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">NNECCO Personality</h3>
                  <p className="text-sm text-muted-foreground">
                    Six-dimensional personality traits that influence generation parameters in real-time. Characters that actually feel different.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Aphrodite Engine</h3>
                  <p className="text-sm text-muted-foreground">
                    High-performance inference with PagedAttention, speculative decoding, and quantization. Fast, uncensored responses.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Cognitive Frames</h3>
                  <p className="text-sm text-muted-foreground">
                    Characters operate within cognitive frames: strategy, play, chaos, social, or learning. Dynamic engagement modes.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Streaming Chat</h3>
                  <p className="text-sm text-muted-foreground">
                    Real-time SSE streaming for instant, token-by-token responses. No waiting for complete generations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Open Platform</h3>
                  <p className="text-sm text-muted-foreground">
                    Create, share, and discover characters. Community-driven with stars, trending, and creator profiles.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Self-Hosted</h3>
                  <p className="text-sm text-muted-foreground">
                    Run your own instance with Docker Compose. Full control over your data, models, and inference configuration.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-b from-background to-card/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to create your first character?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Design AI characters with genuine personality depth using the NNECCO cognitive architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/explore">
                <Button size="lg" className="text-lg px-8">
                  Browse Characters
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link href="/create">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Create Character
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Sign Up Free
                  </Button>
                </a>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold">{APP_TITLE}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              An open-source AI character platform. Powered by Aphrodite Engine and NNECCO.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="https://github.com/o9nn/pyg" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
