"use client";

import { useId, useState, type ReactNode } from "react";

type CollapsibleSectionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section className="print-avoid-break border-t border-divider py-8">
      <button
        type="button"
        className="section-toggle-row"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
      >
        <div className="section-toggle-heading">
          <h2 className="font-serif text-[1.9rem] text-foreground sm:text-[2.2rem]">
            {title}
          </h2>
        </div>
        <span
          className="section-toggle-arrow"
          data-open={open}
          aria-hidden="true"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 7l4.5 4 4.5-4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open ? (
        <div id={contentId} className="collapsible-content is-open">
          {children}
        </div>
      ) : null}
    </section>
  );
}
