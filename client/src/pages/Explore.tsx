import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Search, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Explore() {
  const { user, isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending'>('recent');
  
  const { data: characters, isLoading } = trpc.characters.list.useQuery({
    sortBy,
    limit: 50,
  });

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
            <nav className="flex items-center gap-4">
              <Link href="/explore">
                <Button variant="ghost">Explore</Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/create">
                    <Button variant="default">Create</Button>
                  </Link>
                  <span className="text-sm text-muted-foreground">{user?.name}</span>
                </>
              ) : (
                <a href={getLoginUrl()}><Button>Sign In</Button></a>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search characters..." className="pl-10" />
            </div>
            <div className="flex gap-2">
              <Button variant={sortBy === 'recent' ? 'default' : 'outline'} onClick={() => setSortBy('recent')}>Recent</Button>
              <Button variant={sortBy === 'popular' ? 'default' : 'outline'} onClick={() => setSortBy('popular')}>Popular</Button>
              <Button variant={sortBy === 'trending' ? 'default' : 'outline'} onClick={() => setSortBy('trending')}>Trending</Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="p-4">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : characters && characters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character: any) => (
              <Link key={character.id} href={`/character/${character.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                    {character.avatarUrl ? (
                      <img src={character.avatarUrl} alt={character.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{character.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{character.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Star className="w-3 h-3" /><span>{character.starCount}</span></div>
                      <div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /><span>{character.chatCount}</span></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No characters found</h3>
            <p className="text-muted-foreground mb-6">Be the first to create a character!</p>
            {isAuthenticated ? (
              <Link href="/create"><Button>Create Character</Button></Link>
            ) : (
              <a href={getLoginUrl()}><Button>Sign In to Create</Button></a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
