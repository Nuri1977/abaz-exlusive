"use client";

import { useEffect, useState } from "react";

import AboutUsPublicClient from "./AboutUsPublicClient";

export default function AboutPage() {
  const [aboutUs, setAboutUs] = useState(null);
  useEffect(() => {
    const fetchAbout = async () => {
      const res = await fetch("/api/about", { cache: "no-store" });
      if (!res.ok) return setAboutUs(null);
      const result = await res.json();
      const data = result?.data?.data ? result.data.data : result.data;
      setAboutUs(data);
    };
    fetchAbout();
  }, []);
  return (
    <main className="w-full">
      <div className="container mx-auto px-4 py-8 min-h-[60vh]">
        <AboutUsPublicClient aboutUs={aboutUs} />
      </div>
    </main>
  );
}
