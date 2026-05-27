export const env = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-12-01",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  readToken: process.env.SANITY_READ_TOKEN,
  revalidateSecret: process.env.SANITY_REVALIDATE_SECRET,
};

export const isSanityConfigured = (): boolean =>
  !!env.projectId && env.projectId !== "your_project_id_here";
