import { useState } from "react";
import { cn } from "../../../lib/cn";
import { playClick } from "../../../shared/audio/sound";
import { Button } from "../../../shared/ui/button";
import type { DialogueLine } from "../dialogue-types";

interface DialogueBoxProps {
  lines: DialogueLine[];
  onFinished: () => void;
  finishLabel: string;
}

export function DialogueBox({
  lines,
  onFinished,
  finishLabel,
}: Readonly<DialogueBoxProps>) {
  const [index, setIndex] = useState(0);
  const line = lines[index];
  const isLast = index === lines.length - 1;

  const advance = () => {
    playClick();
    if (isLast) {
      onFinished();
    } else {
      setIndex(index + 1);
    }
  };

  return (
    <div className="grid w-[min(720px,100%)] grid-cols-[150px_1fr] gap-4.5 rounded-[14px] border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base p-5 text-ctp-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),var(--shadow-paper)]">
      <img
        className="size-37.5 rounded-[10px] border-2 border-ctp-surface2 motion-safe:animate-portrait-pop"
        src={line.portrait}
        alt={line.speaker}
        key={line.portrait}
      />
      <div>
        <div className="mb-1.5 font-display text-[1.15rem] text-ctp-peach">
          {line.speaker}
        </div>
        <div className="min-h-[4.6em] text-[1.05rem]">{line.text}</div>
      </div>
      <div className="col-span-full flex items-center justify-between">
        <div className="flex gap-1.5">
          {lines.map((l, i) => (
            <span
              key={l.id}
              className={cn(
                "size-2.25 rounded-full border border-ctp-overlay0",
                i === index ? "bg-ctp-peach" : "bg-ctp-surface2",
              )}
            />
          ))}
        </div>
        <Button variant={isLast ? "primary" : "default"} onClick={advance}>
          {isLast ? finishLabel : "Next ▸"}
        </Button>
      </div>
    </div>
  );
}
