import React from "react";

// Static SEO metadata for Likes page
export const metadata = {
  title: "Your Favorite Dresses - Saved Items | Abaz Exclusive",
  description: "View your saved and liked women's dresses. Keep track of your favorite fashion items and shop them later at Abaz Exclusive.",
  robots: { index: false, follow: true },
};

export default function LikesPage() {
  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-4 text-3xl font-bold">Likes</h1>
      <p>Your liked products will appear here.</p>
    </div>
  );
}
