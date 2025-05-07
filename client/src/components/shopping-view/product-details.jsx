import { Star, X } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogClose } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { setProductDetails } from "@/store/shop/products-slice";
import { Label } from "../ui/label";
import StarRatingComponent from "../common/star-rating";
import { useEffect, useState } from "react";
import { addReview, getReviews } from "@/store/shop/review-slice";

function ProductDetailsDialog({ open, setOpen, productDetails }) {
  const [reviewMsg, setReviewMsg] = useState("");
  const [rating, setRating] = useState(0);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { reviews } = useSelector((state) => state.shopReview);
  const { toast } = useToast();

  function handleRatingChange(getRating) {
    setRating(getRating);
  }

  function handleAddToCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({ title: "Product is added to cart" });
      }
    });
  }

  function handleDialogClose() {
    setOpen(false);
    dispatch(setProductDetails());
    setRating(0);
    setReviewMsg("");
  }

  function handleAddReview() {
    dispatch(
      addReview({
        productId: productDetails?._id,
        userId: user?.id,
        userName: user?.userName,
        reviewMessage: reviewMsg,
        reviewValue: rating,
      })
    ).then((data) => {
      if (data.payload.success) {
        setRating(0);
        setReviewMsg("");
        dispatch(getReviews(productDetails?._id));
        toast({ title: "Review added successfully!" });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) {
      dispatch(getReviews(productDetails._id));
    }
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="h-[90vh] w-full max-w-[95vw] md:max-w-5xl p-0 relative">
        <DialogClose asChild>
          <button
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogClose>

        <div className="flex h-full flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="grid h-full grid-cols-1 md:grid-cols-[1fr,1.5fr]">
              <div className="relative flex h-[300px] md:h-[600px] items-center justify-center bg-background p-6">
                <div className="relative h-full w-full">
                  <img
                    src={productDetails?.image}
                    alt={productDetails?.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col p-6 space-y-6">
                <div className="space-y-4">
                  <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
                    {productDetails?.title}
                  </h1>
                  <p className="text-sm text-muted-foreground sm:text-base">
                    {productDetails?.description}
                  </p>

                  <div className="flex items-baseline gap-4">
                    <p
                      className={`text-2xl font-bold ${
                        productDetails?.salePrice > 0
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      ${productDetails?.price}
                    </p>
                    {productDetails?.salePrice > 0 && (
                      <p className="text-2xl font-bold text-primary">
                        ${productDetails?.salePrice}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRatingComponent rating={averageReview} />
                    <span className="text-sm text-muted-foreground">
                      ({averageReview.toFixed(2)})
                    </span>
                  </div>

                  {productDetails?.totalStock === 0 ? (
                    <Button className="w-full opacity-60 cursor-not-allowed">
                      Out of Stock
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() =>
                        handleAddToCart(
                          productDetails?._id,
                          productDetails?.totalStock
                        )
                      }
                    >
                      Add to Cart
                    </Button>
                  )}
                </div>

                <Separator className="my-2" />

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Reviews</h2>
                  <div className="space-y-4">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((reviewItem) => (
                        <div className="flex gap-4" key={reviewItem._id}>
                          <Avatar className="h-10 w-10 border">
                            <AvatarFallback>
                              {reviewItem?.userName[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">
                                {reviewItem?.userName}
                              </h3>
                              <StarRatingComponent
                                rating={reviewItem?.reviewValue}
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reviewItem.reviewMessage}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No Reviews
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 pt-4">
                    <Label>Write a review</Label>
                    <div className="flex gap-1">
                      <StarRatingComponent
                        rating={rating}
                        handleRatingChange={handleRatingChange}
                      />
                    </div>
                    <Input
                      name="reviewMsg"
                      value={reviewMsg}
                      onChange={(event) => setReviewMsg(event.target.value)}
                      placeholder="Write a review..."
                    />
                    <Button
                      onClick={handleAddReview}
                      disabled={reviewMsg.trim() === ""}
                      className="w-full"
                    >
                      Submit Review
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
