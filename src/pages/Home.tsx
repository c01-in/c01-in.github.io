import { useState, type ComponentType, useMemo, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { TypeOutline, RefreshCw, BookOpenText, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toggleFont } from "@/lib/utils";
import { getRandomMoodImporter } from "@/components/moods";
import { ProjectCard } from "@/components/ProjectCard";
import {
  featuredProjects,
  toolProjects,
  sortProjectsByPriority,
} from "@/content/projects";

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

  const orderedFeaturedProjects = useMemo(() => featuredProjects, []);
  const sortedToolProjects = useMemo(
    () => sortProjectsByPriority(toolProjects),
    []
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-start px-6 py-12 max-w-5xl mx-auto">
      <header className="mb-12 w-full">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="text-3xl font-bold mb-2">c01in</h1>
            <span className="sr-only">Colin Lyu</span>
            <p className="text-muted-foreground">Engineer | Builder | Minimalist</p>
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
            <Button variant="outline" colorTheme="primary" onClick={() => navigate("/kotlin")}>
              <Code />
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

      <section className="space-y-12 w-full">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured Projects</h2>
            <p className="text-sm text-muted-foreground">
              Highlighted work and newly open-sourced releases.
            </p>
          </div>
          <div className="grid gap-6">
            {orderedFeaturedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Open Source Tools</h2>
            <p className="text-sm text-muted-foreground">
              Tools with direct links for quick access.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {sortedToolProjects.map((project) => (
              <ProjectCard key={`${project.id}-tool`} project={project} />
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-24 text-sm text-muted-foreground w-full text-center flex flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <span>(c) {new Date().getFullYear()} Colin Lyu</span>
        </div>
      </footer>
    </main>
  );
}
