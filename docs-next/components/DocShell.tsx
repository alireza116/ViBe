"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "../lib/nav";
import type { DocPage } from "../lib/types";

type Props = {
  children: React.ReactNode;
  /** Active page metadata for in-page anchors. */
  page?: Pick<DocPage, "api" | "sections">;
};

export function DocShell({ children, page }: Props) {
  const pathname = usePathname() || "/";
  const active = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  return (
    <div className="layout">
      <nav>
        <div className="brand">
          <Link href="/">VibeJS</Link>
        </div>
        <div className="tag">declarative visual belief elicitation</div>
        {SITE.map((grp) => (
          <div className="group" key={grp.group}>
            <div className="group-title">{grp.group}</div>
            {grp.pages.map((p) => {
              const isActive = p.href === active;
              return (
                <span key={p.href}>
                  <Link
                    href={p.href}
                    className={isActive ? "active" : undefined}
                  >
                    {p.title}
                  </Link>
                  {isActive &&
                  page &&
                  (page.api?.length || (page.sections?.length ?? 0) > 1) ? (
                    <div className="anchors">
                      {page.api?.length ? (
                        <a href="#api">API reference</a>
                      ) : null}
                      {page.sections?.map((s) => (
                        <a key={s.id} href={`#${s.id}`}>
                          {s.title}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </span>
              );
            })}
          </div>
        ))}
        <div className="links">
          <Link href="/playground">→ Playground</Link>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
