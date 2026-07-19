import type { IncidentBriefing } from "../mission-types";

/** The incident report that frames the Mission — the opening section of the
 *  lesson pane. Story as candlelight, never a gate. */
export function IncidentReport({
  briefing,
}: Readonly<{ briefing: IncidentBriefing }>) {
  return (
    <div className="px-5 py-4 text-ctp-text">
      <div className="mb-3 border-ctp-surface1 border-b pb-2.5">
        <div className="font-mono text-[0.75rem] text-ctp-overlay2 uppercase tracking-[0.08em]">
          {briefing.channel}
        </div>
        <div className="mt-1 font-display text-[1.1rem] text-ctp-peach">
          {briefing.reporter}
        </div>
        <div className="text-[0.88rem] text-ctp-subtext1">{briefing.role}</div>
      </div>
      {briefing.body.map((paragraph) => (
        <p key={paragraph} className="my-2 text-[0.98rem]">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
