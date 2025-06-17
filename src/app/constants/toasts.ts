export const toastPresets = {
  mustBeLoggedInForLike: {
    title: "Login required",
    description: "Please log in to like or unlike products.",
    variant: "destructive" as const,
  },
  likeSuccess: {
    title: "Liked!",
    description: "Product added to your likes.",
  },
  unlikeSuccess: {
    title: "Unliked!",
    description: "Product removed from your likes.",
  },
  genericError: {
    title: "Something went wrong",
    description: "Try again later.",
    variant: "destructive" as const,
  },
};
