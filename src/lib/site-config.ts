export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Minimal List",
  owner: process.env.NEXT_PUBLIC_SITE_OWNER || "Your Name",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "A clean personal list site for things worth keeping track of.",
  about:
    process.env.NEXT_PUBLIC_SITE_ABOUT ||
    "A personal collection of items, posters, references, and archived things.",
};
