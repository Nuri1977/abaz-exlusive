export const deleteImage = async (imageId: string) => {
  try {
    const response = await fetch(`/api/admin/uploadthing/${imageId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        message: data.error || "Failed to delete image",
      };
    }

    const data = await response.json();
    return {
      success: true,
      message: "Image deleted successfully",
      deletedCount: data.deletedCount,
    };
  } catch (error: any) {
    console.error("Error deleting image:", error);
    return {
      success: false,
      message: error?.message || "Failed to delete image",
    };
  }
};
