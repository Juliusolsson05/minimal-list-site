function envFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Minimal List",
  owner: process.env.NEXT_PUBLIC_SITE_OWNER || "Your Name",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "A clean personal list site for things worth keeping track of.",
  about:
    process.env.NEXT_PUBLIC_SITE_ABOUT ||
    "A personal collection of items, posters, references, and archived things.",
  features: {
    ai: envFlag(process.env.NEXT_PUBLIC_ENABLE_AI, false),
    posters: envFlag(process.env.NEXT_PUBLIC_ENABLE_POSTERS, true),
    music: envFlag(process.env.NEXT_PUBLIC_ENABLE_MUSIC, false),
  },
};
