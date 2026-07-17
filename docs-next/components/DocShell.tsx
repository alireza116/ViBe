"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "../lib/nav";
import type { DocPage } from "../lib/types";

type Anchor = { id: string; title: string };

type Props = {
  children: React.ReactNode;
  /**
   * Active page metadata for in-page anchors — legacy `content/*.ts` routes
   * only. An MDX route passes nothing and the anchors are read from the DOM
   * instead, since its sections live inside the compiled page.
   */
  page?: Pick<DocPage, "api" | "sections">;
};

export function DocShell({ children, page }: Props) {
  const pathname = usePathname() || "/";
  const active = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // An MDX page's sections are <Section> elements in its own tree, so the shell
  // can't know them at render time — it reads them back after mount. ApiReference
  // emits <section id="api"> too, so this picks up the API anchor in document
  // order for free. Sub-anchors appear a frame after paint; that's the trade for
  // keeping <Section> the single source of truth, with no codegen step.
  const [found, setFound] = useState<Anchor[]>([]);
  useEffect(() => {
    if (page) return; // legacy route: the data is authoritative
    const nodes = document.querySelectorAll("main section[id]");
    setFound(
      Array.from(nodes).map((n) => ({
        id: n.id,
        title:
          n.id === "api"
            ? "API reference"
            : n.querySelector("h2")?.textContent?.trim() || n.id,
      }))
    );
  }, [pathname, page]);

  const anchors: Anchor[] = page
    ? [
        ...(page.api?.length ? [{ id: "api", title: "API reference" }] : []),
        ...(page.sections ?? []).map((s) => ({ id: s.id, title: s.title })),
      ]
    : found;
  const showAnchors =
    anchors.length > 1 || anchors.some((a) => a.id === "api");

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
                  {isActive && showAnchors ? (
                    <div className="anchors">
                      {anchors.map((a) => (
                        <a key={a.id} href={`#${a.id}`}>
                          {a.title}
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
