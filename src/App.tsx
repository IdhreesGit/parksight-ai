import { About } from "@/components/parksight/about"
import { AiSolution } from "@/components/parksight/ai-solution"
import { Dashboard } from "@/components/parksight/dashboard"
import { Footer } from "@/components/parksight/footer"
import { Hero } from "@/components/parksight/hero"
import { HowItWorks } from "@/components/parksight/how-it-works"
import { Navbar } from "@/components/parksight/navbar"
import { Problem } from "@/components/parksight/problem"

export default function App() {
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
