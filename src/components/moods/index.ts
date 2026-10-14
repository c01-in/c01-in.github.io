import type { ComponentType } from "react";

// A type for our dynamic import functions
export type MoodImporter = () => Promise<{ default: ComponentType }>;

// An array of functions that will dynamically import the mood components.
// Make sure your mood components are default exports.
// e.g. in July17.tsx: `export default function July17() { ... }`
export const allMoodImporters: MoodImporter[] = [
    () => import("./July17"),
    () => import("./July18"),
    () => import("./July20"),
    () => import("./July25"),
    () => import("./Augest8"),
    () => import("./Apr06"),
    () => import("./Apr09"),
    () => import("./Apr13"),
    () => import("./Oct13"),

    // To add a new mood, just add a new line here, e.g.:
    // () => import("./July19"),
]

export const latestMoodImporter = allMoodImporters[allMoodImporters.length - 1];

/**
 * Gets a random mood importer function from the list.
 * @param current - The current importer, to avoid selecting the same one again.
 * @returns A new mood importer function.
 */
export const getRandomMoodImporter = (current?: MoodImporter): MoodImporter => {
  if (allMoodImporters.length <= 1) {
    return allMoodImporters[0];
  }

  const candidates = allMoodImporters.filter((importer) => importer !== current);
  return candidates[Math.floor(Math.random() * candidates.length)];
};
