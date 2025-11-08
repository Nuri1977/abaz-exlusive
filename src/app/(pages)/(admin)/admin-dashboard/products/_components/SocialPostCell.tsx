import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { FacebookIcon, InstagramIcon, Loader2 } from "lucide-react";

import { type ProductWithVariants } from "@/types/product";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";

function SocialPostCell({ product }: { product: ProductWithVariants }) {
  const [isPostingFacebook, setIsPostingFacebook] = useState(false);
  const [isPostingInstagram, setIsPostingInstagram] = useState(false);
  const [showFacebookDialog, setShowFacebookDialog] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const { toast } = useToast();

  // Build product URL (adjust your domain as needed)
  const productUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/products/${product.slug || product.id}`;
  const productImageUrl = product.images?.[0]?.url;
  const formattedPrice = formatPrice(product.price ? Number(product.price) : 0);

  const handleFacebookPost = async () => {
    setShowFacebookDialog(false);
    setIsPostingFacebook(true);

    try {
      // Create the message for Facebook
      const message = `🛍️ ${product.name}

${product.description || "Check out this amazing product!"}

💰 Price: ${formattedPrice}

🔗 Shop now: ${productUrl}

#AbazExclusive #Fashion #NewArrival`;

      const response = await fetch("/api/admin/post/facebook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          productLink: productUrl,
          imageUrl: productImageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details || data?.error || "Failed to post to Facebook"
        );
      }

      toast({
        title: "Posted to Facebook!",
        description: `${product.name} has been posted to your Facebook page.`,
      });
    } catch (error) {
      console.error("Facebook post error:", error);
      toast({
        title: "Failed to post to Facebook",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while posting.",
        variant: "destructive",
      });
    } finally {
      setIsPostingFacebook(false);
    }
  };

  const handleInstagramPost = async () => {
    setShowInstagramDialog(false);
    setIsPostingInstagram(true);

    try {
      const caption = `${product.name}

${product.description || "Check out this amazing product!"}

💰 ${formattedPrice}

🔗 Link in bio to shop!

#AbazExclusive #Fashion #NewArrival #Shopping`;

      const response = await fetch("/api/admin/post/instagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caption,
          imageUrl: productImageUrl,
          productLink: productUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.details || data?.error || "Failed to post to Instagram"
        );
      }

      toast({
        title: "Posted to Instagram!",
        description: `${product.name} has been posted to your Instagram page.`,
      });
    } catch (error) {
      console.error("Instagram post error:", error);
      toast({
        title: "Failed to post to Instagram",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while posting.",
        variant: "destructive",
      });
    } finally {
      setIsPostingInstagram(false);
    }
  };

  return (
    <>
      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          className="rounded-md hover:bg-[#1877F2]/10"
          onClick={() => setShowFacebookDialog(true)}
          disabled={isPostingFacebook}
        >
          {isPostingFacebook ? (
            <Loader2 className="size-4 animate-spin stroke-[#1877F2]" />
          ) : (
            <FacebookIcon className="size-4 stroke-[#1877F2]" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-md hover:bg-[#E4405F]/10"
          onClick={() => setShowInstagramDialog(true)}
          disabled={isPostingInstagram || !productImageUrl}
          title={
            !productImageUrl
              ? "Product needs an image for Instagram"
              : undefined
          }
        >
          {isPostingInstagram ? (
            <Loader2 className="size-4 animate-spin stroke-[#E4405F]" />
          ) : (
            <InstagramIcon className="size-4 stroke-[#E4405F]" />
          )}
        </Button>
      </div>

      {/* Facebook Confirmation Dialog */}
      <Dialog open={showFacebookDialog} onOpenChange={setShowFacebookDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post to Facebook</DialogTitle>
            <DialogDescription>
              This will create a new post on your Facebook page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Preview:</p>
              <div className="max-h-[300px] overflow-y-auto rounded-md border bg-gray-50 p-3">
                {productImageUrl && (
                  <div className="relative mb-2 h-32 w-full overflow-hidden rounded">
                    <Image
                      src={productImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                )}
                <p className="font-medium">🛍️ {product.name}</p>
                <p className="mt-2 line-clamp-3 text-gray-600">
                  {product.description || "Check out this amazing product!"}
                </p>
                <p className="mt-2 font-semibold">💰 {formattedPrice}</p>
                <p className="mt-2 truncate text-xs text-blue-600">
                  🔗 {productUrl}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFacebookDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFacebookPost}
              className="bg-[#1877F2] hover:bg-[#1565D8]"
            >
              Post Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Instagram Confirmation Dialog */}
      <Dialog open={showInstagramDialog} onOpenChange={setShowInstagramDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post to Instagram</DialogTitle>
            <DialogDescription>
              This will create a new post on your Instagram page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Preview:</p>
              <div className="max-h-[300px] overflow-y-auto rounded-md border bg-gray-50 p-3">
                {productImageUrl ? (
                  <>
                    <div className="relative mb-2 h-48 w-full overflow-hidden rounded">
                      <Image
                        src={productImageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                    <p className="font-medium">{product.name}</p>
                    <p className="mt-2 line-clamp-3 text-gray-600">
                      {product.description || "Check out this amazing product!"}
                    </p>
                    <p className="mt-2 font-semibold">💰 {formattedPrice}</p>
                    <p className="mt-2 text-sm text-gray-500">
                      #AbazExclusive #Fashion #NewArrival
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-amber-600">
                    ⚠️ Instagram requires an image. Please add a product image
                    first.
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInstagramDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleInstagramPost}
              disabled={!productImageUrl}
              className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90"
            >
              Post Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SocialPostCell;
