// Shared form styles (ProjectForm, CrudModal): light fields, 1.5px line border, ink focus ring
// from the global :focus-visible rule, pill buttons.
export const fieldCls =
  "w-full min-h-12 rounded-card bg-surface border-[1.5px] border-line hover:border-subtle focus:border-ink focus-visible:outline-offset-0 px-4 text-[15px] text-ink placeholder:text-subtle transition-colors";

export const textareaCls =
  "w-full rounded-card bg-surface border-[1.5px] border-line hover:border-subtle focus:border-ink focus-visible:outline-offset-0 px-4 py-3 text-[15px] leading-relaxed text-ink placeholder:text-subtle transition-colors";

export const labelCls = "text-sm font-semibold text-ink";

export const helpCls = "text-[13px] text-muted";

// Label styled as a button for a visually hidden `peer sr-only` file input placed right before it
export const uploadBtnCls =
  "inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-full border-[1.5px] border-ink bg-surface text-[15px] font-semibold hover:bg-ink hover:text-on-ink transition-colors cursor-pointer shrink-0 peer-focus-visible:outline-2 peer-focus-visible:outline-ink peer-focus-visible:outline-offset-2";

export const primaryBtnCls =
  "min-h-12 px-6 rounded-full bg-ink text-on-ink text-[15px] font-semibold disabled:opacity-50 transition-opacity cursor-pointer";

export const secondaryBtnCls =
  "min-h-12 px-6 rounded-full border-[1.5px] border-ink text-[15px] font-semibold hover:bg-surface transition-colors cursor-pointer";
