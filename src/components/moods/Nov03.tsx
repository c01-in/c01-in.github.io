import { Card } from "../ui/card";

export default function Mood() {
  return (
    <Card>
      <div className="relative w-full">
        <p className="text-center text-2xl">Celebrating the launch of Roster Beacon</p>
        <div className="w-full">
          <img
            src="/assets/moods/mood-261103.png"
            alt="A basketball, controller and roster-management screen on a warmly lit developer desk at dusk"
            className="w-full h-auto rounded-lg mt-4"
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>A small tool for keeping your roster ready.</p>
          <p>Less setup. More court time.</p>
          <p>November 3, 2026</p>
        </div>
      </div>
    </Card>
  );
}
