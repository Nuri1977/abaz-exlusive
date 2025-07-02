import api from "@/lib/axios";

// Fetch About Us (public)
export const fetchAboutUs = async (): Promise<any> => {
  const response = await api.get<{ data: any }>("/about");
  console.log("[fetchAboutUs] API response:", response);
  if (response?.data?.data !== undefined) {
    console.log("[fetchAboutUs] Returning:", response.data.data);
    return response.data.data;
  }
  if (response?.data !== undefined) {
    console.log("[fetchAboutUs] Returning:", response.data);
    return response.data;
  }
  console.log("[fetchAboutUs] Returning null");
  return null;
};

// Update About Us (admin)
export const updateAboutUs = async (aboutUs: any): Promise<any> => {
  const response = await api.put<{ aboutUs?: any; data?: any }>(
    "/admin/about",
    { aboutUs }
  );
  console.log("[updateAboutUs] API response:", response);
  if (response?.data?.aboutUs !== undefined) {
    console.log("[updateAboutUs] Returning:", response.data.aboutUs);
    return response.data.aboutUs;
  }
  if (response?.data?.data !== undefined) {
    console.log("[updateAboutUs] Returning:", response.data.data);
    return response.data.data;
  }
  if (response?.data !== undefined) {
    console.log("[updateAboutUs] Returning:", response.data);
    return response.data;
  }
  console.log("[updateAboutUs] Returning null");
  return null;
};
