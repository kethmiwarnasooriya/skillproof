export const NAV_LINKS = [
  { label: "Who we are", to: "/about" },
  { label: "How to use", to: "/how-to-use" },
  { label: "About AI Agent", to: "/ai-agent" },
  { label: "Terms", to: "/terms" },
];

// Only shown in the navbar when the user is logged in
export const MEMBER_NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Task Hub", to: "/tasks" },
];

// Modules on the signed-in dashboard. Add an entry here to plug in a new feature; "soon" renders a placeholder.
export const DASHBOARD_MODULES = [
  {
    id: "certificate", icon: "certificate", primary: true, to: "/certificates/new", cta: "Submit a certificate",
    title: "Submit Certificate",
    description: "Paste a certificate link. Our AI reads it and lists the practical skills it covers.",
  },
  {
    id: "tasks", icon: "tasks", to: "/tasks", cta: "Open Task Hub",
    title: "AI Task Hub",
    description: "Hands-on challenges matched to the skills from your certificates. Pick one and submit your evidence.",
  },
  {
    id: "proof", icon: "proof", status: "soon",
    title: "Proof Page",
    description: "A shareable page of your reviewed work that you can send to employers.",
  },
  {
    id: "review", icon: "review", status: "soon",
    title: "AI Evaluation",
    description: "Detailed feedback on your submitted evidence, with a score for each skill.",
  },
];

export const STEPS = [
  { title: "Submit your certificate", short: "Upload what you have completed.", body: "Upload a course or certification you have completed. We check it is real before anything else." },
  { title: "Practice on real tasks", short: "Apply it hands-on, not just on paper.", body: "Work through hands-on exercises tied to that certificate, guided by our AI agent." },
  { title: "Get your review", short: "Receive feedback you can show employers.", body: "A reviewer scores your work and writes feedback. You get a proof page you can share." },
];
