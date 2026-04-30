"use client"

import { useReveal } from "@/hooks/use-reveal"

interface Row {
  label: string
  items: string[]
  reverse?: boolean
}

const rows: Row[] = [
  {
    label: "Backend",
    items: [
      "Express.js",
      "FastAPI",
      "Bamboo",
      "Node.js",
      "Microservices Architecture",
      "Django",
      "REST APIs",
      "PostgreSQL",
      "Strapi",
    ],
  },
  {
    label: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Tailwind CSS",
      "TypeScript",
      "REST API Integration",
      "Responsive Design",
      "HTML/CSS",
      "Bootstrap",
    ],
    reverse: true,
  },
  {
    label: "AI / Data",
    items: [
      "Machine Learning",
      "Deep Learning",
      "Scikit-Learn",
      "NLP",
      "Python",
      "PyTorch",
      "Vector Databases",
      "TensorFlow",
      "Keras",
    ],
  },
  {
    label: "Automation / Agentic AI & DevOps",
    items: [
      "Agentix AI",
      "LangChain",
      "n8n",
      "Huggingface",
      "Groq",
      "Cloud Infrastructure",
      "Docker",
      "Git",
      "CI/CD",
    ],
    reverse: true,
  },
]

function MarqueeRow({ items, reverse }: { items: string[]; reverse?: boolean }) {
  // duplicate for seamless loop
  const seq = [...items, ...items]
  return (
    <div className="marquee-mask overflow-hidden">
      <div
        className={`flex gap-3 w-max ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
      >
        {seq.map((it, i) => (
          <span
            key={`${it}-${i}`}
            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <span className="h-1 w-1 rounded-full bg-primary" />
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TechStackSection() {
  const ref = useReveal<HTMLElement>()
  return (
    <section
      id="stack"
      ref={ref}
      className="relative py-32 lg:py-40 border-t border-border overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="reveal flex items-center gap-3">
          <span className="h-px w-10 bg-primary" />
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-primary">
            Technologies
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          <h2
            className="reveal lg:col-span-6 font-sans font-medium tracking-[-0.03em] text-4xl md:text-5xl lg:text-6xl"
            style={{ transitionDelay: "60ms" }}
          >
            What I build with
          </h2>
          <p
            className="reveal lg:col-span-6 self-end max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed"
            style={{ transitionDelay: "120ms" }}
          >
            I select tools that optimize for speed, scale, and intelligence, leveraging a
            cutting-edge ecosystem of frameworks, languages, and platforms.
          </p>
        </div>
      </div>

      <div className="reveal mt-16 space-y-6" style={{ transitionDelay: "200ms" }}>
        {rows.map((row, i) => (
          <div key={row.label} className="space-y-3">
            <div className="mx-auto max-w-7xl px-6 lg:px-10 flex items-center gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")} / {row.label}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <MarqueeRow items={row.items} reverse={row.reverse} />
          </div>
        ))}
      </div>
    </section>
  )
}
