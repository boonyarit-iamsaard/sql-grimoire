import { useState } from "react";
import type { DialogueLine } from "../game/dialogue/dialogue-types";
import { playClick } from "../game/sound";

type Props = {
  lines: DialogueLine[];
  onFinished: () => void;
  finishLabel: string;
};

export function DialogueBox({ lines, onFinished, finishLabel }: Props) {
  const [index, setIndex] = useState(0);
  const line = lines[index];
  const isLast = index === lines.length - 1;

  const advance = () => {
    playClick();
    if (isLast) onFinished();
    else setIndex(index + 1);
  };

  return (
    <div className="dialogue-box">
      <img className="portrait" src={line.portrait} alt={line.speaker} key={line.portrait} />
      <div>
        <div className="speaker">{line.speaker}</div>
        <div className="line">{line.text}</div>
      </div>
      <div className="dialogue-controls">
        <div className="progress-dots">
          {lines.map((_, i) => (
            <span key={i} className={i === index ? "active" : ""} />
          ))}
        </div>
        <button className={isLast ? "btn btn-primary" : "btn"} onClick={advance} autoFocus>
          {isLast ? finishLabel : "Next ▸"}
        </button>
      </div>
    </div>
  );
}
