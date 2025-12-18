import React, { useMemo, useState } from "react";
import { Star, MessageSquare, User, Calendar, Image as ImageIcon, Send, X } from "lucide-react";
import useReviews from "../../../../hooks/useReviews";
import AddReviewForm from "./AddReviewForm";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Avatar } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Textarea } from "../../../../components/ui/textarea";

interface ReviewsProps {
  farmId: string;
  productId: string;
}

export const Reviews: React.FC<ReviewsProps> = ({ farmId, productId }) => {
  const { getReviewsByFarm, getReviewByProduct, replyToReview } = useReviews();
  const [refreshKey, setRefreshKey] = useState(0);
  const reviews = getReviewsByFarm(farmId);
  const productReview = getReviewByProduct(farmId, productId);

  const currentRole = localStorage.getItem("role");
  const accountFarmId = localStorage.getItem("farmId");
  const accountId = localStorage.getItem("accountId");

  const stats = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    let total = 0;
    reviews.forEach((r) => {
      counts[r.rating - 1] = (counts[r.rating - 1] || 0) + 1;
      total += r.rating;
    });
    const avg = reviews.length ? total / reviews.length : 0;
    return { counts, avg };
  }, [reviews]);

  const handleReply = (reviewId: string, text: string) => {
    try {
      if (currentRole !== "Farmer") throw new Error("Only farmer can reply");
      if (accountFarmId !== farmId) throw new Error("You can only reply to reviews of your farm");
      if (!accountId) throw new Error("Missing farmer account id");
      replyToReview(reviewId, accountId, text);
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(e?.message || "Failed to reply");
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClass = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClass} ${
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
          <Star className="h-6 w-6 text-white fill-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <p className="text-muted-foreground">See what others are saying about this product</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Summary Card */}
        <Card className="p-6 border-2 border-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-xl">
          <div className="text-center">
            <div className="mb-3">
              <div className="text-6xl font-bold text-gray-900 mb-2">
                {stats.avg.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(stats.avg), "lg")}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </p>
            </div>

            <div className="mt-6 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const starNum = 5 - i;
                const count = stats.counts[4 - i] || 0;
                const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {starNum} star
                    </span>
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Review Highlight */}
          {productReview && (
            <Card className="p-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-green-600 text-white">Product Review</Badge>
                <span className="text-sm text-muted-foreground">This review is for the current product</span>
              </div>
              
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-lg">
                  {productReview.userName?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{productReview.userName || "Anonymous"}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(productReview.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    {renderStars(productReview.rating)}
                  </div>

                  {productReview.text && (
                    <p className="text-gray-700 leading-relaxed mb-3">{productReview.text}</p>
                  )}

                  {productReview.imageBase64 && (
                    <div className="mb-3">
                      <img
                        src={productReview.imageBase64}
                        alt="Review"
                        className="h-48 w-auto object-cover rounded-xl border-2 border-white shadow-lg"
                      />
                    </div>
                  )}

                  {productReview.reply ? (
                    <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-green-900">Farmer's Response</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed ml-10">{productReview.reply.text}</p>
                      <p className="text-xs text-muted-foreground ml-10 mt-2">
                        {new Date(productReview.reply.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  ) : (
                    currentRole === "Farmer" && accountFarmId === farmId && (
                      <ReplyBox reviewId={productReview.id} onReply={handleReply} />
                    )
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* All Farm Reviews */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              All Reviews for This Farm
            </h4>
            
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card className="p-8 text-center border-2 border-dashed">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-gray-100">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                        {review.userName?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-semibold text-gray-900">{review.userName || "Anonymous"}</h5>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                          {renderStars(review.rating, "sm")}
                        </div>

                        {review.text && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.text}</p>
                        )}

                        {review.imageBase64 && (
                          <div className="mb-3">
                            <img
                              src={review.imageBase64}
                              alt="Review"
                              className="h-32 w-auto object-cover rounded-lg border-2 border-gray-200 shadow-md"
                            />
                          </div>
                        )}

                        {review.reply ? (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="h-3 w-3 text-green-600" />
                              <span className="text-xs font-semibold text-green-900">Farmer's Response</span>
                            </div>
                            <p className="text-gray-700 text-sm">{review.reply.text}</p>
                          </div>
                        ) : (
                          currentRole === "Farmer" && accountFarmId === farmId && (
                            <div className="mt-3">
                              <ReplyBox reviewId={review.id} onReply={handleReply} />
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Review Section */}
      <Card className="mt-8 p-8 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Star className="h-5 w-5 text-white" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-gray-900">Share Your Experience</h4>
            <p className="text-sm text-muted-foreground">Help others by reviewing this product</p>
          </div>
        </div>
        <AddReviewForm farmId={farmId} productId={productId} onAdded={() => setRefreshKey((k) => k + 1)} />
      </Card>
    </div>
  );
};

const ReplyBox: React.FC<{ reviewId: string; onReply: (id: string, text: string) => void }> = ({ reviewId, onReply }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  
  return (
    <div>
      {!open ? (
        <Button 
          variant="outline" 
          onClick={() => setOpen(true)} 
          size="sm"
          className="text-green-600 border-green-200 hover:bg-green-50"
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          Reply
        </Button>
      ) : (
        <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-green-200">
          <Textarea 
            className="resize-none border-2 focus:border-green-500" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your response..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button 
              onClick={() => { 
                onReply(reviewId, text); 
                setOpen(false); 
                setText(""); 
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={!text.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              Send Reply
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { setOpen(false); setText(""); }}
              className="hover:bg-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
