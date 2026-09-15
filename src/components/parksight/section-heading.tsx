import type { ReactNode } from "react"

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string
  title: ReactNode
  description?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={
        align === "center"
          ? "mx-auto max-w-2xl text-center"
          : "max-w-2xl text-left"
      }
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan">
        <span className="size-1.5 rounded-full bg-electric shadow-[0_0_10px_2px_var(--color-electric)]" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/60">
          {description}
        </p>
      ) : null}
    </div>
  )
}
