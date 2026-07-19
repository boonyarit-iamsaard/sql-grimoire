import { SqlCodeBlock } from "../../../shared/ui/sql-code-block";
import type { Primer } from "../mission-types";

/** The Mission's lesson, kept beside the workbench so foundations never
 *  require leaving the platform. A native <details> owns the collapse state. */
export function PrimerPanel({ primer }: Readonly<{ primer: Primer }>) {
  return (
    <details
      className="rounded-xl border-2 border-ctp-surface1 bg-ctp-base shadow-paper open:pb-3.5"
      open
    >
      <summary className="cursor-pointer select-none px-4 py-3 font-display text-[1.02rem] text-ctp-lavender">
        Primer — {primer.title}
      </summary>
      <div className="flex flex-col gap-3 px-4">
        {primer.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="mt-0 mb-1 text-[0.95rem] text-ctp-peach">
              {section.heading}
            </h3>
            <p className="my-0 text-[0.92rem] text-ctp-subtext1">
              {section.body}
            </p>
            {section.exampleSql && <SqlCodeBlock code={section.exampleSql} />}
          </section>
        ))}
      </div>
    </details>
  );
}
