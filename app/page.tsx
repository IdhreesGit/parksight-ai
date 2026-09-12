import { Navbar } from "@/components/parksight/navbar"
import { Hero } from "@/components/parksight/hero"
import { Dashboard } from "@/components/parksight/dashboard"
import { HowItWorks } from "@/components/parksight/how-it-works"
import { Problem } from "@/components/parksight/problem"
import { AiSolution } from "@/components/parksight/ai-solution"
import { About } from "@/components/parksight/about"
import { Footer } from "@/components/parksight/footer"

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <Hero />
      <Dashboard />
      <HowItWorks />
      <Problem />
      <AiSolution />
      <About />
      <Footer />
    </main>
  )
}
