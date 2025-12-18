import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { Footer } from "../components";

interface FeedbackPageProps {
    onBack: () => void;
}

export function FeedbackPage({
    onBack,
}: FeedbackPageProps) {
    const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [comments, setComments] = useState("");

    // Mock order data
    const order = {
        orderNumber: "ORD-2025-1001",
        date: "2025-10-28",
        items: [
            { id: "1", name: "Organic Tomatoes", image: "https://images.unsplash.com/photo-1546470427-227dddc6c7aa?w=200&h=200&fit=crop" },
            { id: "2", name: "Fresh Spinach", image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=200&h=200&fit=crop" },
            { id: "3", name: "Green Apples", image: "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=200&h=200&fit=crop" },
        ],
    };

    const handleProductRating = (productId: string, rating: number) => {
        setProductRatings((prev) => ({
            ...prev,
            [productId]: rating,
        }));
    };

    const handleSubmitFeedback = () => {
        // Check if all products are rated
        const allProductsRated = order.items.every((item) => productRatings[item.id]);

        if (!allProductsRated) {
            toast.error("Please rate all products");
            return;
        }

        if (deliveryRating === 0) {
            toast.error("Please rate the delivery service");
            return;
        }

        toast.success("Thank you for your feedback!");
        setTimeout(() => onBack(), 1500);
    };

    const StarRating = ({
        rating,
        onRate,
    }: {
        rating: number;
        onRate: (rating: number) => void;
    }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRate(star)}
                        className="transition-transform hover:scale-110"
                    >
                        <Star
                            className={`h-8 w-8 ${star <= rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                        />
                    </button>
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                {/* Back Button */}
                <Button variant="ghost" onClick={onBack} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-gray-900 mb-2">Order Feedback</h1>
                    <p className="text-muted-foreground">
                        Help us improve by rating your experience
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Order: {order.orderNumber} • {order.date}
                    </p>
                </div>

                {/* Product Ratings */}
                <Card className="p-6 mb-6">
                    <h3 className="text-gray-900 mb-4">Rate Products</h3>
                    <div className="space-y-6">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 pb-6 border-b last:border-0 last:pb-0"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                    <p className="mb-2">{item.name}</p>
                                    <StarRating
                                        rating={productRatings[item.id] || 0}
                                        onRate={(rating) => handleProductRating(item.id, rating)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Delivery Rating */}
                <Card className="p-6 mb-6">
                    <h3 className="text-gray-900 mb-4">Rate Delivery Service</h3>
                    <StarRating
                        rating={deliveryRating}
                        onRate={setDeliveryRating}
                    />
                </Card>

                {/* Comments */}
                <Card className="p-6 mb-6">
                    <div className="space-y-2">
                        <Label>Additional Comments (Optional)</Label>
                        <Textarea
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Share your experience with us..."
                            rows={6}
                        />
                    </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onBack}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={handleSubmitFeedback}
                    >
                        Submit Feedback
                    </Button>
                </div>
            </div>
            <Footer />
        </div>
    );
}
