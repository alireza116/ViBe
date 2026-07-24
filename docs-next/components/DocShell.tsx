"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE } from "../lib/nav";

type Anchor = { id: string; title: string };

type Props = {
  children: React.ReactNode;
  /** Drop the site sidebar and let `main` fill the width. The playground's
   * dashboard is a full-screen surface with its own left-rail navigation, so a
   * second site nav beside it only competes for space. */
  chromeless?: boolean;
};

export function DocShell({ children, chromeless }: Props) {
  const pathname = usePathname() || "/";
  const active = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  // A page's sections are <Section> elements inside its own MDX tree, so the
  // shell can't know them at render time — it reads them back after mount.
  // ApiReference emits <section id="api"> too, so the API anchor comes along in
  // document order for free. Sub-anchors appear a frame after paint; that's the
  // trade for keeping <Section> the single source of truth, with no codegen.
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  useEffect(() => {
    const nodes = document.querySelectorAll("main section[id]");
    setAnchors(
      Array.from(nodes).map((n) => ({
        id: n.id,
        title:
          n.id === "api"
            ? "API reference"
            : n.querySelector("h2")?.textContent?.trim() || n.id,
      }))
    );
  }, [pathname]);

  const showAnchors =
    anchors.length > 1 || anchors.some((a) => a.id === "api");

  if (chromeless) {
    return (
      <div className="layout layout-chromeless">
        <main className="main-chromeless">{children}</main>
      </div>
    );
  }

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
