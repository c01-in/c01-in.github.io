import { Card } from "../ui/card";

export default function Mood() {
  return (
    <Card>
      <div className="relative w-full">
        <p className="text-center text-2xl">Build Log & Snapshots</p>
        <div className="w-full">
          <img
            src="./assets/moods/mood-260406.png"
            alt="Build Log & Snapshots"
            className="w-full h-auto rounded-lg mt-4"
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>Ship fast. Explain less. Let the work speak.</p>
          <p>April 06, 2026</p>
        </div>
      </div>
    </Card>
  );
}
