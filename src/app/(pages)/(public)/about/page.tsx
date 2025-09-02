import AboutUsPublicClient from "./AboutUsPublicClient";

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

    const result = await res.json();
    return result?.data ?? null;
  } catch (error) {
    console.error("Failed to fetch about us:", error);
    return null;
  }
}

export default async function AboutPage() {
  const aboutUs = await fetchAboutUsPublic();

  return (
    <main className="w-full">
      <div className="container mx-auto min-h-[60vh] px-4 py-8">
        <AboutUsPublicClient aboutUs={aboutUs} />
      </div>
    </main>
  );
}
