import ProductPageClient from "./_components/ProductPageClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductPageClient id={id} />;
}
