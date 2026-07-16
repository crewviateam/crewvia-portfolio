/**
 * src/data/navigation.ts
 * Navigation link data — single source of truth for Header, Footer, mobile menu.
 */
import type { NavLink } from "../types";
import { getContent } from "./siteContent";

function isSectionVisible(key: string): boolean {
  const val = getContent(key as any, "true");
  return val !== "false";
}

export const NAV_LINKS: NavLink[] = [
  { href: "#work",     label: "Work"     },
  { href: "#services", label: "Services" },
  { href: "#process",  label: "Process"  },
  { href: "#team",     label: "Team"     },
].filter(link => {
  if (link.href === "#work") return isSectionVisible("section_work_visible");
  if (link.href === "#services") return isSectionVisible("section_services_visible");
  if (link.href === "#process") return isSectionVisible("section_process_visible");
  if (link.href === "#team") return isSectionVisible("section_team_visible");
  return true;
});

export const CONTACT_LINK: NavLink = { href: "/contact", label: "Start Project" };
