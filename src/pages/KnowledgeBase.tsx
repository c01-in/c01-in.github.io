import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { House, TypeOutline } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toggleFont } from "@/lib/utils";
import { RandomIllustration } from "@/components/ui/random_illustration";

const posts = [
    {
        title: "Kotlin–Java Interop Annotations: @JvmOverloads, @JvmStatic, @JvmField, @JvmName, @JvmMultifileClass",
        date: "2025-08-09",
        filename: "2025-08-09-kotlin annotation for java.md",
    },
    {
        title: "AudioMass: Free Online Audio Editor",
        date: "2025-07-25",
        filename: "2025-07-25-AudioMass.md",
    },
    {
        title: "Comparison of Flutter State Management Mechanisms",
        date: "2025-07-18",
        filename: "2025-07-18-flutter_state_mgmt.md",
    },
    {
        title: "2025 Android tech stack",
        date: "2025-06-30",
        filename: "2025 Android tech stack.md",
    },
    {
        title: "Android Paint",
        date: "2020-03-16",
        filename: "2020-03-16-Android Paint.md",
    },
]

export default function KnowledgeBase() {
  const navigate = useNavigate();

  const handleOpenPost = (filename: string) => () => {
    navigate(`/read/${encodeURIComponent(filename)}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-3xl mx-auto">
      <header className="mb-12 w-full">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" colorTheme="primary" onClick={toggleFont}>
              <TypeOutline />
            </Button>
            <Button
              variant="outline"
              colorTheme="primary"
              onClick={() => navigate("/")}
            >
              <House />
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground">My Markdown Notes</p>
      </header>
      <section className="space-y-6 w-full">
        {posts.map((post) => (
          <Card key={post.filename}>
            <CardContent
              className="relative flex flex-col justify-between py-4 cursor-pointer"
              onClick={handleOpenPost(post.filename)}
            >
              <div>
                <h2 className="text-xl font-semibold leading-tight">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground">{post.date}</p>
              </div>
              <div className="absolute -bottom-6 right-0 flex items-end justify-end w-full h-[120%]">
                <RandomIllustration
                  className="h-full w-auto"
                  seed={post.filename}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}
