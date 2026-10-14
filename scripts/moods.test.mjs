import assert from "node:assert/strict";
import test from "node:test";
import { allMoodImporters, latestMoodImporter, getRandomMoodImporter } from "../src/components/moods/index.ts";

test("initial mood stays the latest across repeated initializations", () => {
  assert.equal(latestMoodImporter, allMoodImporters.at(-1));
  getRandomMoodImporter(latestMoodImporter);
  assert.equal(latestMoodImporter, allMoodImporters.at(-1));
});

test("rotation always selects a registered mood other than the current one", () => {
  for (const current of allMoodImporters) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const next = getRandomMoodImporter(current);
      assert.ok(allMoodImporters.includes(next));
      assert.notEqual(next, current);
    }
  }
});
