import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TextWithCode } from "./text-with-code";

describe("TextWithCode", () => {
  it("renders text without backticks unchanged", () => {
    expect(
      renderToStaticMarkup(<TextWithCode text="Select the delayed rows." />),
    ).toBe("Select the delayed rows.");
  });

  it("renders each paired backtick span as semantic inline code", () => {
    const markup = renderToStaticMarkup(
      <TextWithCode text="Use `WHERE` with `status = 'delayed'`." />,
    );

    expect(markup).toContain(">WHERE</code>");
    expect(markup).toContain(">status = &#x27;delayed&#x27;</code>");
    expect(markup).toContain("bg-ctp-mantle");
    expect(markup).toContain("text-ctp-text");
    expect(markup).toContain("py-px");
    expect(markup).toContain("box-decoration-clone");
    expect(markup.match(/<code/g)).toHaveLength(2);
  });

  it("preserves an unmatched backtick literally", () => {
    const markup = renderToStaticMarkup(
      <TextWithCode text="Use `SELECT` before `WHERE" />,
    );

    expect(markup).toContain(">SELECT</code>");
    expect(markup).toContain(" before `WHERE");
    expect(markup.match(/<code/g)).toHaveLength(1);
  });
});
