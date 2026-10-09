import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LIVING SYSTEMS INTELLIGENCE",
  description:
    "A graph-based intelligence platform for understanding how life works, how civilization depends on it, what threatens it and where action creates impact — species, ecosystems, ecological functions, threats, solutions and the relationships between them.",
};

const NAV = [
  { href: "/start", label: "Start" },
  { href: "/ecosystems", label: "Ecosystems" },
  { href: "/species", label: "Species" },
  { href: "/dependencies", label: "Dependencies" },
  { href: "/solutions", label: "Solutions" },
  { href: "/decisions", label: "Decisions" },
  { href: "/learning", label: "Learning" },
  { href: "/trust", label: "Trust" },
  { href: "/about", label: "About" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur">
          <div className="mx-auto flex max-w-page flex-col items-stretch gap-3 px-6 py-3 md:h-14 md:flex-row md:items-center md:justify-between md:gap-6 md:py-0">
            <Link href="/" className="flex shrink-0 items-baseline gap-2">
              <span className="text-[15px] font-semibold tracking-tight">
                LIVING SYSTEMS INTELLIGENCE
              </span>
            </Link>
            <nav
              aria-label="Primary"
              className="flex w-full min-w-0 max-w-full items-center gap-6 overflow-x-auto pb-1 md:w-auto md:overflow-visible md:pb-0"
            >
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="micro-ink shrink-0 transition-colors hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-page px-6">{children}</main>

        <footer className="mt-32 border-t border-line">
          <div className="mx-auto max-w-page px-6 py-10">
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                { href: "/sources", label: "Sources" },
                { href: "/human-systems", label: "Human Systems" },
                { href: "/functions", label: "Functions" },
                { href: "/services", label: "Services" },
                { href: "/threats", label: "Threats" },
                { href: "/solutions", label: "Solutions" },
                { href: "/missions", label: "Missions" },
                { href: "/impact", label: "Impact" },
                { href: "/actors", label: "Actors" },
                { href: "/locations", label: "Locations" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="micro-ink hover:text-brand">
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="micro">Part of 4PLANET</span>
              <span className="micro">
                Living Systems Intelligence · 4PLANET
              </span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
