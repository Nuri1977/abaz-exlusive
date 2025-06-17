export const toastPresets = {
  mustBeLoggedInForLike: {
    title: "Login required",
    description: "Please log in to like or unlike products.",
    variant: "destructive" as const,
  },
  genericError: {
    title: "Something went wrong",
    description: "Try again later.",
    variant: "destructive" as const,
  },
};
