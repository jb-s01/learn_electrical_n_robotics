import Link from "next/link";
import { Zap } from "lucide-react";
import { NavLinks, type NavLink } from "@/components/layout/NavLinks";

const links: NavLink[] = [
  { href: "/path/beginner", label: "Beginner" },
  { href: "/path/intermediate", label: "Intermediate" },
  { href: "/path/advanced", label: "Advanced" },
  { href: "/tracks", label: "Tracks" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/settings", label: "Settings" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2 font-semibold">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-sm shadow-blue-500/30 transition-transform group-hover:rotate-12">
            <Zap className="h-4 w-4" />
          </span>
          <span>ElectroLearn</span>
        </Link>
        <NavLinks links={links} />
      </div>
    </header>
  );
}
