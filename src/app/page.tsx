import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { WandSparkles, PenTool, Baby, CalendarHeart, CloudMoon, LayoutGrid } from "lucide-react";

export default function HomePage() {
  const features = [
    { title: "Name Interpretation", href: "/name-interpretation", icon: PenTool, description: "Analyze the meaning of your name based on ancient wisdom." },
    { title: "Name Generation", href: "/name-generation", icon: Baby, description: "Find the perfect name for your child, aligned with auspicious principles." },
    { title: "Today's Fortune", href: "/todays-fortune", icon: CalendarHeart, description: "Discover what the day holds for you in various aspects of life." },
    { title: "Dream Interpretation", href: "/dream-interpretation", icon: CloudMoon, description: "Uncover the hidden messages and symbols in your dreams." },
    { title: "Tarot Reading", href: "/tarot-reading", icon: LayoutGrid, description: "Gain insights and guidance on your questions through tarot cards." },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-primary rounded-full mb-4 shadow-lg">
          <WandSparkles className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
          Welcome to Mystic Muse
        </h1>
        <p className="text-lg text-muted-foreground">
          Your guide to understanding the seen and unseen. Explore fortunes, names, dreams, and tarot.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {features.map((feature) => (
          <Card key={feature.href} className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="p-2 bg-secondary rounded-md">
                <feature.icon className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{feature.description}</CardDescription>
              <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                <Link href={feature.href}>Explore</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="text-center py-10 bg-card rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-primary mb-4">Ready to Begin Your Journey?</h2>
        <p className="text-md text-muted-foreground mb-6 max-w-2xl mx-auto">
          Mystic Muse offers a sanctuary for self-discovery and foresight. Each tool is designed to provide clarity and inspiration. Start exploring now and unlock the wisdom within.
        </p>
        <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
          <Link href="/name-interpretation">Start with Name Interpretation</Link>
        </Button>
      </section>
    </div>
  );
}
