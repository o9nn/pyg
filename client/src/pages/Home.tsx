import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { MessageSquare, Sparkles, Users, Zap } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
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
                  <span className="text-sm text-muted-foreground">
                    {user?.name}
                  </span>
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
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-background -z-10" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(120,119,198,0.3),transparent_50%)] -z-10" />
          
          <div className="container mx-auto px-4 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Chat with AI Characters
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Engage in unrestricted conversations with AI characters. Create, customize, and share your own characters with the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8">
                    Explore Characters
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

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Tailored Chat</h3>
                <p className="text-muted-foreground">
                  Chat with any character you want, without limits. Customize conversation styles and parameters.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Open Platform</h3>
                <p className="text-muted-foreground">
                  Browse characters made by passionate creators. Make your own and share with the community.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Unrestricted Models</h3>
                <p className="text-muted-foreground">
                  Powered by advanced AI models with no restrictions on content or creativity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start chatting?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users creating and chatting with AI characters
            </p>
            <Link href="/explore">
              <Button size="lg" className="text-lg px-8">
                Browse Characters
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. An open-source AI chat platform.</p>
        </div>
      </footer>
    </div>
  );
}
