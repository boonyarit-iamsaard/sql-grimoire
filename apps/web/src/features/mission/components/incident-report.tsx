import { playClick } from "../../../shared/audio/sound";
import { Button } from "../../../shared/ui/button";
import type { IncidentBriefing } from "../mission-types";

interface IncidentReportProps {
  briefing: IncidentBriefing;
  onFinished: () => void;
  finishLabel: string;
}

export function IncidentReport({
  briefing,
  onFinished,
  finishLabel,
}: Readonly<IncidentReportProps>) {
  return (
    <div className="w-[min(720px,100%)] rounded-[14px] border-[3px] border-ctp-surface2 bg-linear-to-b from-ctp-surface0 to-ctp-base p-6 text-ctp-text shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),var(--shadow-paper)]">
      <div className="mb-3.5 border-ctp-surface1 border-b pb-3">
        <div className="font-mono text-[0.75rem] text-ctp-overlay2 uppercase tracking-[0.08em]">
          {briefing.channel}
        </div>
        <div className="mt-1 font-display text-[1.15rem] text-ctp-peach">
          {briefing.reporter}
        </div>
        <div className="text-[0.9rem] text-ctp-subtext1">{briefing.role}</div>
      </div>
      {briefing.body.map((paragraph) => (
        <p key={paragraph} className="my-2.5 text-[1.05rem]">
          {paragraph}
        </p>
      ))}
      <div className="mt-4.5 flex justify-end">
        <Button
          variant="primary"
          onClick={() => {
            playClick();
            onFinished();
          }}
        >
          {finishLabel}
        </Button>
      </div>
    </div>
  );
}
