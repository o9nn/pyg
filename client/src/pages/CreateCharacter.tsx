import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

export default function CreateCharacter() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [personality, setPersonality] = useState("");
  const [scenario, setScenario] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  const uploadImage = trpc.upload.image.useMutation();
  const createCharacter = trpc.characters.create.useMutation({
    onSuccess: (data) => {
      toast.success("Character created successfully!");
      setLocation(`/character/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    let avatarUrl = "";

    if (avatarFile) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          const result = await uploadImage.mutateAsync({
            filename: avatarFile.name,
            contentType: avatarFile.type,
            data: base64,
          });
          avatarUrl = result.url;

          createCharacter.mutate({
            name,
            description,
            personality,
            scenario: scenario || undefined,
            firstMessage,
            avatarUrl: avatarUrl || undefined,
          });
        };
        reader.readAsDataURL(avatarFile);
        return;
      } catch (error) {
        toast.error("Failed to upload avatar");
        return;
      }
    }

    createCharacter.mutate({
      name,
      description,
      personality,
      scenario: scenario || undefined,
      firstMessage,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-4">You need to sign in to create characters</p>
          <a href={getLoginUrl()}>
            <Button>Sign In</Button>
          </a>
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
              <Button variant="ghost">Cancel</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create Character</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label>Avatar</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-primary/40" />
                      )}
                    </div>
                    <div>
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" id="avatar-upload" />
                      <label htmlFor="avatar-upload">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Character name" required />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the character" rows={3} required />
                </div>

                <div>
                  <Label htmlFor="personality">Personality *</Label>
                  <Textarea id="personality" value={personality} onChange={(e) => setPersonality(e.target.value)} placeholder="Detailed personality traits, speaking style, behaviors..." rows={5} required />
                </div>

                <div>
                  <Label htmlFor="scenario">Scenario</Label>
                  <Textarea id="scenario" value={scenario} onChange={(e) => setScenario(e.target.value)} placeholder="The context or setting for conversations (optional)" rows={3} />
                </div>

                <div>
                  <Label htmlFor="firstMessage">First Message *</Label>
                  <Textarea id="firstMessage" value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} placeholder="The character's opening message to start conversations" rows={3} required />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={createCharacter.isPending || uploadImage.isPending} className="flex-1">
                    {createCharacter.isPending || uploadImage.isPending ? "Creating..." : "Create Character"}
                  </Button>
                  <Link href="/explore">
                    <Button type="button" variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
