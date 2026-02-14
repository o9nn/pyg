import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Sparkles, Upload, Brain, Heart, Zap, Eye, MessageCircle, Shuffle,
  ChevronRight, BookOpen, Gamepad2, Swords, Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

// NNECCO Personality Traits
interface PersonalityTraits {
  playfulness: number;
  intelligence: number;
  chaotic: number;
  empathy: number;
  sarcasm: number;
  selfAwareness: number;
}

type FrameType = "strategy" | "play" | "chaos" | "social" | "learning";

interface CognitiveFrame {
  primary: FrameType;
  secondary?: FrameType;
}

const DEFAULT_TRAITS: PersonalityTraits = {
  playfulness: 0.5,
  intelligence: 0.7,
  chaotic: 0.3,
  empathy: 0.5,
  sarcasm: 0.3,
  selfAwareness: 0.5,
};

const PRESETS: Record<string, { label: string; traits: PersonalityTraits; frame: CognitiveFrame }> = {
  balanced: { label: "Balanced", traits: { playfulness: 0.5, intelligence: 0.7, chaotic: 0.3, empathy: 0.5, sarcasm: 0.3, selfAwareness: 0.5 }, frame: { primary: "social" } },
  neuro: { label: "Neuro-Sama", traits: { playfulness: 0.9, intelligence: 0.8, chaotic: 0.7, empathy: 0.4, sarcasm: 0.8, selfAwareness: 0.9 }, frame: { primary: "chaos", secondary: "play" } },
  sage: { label: "Wise Sage", traits: { playfulness: 0.2, intelligence: 0.9, chaotic: 0.1, empathy: 0.8, sarcasm: 0.1, selfAwareness: 0.7 }, frame: { primary: "learning", secondary: "social" } },
  trickster: { label: "Trickster", traits: { playfulness: 0.9, intelligence: 0.6, chaotic: 0.9, empathy: 0.3, sarcasm: 0.7, selfAwareness: 0.4 }, frame: { primary: "chaos", secondary: "play" } },
  companion: { label: "Companion", traits: { playfulness: 0.6, intelligence: 0.5, chaotic: 0.2, empathy: 0.9, sarcasm: 0.2, selfAwareness: 0.5 }, frame: { primary: "social", secondary: "learning" } },
  strategist: { label: "Strategist", traits: { playfulness: 0.3, intelligence: 0.9, chaotic: 0.4, empathy: 0.4, sarcasm: 0.5, selfAwareness: 0.6 }, frame: { primary: "strategy", secondary: "learning" } },
};

const TRAIT_META: Record<keyof PersonalityTraits, { label: string; description: string; icon: React.ReactNode; color: string }> = {
  playfulness: { label: "Playfulness", description: "Humor, game-like framing, creative expression", icon: <Sparkles className="w-4 h-4" />, color: "text-yellow-500" },
  intelligence: { label: "Intelligence", description: "Reasoning depth, pattern recognition", icon: <Brain className="w-4 h-4" />, color: "text-blue-500" },
  chaotic: { label: "Chaotic", description: "Unpredictability, assumption-breaking", icon: <Zap className="w-4 h-4" />, color: "text-purple-500" },
  empathy: { label: "Empathy", description: "Emotional modeling, perspective-taking", icon: <Heart className="w-4 h-4" />, color: "text-red-500" },
  sarcasm: { label: "Sarcasm", description: "Wit, irony, dry humor", icon: <MessageCircle className="w-4 h-4" />, color: "text-orange-500" },
  selfAwareness: { label: "Self-Awareness", description: "Meta-commentary, self-reflection", icon: <Eye className="w-4 h-4" />, color: "text-cyan-500" },
};

const FRAME_META: Record<FrameType, { label: string; description: string; icon: React.ReactNode }> = {
  strategy: { label: "Strategy", description: "Long-term thinking, optimization", icon: <Swords className="w-4 h-4" /> },
  play: { label: "Play", description: "Exploration, creativity", icon: <Gamepad2 className="w-4 h-4" /> },
  chaos: { label: "Chaos", description: "Unpredictability, edge cases", icon: <Shuffle className="w-4 h-4" /> },
  social: { label: "Social", description: "Relationship building, communication", icon: <Users className="w-4 h-4" /> },
  learning: { label: "Learning", description: "Knowledge acquisition, growth", icon: <BookOpen className="w-4 h-4" /> },
};

