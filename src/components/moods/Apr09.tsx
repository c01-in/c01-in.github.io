import { Card } from "../ui/card";

export default function Mood() {
  return (
    <Card>
      <div className="relative w-full">
        <p className="text-center text-2xl">Almost There</p>
        <div className="w-full">
          <img
            src="./assets/moods/mood-260409.png"
            alt="Almost There"
            className="w-full h-auto rounded-lg mt-4"
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>The code works. The system runs.</p>
          <p>Now comes the quiet part — waiting to see if it matters.</p>
          <p>April 09, 2026</p>
        </div>
      </div>
    </Card>
  );
}
