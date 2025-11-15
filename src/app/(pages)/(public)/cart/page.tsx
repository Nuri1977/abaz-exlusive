import CartPageClient from "./_components/CartPageClient";

// Static SEO metadata for Cart page
export const metadata = {
  title: "Shopping Cart - Review Your Selected Dresses | Abaz Exclusive",
  description: "Review your selected women's dresses and fashion items. Secure checkout and fast shipping available for your Abaz Exclusive purchases.",
  robots: { index: false, follow: true },
};

export default function CartPage() {

  return (
    <CartPageClient />
  );
}
