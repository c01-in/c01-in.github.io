export type ProjectLinks = {
  primary?: string;
  github?: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  updatedAt: string;
  pinned: boolean;
  links: ProjectLinks;
};

export const featuredProjects: ProjectItem[] = [
  {
    id: "dst-server-kit",
    name: "DST Server Kit",
    description:
      "Run a modded Don't Starve server in 5 minutes with Docker + Web Admin (no Lua config)",
    category: "Featured",
    updatedAt: "2026-04-09",
    pinned: true,
    links: {
      github: "https://github.com/c01-in/dst-server-kit",
    },
  },
  {
    id: "rhymove",
    name: "Rhymove",
    description:
      "A music-enhanced fitness timer. MVP in progress with public roadmap.",
    category: "Featured",
    updatedAt: "2026-04-06",
    pinned: true,
    links: {
      primary: "https://rhymove.pages.dev",
      github: "https://github.com/users/c01-in/projects/3",
    },
  },
  {
    id: "sub2ms-video-pipeline",
    name: "Sub-2 ms Clouding Pipeline",
    description:
      "Sub-2 ms Video Pipeline: Wi-Fi MAC-Level Bypass to Direct Display",
    category: "Featured",
    updatedAt: "2026-04-06",
    pinned: true,
    links: {
      github: "https://github.com/c01-in/sub2ms-video-pipeline",
    },
  },
  {
    id: "botboats",
    name: "BotBoats",
    description:
      "A lightweight, offline-first AI assistant platform featuring customizable characters, local chat history, and support for your own API keys - all packed in a PWA you can run anywhere.",
    category: "Featured",
    updatedAt: "2026-04-06",
    pinned: false,
    links: {
      primary: "https://botboats.pages.dev",
      github: "https://github.com/c01-in/botboats",
    },
  },
  {
    id: "aotianos",
    name: "AotianOS",
    description:
      "A lightweight empathetic AI framework for reflective conversations.",
    category: "Featured",
    updatedAt: "2026-04-06",
    pinned: false,
    links: {},
  },
];

export const toolProjects: ProjectItem[] = [
  {
    id: "fast-zip-unpack",
    name: "Fast Zip Unpack",
    description:
      "A fast utility for unpacking ZIP archives with a minimal workflow.",
    category: "Tool",
    updatedAt: "2026-04-06",
    pinned: true,
    links: {
      github: "https://github.com/c01-in/fast-zip-unpack",
    },
  },
  {
    id: "any-tab-mouse-sync",
    name: "Any Tab Mouse Sync",
    description:
      "Sync mouse behavior across tabs for smoother multi-tab browsing.",
    category: "Tool",
    updatedAt: "2026-04-06",
    pinned: false,
    links: {
      primary:
        "https://chromewebstore.google.com/detail/any-tab-mouse-sync/cclfnohkciiakolplcccpijkofpjikeo",
      github: "https://github.com/c01-in/any-tab-mouse-sync",
    },
  },
  {
    id: "kotlin-playground",
    name: "Kotlin Playground",
    description: "A Kotlin playground for learning and testing Kotlin code.",
    category: "Tool",
    updatedAt: "2026-04-06",
    pinned: false,
    links: {},
  },
];

export function sortProjectsByPriority(items: ProjectItem[]) {
  return [...items].sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return Number(b.pinned) - Number(a.pinned);
    }

    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
