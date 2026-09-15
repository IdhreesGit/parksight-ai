"use client"

import { useEffect, useState } from "react"
import { Menu, X, Radar } from "lucide-react"

const LINKS = [
  { href: "#dashboard", label: "Dashboard" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "AI Solution" },
  { href: "#about", label: "About" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-2xl px-4 py-3 transition-all duration-300 sm:px-6 ${
          scrolled ? "glass" : "border border-transparent"
        }`}
        style={{ marginInline: "1rem" }}
      >
        <a href="#top" className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-to-br from-electric to-cyan text-navy-900">
            <Radar className="size-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">
            ParkSight<span className="text-electric"> AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/65 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <a
            href="#dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-electric to-cyan px-4 py-2 text-sm font-semibold text-navy-900 shadow-[0_8px_24px_-8px_var(--color-electric)] transition-transform hover:scale-[1.03]"
          >
            Launch Live Demo
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="grid size-9 place-items-center rounded-lg border border-white/10 text-foreground md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {open ? (
        <div className="mx-4 mt-2 md:hidden">
          <div className="glass flex flex-col rounded-2xl p-2">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-foreground/75 transition-colors hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#dashboard"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-gradient-to-r from-electric to-cyan px-4 py-3 text-center text-sm font-semibold text-navy-900"
            >
              Launch Live Demo
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}
