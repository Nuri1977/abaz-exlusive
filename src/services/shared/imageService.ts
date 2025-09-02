export const deleteImage = async (imageId: string) => {
  try {
    const response = await fetch(`/api/admin/uploadthing/${imageId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data: unknown = await response.json();
      const message =
        typeof data === "object" && data !== null && "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
          ? (data as { error?: string }).error
          : "Failed to delete image";
      return {
        success: false,
        message,
      };
    }

    const data: unknown = await response.json();
    const deletedCount =
      typeof data === "object" && data !== null &&
      typeof (data as { deletedCount?: unknown }).deletedCount === "number"
        ? (data as { deletedCount: number }).deletedCount
        : undefined;
    return {
      success: true,
      message: "Image deleted successfully",
      deletedCount,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete image";
    return {
      success: false,
      message,
    };
  }
};
