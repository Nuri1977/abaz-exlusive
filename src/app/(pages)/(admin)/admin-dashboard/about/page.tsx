import AboutUsClient from "./_components/AboutUsClient";

export default function AboutUsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">About Us</h1>
        <p className="text-muted-foreground">
          Manage the About Us page content
        </p>
      </div>
      <AboutUsClient />
    </div>
  );
}
