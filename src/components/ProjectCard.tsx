import { ArrowUpRight, Github, Pin } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectItem } from "@/content/projects";

function formatDate(dateValue: string) {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isInternalRoute(href: string) {
  return href.startsWith("/");
}

function LinkButton({ href }: { href: string }) {
  if (isInternalRoute(href)) {
    return (
      <Button
        variant="ghost"
        size="sm"
        asChild
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <Link to={href} aria-label="Open project">
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      asChild
      className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Open project">
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </Button>
  );
}

export function ProjectCard({ project }: { project: ProjectItem }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
              <span>{project.category}</span>
              <span aria-hidden="true">|</span>
              <time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time>
              {project.pinned && (
                <>
                  <span aria-hidden="true">|</span>
                  <span className="inline-flex items-center gap-1">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                </>
              )}
            </div>

            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-base">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {project.links.primary && <LinkButton href={project.links.primary} />}
            {project.links.github && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <a
                  href={project.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open GitHub repository"
                >
                  <Github className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

