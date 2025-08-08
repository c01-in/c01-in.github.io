import { useState, type ComponentType, useMemo, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  TypeOutline,
  RefreshCw,
  BookOpenText,
} from "lucide-react";
import { DynamicIcon } from "lucide-react/dynamic";
import { useNavigate } from "react-router-dom";
import { toggleFont } from "@/lib/utils";
import { getRandomMoodImporter } from "@/components/moods";

type MoodImporter = () => Promise<{ default: ComponentType<any> }>;

export default function Home() {
  const navigate = useNavigate();
  const [moodImporter, setMoodImporter] = useState<MoodImporter>(() =>
    getRandomMoodImporter()
  );

  const CurrentMood = useMemo(() => lazy(moodImporter), [moodImporter]);

  const refreshMood = () => {
    setMoodImporter((prev) => getRandomMoodImporter(prev));
  };



  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto">
      <header className="mb-12 w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-bold mb-2">c01in</h1>
            <span className="sr-only">Colin Lyu</span>
            <p className="text-muted-foreground">
              Engineer · Builder · Minimalist
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              colorTheme="primary"
              onClick={refreshMood}
            >
              <RefreshCw />
            </Button>
            <Button variant="outline" colorTheme="primary" onClick={toggleFont}>
              <TypeOutline />
            </Button>
            <Button variant="outline" colorTheme="primary" onClick={() => navigate("/kb")}>
              <BookOpenText />
            </Button>
          </div>
        </div>
      </header>

          <section className="mb-12 w-full">
              <Suspense
                  fallback={<div className="w-full h-48 bg-muted rounded-lg animate-pulse" />}
              >
                  <CurrentMood />
              </Suspense>
          </section>

          <section className="space-y-6 w-full">
              <Project
                  name="Rhymove"
                  description="A music-enhanced fitness timer. MVP in progress with public roadmap."
                  link="https://rhymove.pages.dev"
                  github="https://github.com/users/c01-in/projects/3"
              />
              <Project
                  name="Sub-2 ms Clouding Pipeline"
                  description="Sub-2 ms Video Pipeline: Wi-Fi MAC-Level Bypass to Direct Display"
                  github="https://github.com/c01-in/sub2ms-video-pipeline"
              />
              <Project
                  name="BotBoats"
                  description="A lightweight, offline-first AI assistant platform featuring customizable characters, local chat history, and support for your own API keys — all packed in a PWA you can run anywhere."
                  link="https://botboats.pages.dev"
                  github="https://github.com/c01-in/botboats"
              />
              <Project
                  name="AotianOS"
                  description="A lightweight empathetic AI framework for reflective conversations."
              />
          </section>

          <footer className="mt-24 text-sm text-muted-foreground w-full text-center flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                  <span>© {new Date().getFullYear()} Colin Lyu</span>
              </div>
          </footer>
      </main>
  )
}

function Project({
  name,
  description,
  link,
  github,
}: {
  name: string;
  description: string;
  link?: string;
  github?: string;
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <h2 className="text-xl font-semibold leading-tight">{name}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex gap-2 pt-2">
          {link && (
            <Button variant="link" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                Visit <ArrowUpRight className="w-4 h-4 ml-1" />
              </a>
            </Button>
          )}
          {github && (
            <Button variant="link" asChild>
              <a href={github} target="_blank" rel="noopener noreferrer">
                <DynamicIcon name="github" className="w-4 h-4 mr-1" /> GitHub
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
