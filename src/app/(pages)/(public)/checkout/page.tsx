import CheckoutPageClient from "./_components/CheckoutPageClient";

// Static SEO metadata for Checkout page
export const metadata = {
  title: "Secure Checkout - Complete Your Fashion Purchase | Abaz Exclusive",
  description: "Complete your purchase of premium women's dresses with our secure checkout process. Fast shipping and excellent customer service guaranteed.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {

  return (
    <CheckoutPageClient />
  );
}
