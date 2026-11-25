import type { MetadataRoute } from "next";

/** Lets clients install the portal (required for push notifications on iPhone). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Echo Media Production",
    short_name: "Echo",
    description: "Your Echo projects, payments and deliverables.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#01081B",
    theme_color: "#01081B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
