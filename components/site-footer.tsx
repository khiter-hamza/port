import Link from "next/link"

const links = [
  { href: "#about", label: "About" },
  { href: "#projects", label: "Projects" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
]

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <Link
          href="#top"
          className="font-mono text-sm tracking-tight flex items-center gap-1 group"
          aria-label="Khiter Hamza"
        >
          <span className="text-foreground group-hover:text-primary transition-colors">
            KhiterHamza
          </span>
          <span className="text-primary text-base leading-none">✦</span>
        </Link>
        <ul className="flex items-center gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 Khiter Hamza. Built with Next.js &amp; passion.
        </p>
      </div>
    </footer>
  )
}
