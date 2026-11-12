import React from "react";

// Page title in the editorial style: a mono eyebrow, a large light serif h1
// and an optional serif lead.
export default function PageHeader({ eyebrow, title, children }) {
  return (
    <header className="max-w-header pt-6 pb-12">
      {eyebrow && <p className="eyebrow mt-0 mb-4">{eyebrow}</p>}
      <h1 className="m-0 text-4xl">{title}</h1>
      {children && (
        <div className="mt-4 max-w-[40ch] font-serif text-lead leading-[1.45] font-light text-soft [&_p]:m-0">
          {children}
        </div>
      )}
    </header>
  );
}
