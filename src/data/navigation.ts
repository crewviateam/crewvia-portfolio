/**
 * src/data/navigation.ts
 * Navigation link data — single source of truth for Header, Footer, mobile menu.
 */
import type { NavLink } from "../types";

export const NAV_LINKS: NavLink[] = [
  { href: "#work",     label: "Work"     },
  { href: "#services", label: "Services" },
  { href: "#process",  label: "Process"  },
  { href: "#team",     label: "Team"     },
];

export const CONTACT_LINK: NavLink = { href: "#contact", label: "Start Project" };
