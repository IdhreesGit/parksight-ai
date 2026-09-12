import { Radar } from "lucide-react"

export function Footer() {
  return (
    <footer className="relative border-t border-white/8 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-cyan text-navy-900">
            <Radar className="size-4.5" strokeWidth={2.5} />
          </span>
          <span className="font-display font-bold">
            ParkSight<span className="text-electric"> AI</span>
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-foreground/55">
          <a href="#dashboard" className="transition-colors hover:text-foreground">Dashboard</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How It Works</a>
          <a href="#problem" className="transition-colors hover:text-foreground">Problem</a>
          <a href="#solution" className="transition-colors hover:text-foreground">AI Solution</a>
          <a href="#about" className="transition-colors hover:text-foreground">About</a>
        </nav>

        <p className="text-xs text-foreground/40">
          © {new Date().getFullYear()} ParkSight AI · AI Immersion Project
        </p>
      </div>
    </footer>
  )
}
