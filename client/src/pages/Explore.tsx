import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  MessageSquare, Search, Sparkles, Star, Brain, Eye,
  Plus, TrendingUp, Clock, Flame,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

export default function Explore() {
  const { user, isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: characters, isLoading } = trpc.characters.list.useQuery({
    sortBy,
    limit: 50,
  });

  // Client-side search filtering
  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    if (!searchQuery.trim()) return characters;
    const q = searchQuery.toLowerCase();
    return characters.filter(
      (c: any) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }, [characters, searchQuery]);

  const sortOptions = [
    { key: "recent" as const, label: "Recent", icon: <Clock className="w-3.5 h-3.5" /> },
    { key: "popular" as const, label: "Popular", icon: <Star className="w-3.5 h-3.5" /> },
    { key: "trending" as const, label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
  ];

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
            <nav className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link href="/create">
                    <Button size="sm" className="gap-1.5">
                      <Plus className="w-4 h-4" />
                      Create
                    </Button>
                  </Link>
                  <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">Sign In</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Search and Sort Controls */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search characters..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
              {sortOptions.map((opt) => (
                <Button
                  key={opt.key}
                  variant={sortBy === opt.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(opt.key)}
                  className="gap-1.5 text-xs"
                >
                  {opt.icon}
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-3">
                  <div className="h-5 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCharacters.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredCharacters.length} character{filteredCharacters.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredCharacters.map((character: any) => {
                const charTraits = character.traits
                  ? (() => { try { return JSON.parse(character.traits); } catch { return null; } })()
                  : null;
                const charFrame = character.frame
                  ? (() => { try { return JSON.parse(character.frame); } catch { return null; } })()
                  : null;

                return (
                  <Link key={character.id} href={`/character/${character.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group hover:border-primary/30">
                      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                        {character.avatarUrl ? (
                          <img
                            src={character.avatarUrl}
                            alt={character.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        {/* NNECCO Badge */}
                        {charTraits && (
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 gap-0.5">
                              <Brain className="w-2.5 h-2.5" />
                              NNECCO
                            </Badge>
                          </div>
                        )}
                        {/* Frame Badge */}
                        {charFrame && (
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.5 capitalize">
                              {charFrame.primary}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm truncate">{character.name}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 min-h-[2rem]">
                          {character.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3" />
                            {character.starCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" />
                            {character.chatCount}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" />
                            {character.viewCount}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No matches found" : "No characters yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `Try a different search term`
                : "Be the first to create a character!"}
            </p>
            {!searchQuery && (
              isAuthenticated ? (
                <Link href="/create">
                  <Button className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    Create Character
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>Sign In to Create</Button>
                </a>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
