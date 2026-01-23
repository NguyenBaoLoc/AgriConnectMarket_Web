import React, { useState } from "react";
import { Star, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Textarea } from "../../../../components/ui/textarea";
import { Label } from "../../../../components/ui/label";
import useReviews from "../../../../hooks/useReviews";
import type { Review } from "../../../../hooks/useReviews";
import { toast } from "sonner";

interface AddReviewFormProps {
  farmId: string;
  productId: string;
  onAdded?: (review: Review) => void;
}

export const AddReviewForm: React.FC<AddReviewFormProps> = ({ farmId, productId, onAdded }) => {
  const { addReview, getReviewByProduct } = useReviews();
  const [rating, setRating] = useState<number>(5);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username") || "Anonymous";

  const existing = getReviewByProduct(farmId, productId);
  const userAlready = !!existing;

  const handleFile = (file?: File) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageBase64(undefined);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!userId) {
      toast.error("Please sign in to submit a review.");
      return;
    }
    if (userAlready) {
      toast.error("This product already has a review.");
      return;
    }
    if (!text.trim()) {
      toast.error("Please write a review.");
      return;
    }
    setSubmitting(true);
    try {
      const review = addReview({
        farmId,
        productId,
        userId,
        userName: username || undefined,
        rating,
        text: text.trim(),
        imageBase64,
      } as Omit<Review, "id" | "createdAt">);
      toast.success("Review submitted successfully!");
      setRating(5);
      setText("");
      setImageBase64(undefined);
      onAdded && onAdded(review);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add review");
    } finally {
      setSubmitting(false);
    }
  };

  if (userAlready) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
        <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
        <p className="text-yellow-900 font-semibold">You've already reviewed this product</p>
        <p className="text-sm text-yellow-700 mt-1">Thank you for sharing your feedback!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Star Rating */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          Your Rating *
        </Label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className="transition-transform hover:scale-110 active:scale-95"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoveredRating(n)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  n <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-gray-200 text-gray-200"
                }`}
              />
            </button>
          ))}
          <span className="ml-3 text-lg font-semibold text-gray-900">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </span>
        </div>
      </div>

      {/* Review Text */}
      <div>
        <Label htmlFor="review-text" className="text-base font-semibold text-gray-900 mb-3 block">
          Your Review *
        </Label>
        <Textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience with this product... What did you like? What could be improved?"
          rows={5}
          className="resize-none border-2 focus:border-blue-500 text-base"
          disabled={submitting}
        />
        <p className="text-xs text-muted-foreground mt-2">
          {text.length} / 1000 characters
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <Label className="text-base font-semibold text-gray-900 mb-3 block">
          Add Photo (Optional)
        </Label>
        
        {!imageBase64 ? (
          <div className="relative">
            <input
              id="review-image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="hidden"
              disabled={submitting}
            />
            <label
              htmlFor="review-image-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Click to upload photo</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
            </label>
          </div>
        ) : (
          <div className="relative inline-block">
            <img
              src={imageBase64}
              alt="Review preview"
              className="h-48 w-auto object-cover rounded-xl border-2 border-gray-200 shadow-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-110"
              disabled={submitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4 pt-4">
        <Button
          type="submit"
          disabled={submitting || !text.trim()}
          className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Star className="h-5 w-5 mr-2 fill-white" />
              Submit Review
            </>
          )}
        </Button>
      </div>

      {!userId && (
        <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
          <p className="text-sm text-orange-900 font-medium text-center">
            Please sign in to submit a review
          </p>
        </div>
      )}
    </form>
  );
};

export default AddReviewForm;
