import { Product } from "@prisma/client";
import axios from "axios";

export const fetchLikedProducts = async (): Promise<Product[]> => {
  const { data } = await axios.get<Product[]>("/api/likes");
  return data;
};

export const likeProduct = async (productId: string): Promise<void> => {
  await axios.post(`/api/like/${productId}`);
};

export const unlikeProduct = async (productId: string): Promise<void> => {
  await axios.delete(`/api/like/${productId}`);
};
