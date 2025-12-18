import { useCallback } from "react";

export interface ReviewReply {
  farmerId: string;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  farmId: string;
  productId: string;
  userId: string;
  userName?: string;
  rating: number;
  text?: string;
  imageBase64?: string;
  createdAt: string;
  reply?: ReviewReply;
}

const STORAGE_KEY = "agri_reviews_v1";

function readAll(): Review[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Review[];
  } catch (e) {
    console.error("Failed to read reviews from localStorage", e);
    return [];
  }
}

function writeAll(list: Review[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to write reviews to localStorage", e);
  }
}

export const useReviews = () => {
  const getReviewsByFarm = useCallback((farmId: string): Review[] => {
    return readAll().filter((r) => r.farmId === farmId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, []);

  const getReviewByProduct = useCallback((farmId: string, productId: string): Review | undefined => {
    return readAll().find((r) => r.farmId === farmId && r.productId === productId);
  }, []);

  const addReview = useCallback((payload: Omit<Review, "id" | "createdAt">) => {
    const all = readAll();
    const now = new Date().toISOString();
    const review: Review = {
      ...payload,
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      createdAt: now,
    };
    // Enforce: only one review per product (global) and one review per customer per farm
    const productExists = all.some((r) => r.farmId === payload.farmId && r.productId === payload.productId);
    const userAlreadyReviewedInFarm = all.some((r) => r.farmId === payload.farmId && r.userId === payload.userId);
    if (productExists) {
      throw new Error("This product already has a review.");
    }
    if (userAlreadyReviewedInFarm) {
      throw new Error("You have already reviewed a product of this farm.");
    }
    all.push(review);
    writeAll(all);
    return review;
  }, []);

  const replyToReview = useCallback((reviewId: string, farmerId: string, text: string) => {
    const all = readAll();
    const idx = all.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error("Review not found");
    if (all[idx].reply) throw new Error("Review already has a reply");
    all[idx].reply = { farmerId, text, createdAt: new Date().toISOString() };
    writeAll(all);
    return all[idx];
  }, []);

  const removeAll = useCallback(() => {
    writeAll([]);
  }, []);

  return {
    getReviewsByFarm,
    getReviewByProduct,
    addReview,
    replyToReview,
    removeAll,
  } as const;
};

export default useReviews;
