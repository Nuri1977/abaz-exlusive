import type { Metadata } from "next";

import { generateAboutMetadata } from "@/lib/metadata";

import AboutUsPublicClient from "./AboutUsPublicClient";

// Generate SEO metadata for About page
export const metadata: Metadata = generateAboutMetadata();

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
export const dynamic = "force-dynamic";

async function fetchAboutUsPublic() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/about`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return null;
    }

    // eslint-disable-next-eslint/no-unsafe-assignment
    const result = await res.json();
    return result?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch about us:", error);
    return null;
  }
}

export default async function AboutPage() {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const aboutUs = await fetchAboutUsPublic();

  return (
    <main className="w-full">
      <div className="container mx-auto min-h-[60vh] px-4 py-8">
        <AboutUsPublicClient aboutUs={aboutUs} />
      </div>
    </main>
  );
}
