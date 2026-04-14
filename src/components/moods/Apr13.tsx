import { Card } from "../ui/card";

export default function Mood() {
  return (
    <Card>
      <div className="relative w-full">
        <p className="text-center text-2xl">Celebrating the launch of StageSeat</p>
        <div className="w-full">
          <img
            src="./assets/moods/mood-260413.png"
            alt="Celebrating the launch of StageSeat"
            className="w-full h-auto rounded-lg mt-4"
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>An open source tool that turns seat position into sound.</p>
          <p>A small launch, a big feeling.</p>
          <p>April 13, 2026</p>
        </div>
      </div>
    </Card>
  );
}
