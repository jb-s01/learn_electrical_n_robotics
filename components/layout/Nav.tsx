import Link from "next/link";
import { Zap, BookOpen, Bot, Settings, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: Zap },
  { href: "/path/beginner", label: "Beginner", icon: BookOpen },
  { href: "/path/intermediate", label: "Intermediate", icon: BookOpen },
  { href: "/path/advanced", label: "Advanced", icon: BookOpen },
  { href: "/tracks", label: "Tracks", icon: Layers },
  { href: "/tutor", label: "AI Tutor", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav({ currentPath }: { currentPath?: string }) {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Zap className="h-5 w-5 text-blue-600" />
          <span>ElectroLearn</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.slice(1).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800",
                currentPath === href && "bg-zinc-100 font-medium dark:bg-zinc-800"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
