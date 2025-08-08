import type { ComponentType } from "react";

// A type for our dynamic import functions
type MoodImporter = () => Promise<{ default: ComponentType<any> }>;

// An array of functions that will dynamically import the mood components.
// Make sure your mood components are default exports.
// e.g. in July17.tsx: `export default function July17() { ... }`
export const allMoodImporters: MoodImporter[] = [
    () => import("./July17"),
    () => import("./July18"),
    () => import("./July20"),
    () => import("./July25"),
    () => import("./Augest8"),

    // To add a new mood, just add a new line here, e.g.:
    // () => import("./July19"),
]

let isFirstCall = true; // Track if it's the first call

/**
 * Gets a random mood importer function from the list.
 * @param current - The current importer, to avoid selecting the same one again.
 * @returns A new mood importer function.
 */
export const getRandomMoodImporter = (current?: MoodImporter): MoodImporter => {
  if (isFirstCall) {
      isFirstCall = false
      return allMoodImporters[allMoodImporters.length - 1] // Return the last importer on the first call
  }

  if (allMoodImporters.length <= 1) {
    return allMoodImporters[0];
  }

  let newImporter;
  do {
    newImporter =
      allMoodImporters[Math.floor(Math.random() * allMoodImporters.length)];
  } while (newImporter === current);

  return newImporter;
};
