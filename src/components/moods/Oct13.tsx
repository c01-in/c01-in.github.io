import { Card } from "../ui/card";

export default function Mood() {
  return (
    <Card>
      <div className="relative w-full">
        <p className="text-center text-2xl">Celebrating the launch of Clipboard Bridge</p>
        <div className="w-full">
          <img
            src="/assets/moods/mood-261013.png"
            alt="A laptop and Android phone sharing clipboard content at a cozy desk at dusk"
            className="w-full h-auto rounded-lg mt-4"
          />
        </div>
        <div className="text-center text-xs text-muted-foreground mt-2">
          <p>An open source tool that brings Windows and Android clipboards together.</p>
          <p>A small bridge, a smoother day.</p>
          <p>October 13, 2026</p>
        </div>
      </div>
    </Card>
  );
}
