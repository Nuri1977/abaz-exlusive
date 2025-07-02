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
      console.log("data: ", data);
    };
    fetchAbout();
  }, []);
  return (
    <main className="w-full px-0 py-0">
      <AboutUsPublicClient aboutUs={aboutUs} />
    </main>
  );
}
