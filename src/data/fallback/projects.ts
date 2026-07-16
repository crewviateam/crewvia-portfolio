/**
 * src/data/fallback/projects.ts
 *
 * Static fallback — used when Supabase is unreachable at build time.
 * This is the ground truth for the portfolio until CMS is seeded.
 */
import type { Project } from "../../types";

export const projectsFallback: Project[] = [
  {
    id:       "p4",
    title:    "Zakereen",
    category: "Multi-Tenant Platform",
    year:     "2026",
    tags:     ["React Native", "Next.js", "Express", "Sockets"],
    image:    "/image/zakereen.png",
    color:    "#ff5a5f",
    description: "A robust multi-tenant platform for community management, featuring a comprehensive Next.js admin dashboard and a React Native mobile application.",
    problemStatement: "The challenge: securely managing complex, multi-tenant community data at scale.",
    problemParagraphs: [
      "Zakereen needed a platform capable of handling real-time announcements, attendance tracking, and event management across multiple isolated tenants.",
      "The architecture had to support a mobile app for members and a web dashboard for coordinators, all communicating with a centralized server without leaking data between groups."
    ],
    frictionPoints: [
      "Ensuring strict data isolation between multiple tenants in a single shared database.",
      "Optimizing real-time Socket.IO performance and mobile battery life by preventing idle connections.",
      "Handling heavy media uploads and push notifications without blocking the main event loop."
    ],
    solutionStatement: "The solution: an event-driven, tenant-scoped architecture.",
    solutionParagraphs: [
      "We engineered a secure Express backend utilizing BullMQ for asynchronous jobs like push notifications and event reminders, ensuring the core API remains highly responsive. Redis caching was implemented to drastically reduce database round-trips.",
      "On the frontend, we built a highly optimized React Native (Expo) app using virtualization for smooth scrolling, alongside a Next.js admin panel for comprehensive tenant oversight. The entire system was hardened with strict authentication to guarantee data privacy."
    ]
  },
  {
    id:       "p2",
    title:    "Raj Aluminums",
    category: "B2B Digital Modernization",
    year:     "2024",
    tags:     ["Vite", "Turborepo", "Web Architecture"],
    image:    "/image/rajaluminums.png",
    color:    "#d4e157",
    description: "Transforming a traditional manufacturing powerhouse into a digital-first global B2B brand with a high-performance web architecture.",
    problemStatement: "The challenge: a legacy digital footprint that failed to reflect industrial capabilities.",
    problemParagraphs: [
      "Raj Aluminums is a manufacturing leader, but their digital presence was anchored in the past. B2B clients and international partners visiting their site encountered a slow, outdated interface that failed to convey the scale, precision, and quality of their industrial operations.",
      "They needed a platform that was as robust and meticulously engineered as the products they manufacture. The goal was to build a lightning-fast, highly optimized digital storefront that instantly communicated trust and enterprise-grade capability."
    ],
    frictionPoints: [
      "A monolithic legacy codebase that resulted in slow page loads and poor SEO performance, severely limiting international reach.",
      "A lack of modern tooling, making content updates slow and developer iteration virtually impossible.",
      "An uninspiring visual identity that didn't match the company's actual market dominance and manufacturing precision."
    ],
    solutionStatement: "The solution: a modern, high-speed Turborepo architecture driven by Vite.",
    solutionParagraphs: [
      "We replaced their legacy systems with a cutting-edge Turborepo structure, deploying a highly optimized React application powered by Vite and SWC. This architectural leap dramatically reduced build times and ensured near-instantaneous page loads for end users.",
      "Visually, we introduced a premium, industrial aesthetic—leveraging sharp typography, high-contrast layouts, and smooth micro-interactions. The new platform doesn't just list products; it serves as a high-converting digital showroom that positions Raj Aluminums as a forward-thinking global leader."
    ]
  },
  {
    id:       "p1",
    title:    "Oddiville",
    category: "Full-Stack Enterprise Platform",
    year:     "2024",
    tags:     ["React", "Redux", "Node.js", "Mobile App"],
    image:    "/image/oddiville.png",
    color:    "#2ec4b6",
    description: "A complex enterprise-level ecosystem bridging a powerful web administration panel, a robust backend API, and a seamless cross-platform mobile application.",
    problemStatement: "The challenge: unifying fragmented operational systems into a single, scalable digital ecosystem.",
    problemParagraphs: [
      "Oddiville needed to modernize its internal operations and client-facing interfaces simultaneously. Their existing architecture was fragmented, resulting in duplicated data entry, inconsistent user experiences across web and mobile, and a backend that struggled to scale with increasing user loads.",
      "They required a high-performance, centralized platform that could seamlessly handle complex state management on the client side while interacting with a highly secure, high-throughput server architecture."
    ],
    frictionPoints: [
      "Inconsistent data synchronization between the web admin panel and the mobile application.",
      "Sluggish UI performance caused by inefficient state management and unoptimized component re-rendering.",
      "A lack of a unified design system, causing the mobile and web platforms to feel like disconnected products."
    ],
    solutionStatement: "The solution: engineering a unified, high-throughput full-stack architecture.",
    solutionParagraphs: [
      "We architected a unified ecosystem from the ground up. On the frontend, we deployed a React and Redux-powered web application, ensuring predictable state management and lightning-fast UI updates. For data synchronization, we implemented robust API polling and caching strategies using React Query.",
      "The mobile application was built to mirror the web's premium aesthetic while prioritizing native-level performance and gesture fluidity. The result is a cohesive digital infrastructure that empowers administrators and delights users, wrapped in a scalable, future-proof tech stack."
    ]
  },
  {
    id:       "p3",
    title:    "ZippyKeys",
    category: "Gamified Interactive App",
    year:     "2023",
    tags:     ["React", "Claymorphism", "Gamification"],
    image:    "/image/zippykeys.png",
    color:    "#3acae4",
    description: "Evolving a standard typing test utility into a highly engaging, immersive claymorphic gaming experience.",
    problemStatement: "The challenge: breaking away from the sterile, utility-driven design of standard typing tests.",
    problemParagraphs: [
      "Typing tests have historically been treated as purely functional utilities. ZippyKeys wanted to break this mold by transforming the mundane act of typing into an engaging, sticky, and competitive gaming experience.",
      "The initial prototype functioned well, but it lacked the visual polish, tactile feedback, and social sharing mechanics required to retain users and encourage viral growth. It felt like a tool, not a game."
    ],
    frictionPoints: [
      "A flat, uninspiring UI that failed to provide the satisfying visual and tactile feedback expected from modern web games.",
      "No compelling loop or social integration, meaning users would take a test once and never return or share their results.",
      "Fragmented navigation between the lobby, practice modes, and statistics screens, disrupting the immersive experience."
    ],
    solutionStatement: "The solution: an immersive, claymorphic UI with integrated social mechanics.",
    solutionParagraphs: [
      "We executed a complete visual and architectural overhaul, implementing a playful, tactile 'Claymorphism' design system. The interface now feels physical, with deep shadows, rounded geometry, and satisfying micro-animations that respond to every keystroke.",
      "To drive engagement, we engineered a dynamic 'Stats & Share' system. Users can now generate beautiful, customized image snapshots of their high scores—complete with embedded QR codes linking to their profiles—which can be instantly copied to the clipboard or shared directly to social media. ZippyKeys is now a highly retentive, competitive typing ecosystem."
    ]
  }
];