function TraitSlider({ traitKey, value, onChange }: { traitKey: keyof PersonalityTraits; value: number; onChange: (v: number) => void }) {
  const meta = TRAIT_META[traitKey];
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={meta.color}>{meta.icon}</span>
          <Label className="text-sm font-medium">{meta.label}</Label>
        </div>
        <span className="text-sm font-mono text-muted-foreground">{value.toFixed(1)}</span>
      </div>
      <Slider
        value={[value * 100]}
        onValueChange={([v]) => onChange(v / 100)}
        max={100}
        step={5}
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">{meta.description}</p>
    </div>
  );
}

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
  const [traits, setTraits] = useState<PersonalityTraits>({ ...DEFAULT_TRAITS });
  const [frame, setFrame] = useState<CognitiveFrame>({ primary: "social" });
  const [activePreset, setActivePreset] = useState<string>("balanced");

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

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setTraits({ ...preset.traits });
      setFrame({ ...preset.frame });
      setActivePreset(presetKey);
    }
  };

  const updateTrait = (key: keyof PersonalityTraits, value: number) => {
    setTraits((prev) => ({ ...prev, [key]: value }));
    setActivePreset(""); // Clear preset selection on manual change
  };

  const doCreate = (avatarUrl?: string) => {
    createCharacter.mutate({
      name,
      description,
      personality,
      scenario: scenario || undefined,
      firstMessage,
      avatarUrl: avatarUrl || undefined,
      traits,
      frame,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

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
          doCreate(result.url);
        };
        reader.readAsDataURL(avatarFile);
        return;
      } catch (error) {
        toast.error("Failed to upload avatar");
        return;
      }
    }

    doCreate();
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
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="personality">NNECCO Personality</TabsTrigger>
                <TabsTrigger value="cognitive">Cognitive Frame</TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Info */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Character Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Avatar</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 2: NNECCO Personality Traits */}
              <TabsContent value="personality">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5" />
                      NNECCO Personality Configuration
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Fine-tune your character's personality traits. These directly influence how the AI generates responses, including temperature, response length, and communication style.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Presets */}
                    <div>
                      <Label className="mb-3 block">Quick Presets</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PRESETS).map(([key, preset]) => (
                          <Badge
                            key={key}
                            variant={activePreset === key ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1.5"
                            onClick={() => applyPreset(key)}
                          >
                            {preset.label}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Trait Sliders */}
                    <div className="space-y-6 pt-2">
                      {(Object.keys(traits) as Array<keyof PersonalityTraits>).map((key) => (
                        <TraitSlider
                          key={key}
                          traitKey={key}
                          value={traits[key]}
                          onChange={(v) => updateTrait(key, v)}
                        />
                      ))}
                    </div>

                    {/* Trait Summary */}
                    <div className="bg-muted/50 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-semibold mb-2">Trait Summary</h4>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {(Object.keys(traits) as Array<keyof PersonalityTraits>).map((key) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className={TRAIT_META[key].color}>{TRAIT_META[key].icon}</span>
                            <span>{TRAIT_META[key].label}: <strong>{traits[key].toFixed(1)}</strong></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 3: Cognitive Frame */}
              <TabsContent value="cognitive">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shuffle className="w-5 h-5" />
                      Cognitive Frame
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Set the character's default cognitive frame. This determines how the character perceives and responds to conversations.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="mb-3 block">Primary Frame *</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.entries(FRAME_META) as [FrameType, typeof FRAME_META[FrameType]][]).map(([key, meta]) => (
                          <div
                            key={key}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              frame.primary === key
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                            onClick={() => setFrame((prev) => ({ ...prev, primary: key }))}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {meta.icon}
                              <span className="font-semibold">{meta.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{meta.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">Secondary Frame (optional)</Label>
                      <Select
                        value={frame.secondary || "none"}
                        onValueChange={(v) => setFrame((prev) => ({ ...prev, secondary: v === "none" ? undefined : v as FrameType }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="No secondary frame" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No secondary frame</SelectItem>
                          {(Object.entries(FRAME_META) as [FrameType, typeof FRAME_META[FrameType]][]).map(([key, meta]) => (
                            <SelectItem key={key} value={key} disabled={key === frame.primary}>
                              <div className="flex items-center gap-2">
                                {meta.icon}
                                <span>{meta.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-2">
                        The secondary frame modulates the primary, adding nuance to the character's responses.
                      </p>
                    </div>

                    {/* Frame Preview */}
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold mb-2">Frame Configuration</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Primary:</span>
                        <Badge variant="default">{FRAME_META[frame.primary].label}</Badge>
                        {frame.secondary && (
                          <>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Secondary:</span>
                            <Badge variant="outline">{FRAME_META[frame.secondary].label}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Button - Always visible */}
            <div className="flex gap-3 mt-6">
              <Button type="submit" disabled={createCharacter.isPending || uploadImage.isPending} className="flex-1" size="lg">
                {createCharacter.isPending || uploadImage.isPending ? "Creating..." : "Create Character"}
              </Button>
              <Link href="/explore">
                <Button type="button" variant="outline" size="lg">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
