import React from "react";
import Heading from "@theme/Heading";

// A page section with a hairline rule above, a serif h2 and an optional
// right-aligned aside (a link or a mono count). Heading registers the id with
// the broken-anchor checker and offsets in-page jumps for the sticky navbar.
export default function Section({ id, title, aside, children }) {
  return (
    <section className="border-t border-line py-14" aria-labelledby={id}>
      <div className="mb-8 flex items-baseline justify-between gap-4 text-sm [&_.mono]:text-muted">
        <Heading as="h2" id={id} className="m-0 text-2xl">
          {title}
        </Heading>
        {aside}
      </div>
      {children}
    </section>
  );
}
