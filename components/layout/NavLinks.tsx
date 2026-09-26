"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type NavLink = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {links.map(({ href, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative rounded-lg px-3 py-1.5 text-sm transition-colors hover:text-zinc-900 dark:hover:text-zinc-100",
              active ? "font-medium text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-zinc-100 dark:bg-zinc-800"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
