import { StarIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
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
        toast({
          title: "Product is added to cart",
        });
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
        toast({
          title: "Review added successfully!",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) dispatch(getReviews(productDetails?._id));
  }, [productDetails]);

  const averageReview =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, reviewItem) => sum + reviewItem.reviewValue, 0) /
        reviews.length
      : 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw]">
        <div className="relative overflow-hidden rounded-lg">
          <img
            src={productDetails?.image}
            alt={productDetails?.title}
            className="w-full h-auto object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">{productDetails?.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">{productDetails?.description}</p>
          <div className="flex items-center justify-between">
            <p className={`text-lg font-bold ${productDetails?.salePrice > 0 ? "line-through" : ""}`}>${productDetails?.price}</p>
            {productDetails?.salePrice > 0 && (
              <p className="text-lg font-bold text-red-500">${productDetails?.salePrice}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <StarRatingComponent rating={averageReview} />
            <span className="text-sm text-muted-foreground">({averageReview.toFixed(2)})</span>
          </div>
          <Button 
            className={`w-full ${productDetails?.totalStock === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => handleAddToCart(productDetails?._id, productDetails?.totalStock)}
            disabled={productDetails?.totalStock === 0}
          >
            {productDetails?.totalStock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
          <Separator />
          <div className="overflow-auto max-h-60">
            <h2 className="text-lg font-bold">Reviews</h2>
            <div className="grid gap-4">
              {reviews?.length ? reviews.map((reviewItem) => (
                <div className="flex gap-4" key={reviewItem._id}>
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>{reviewItem?.userName[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{reviewItem?.userName}</h3>
                    <StarRatingComponent rating={reviewItem?.reviewValue} />
                    <p className="text-sm text-muted-foreground">{reviewItem.reviewMessage}</p>
                  </div>
                </div>
              )) : <p>No Reviews</p>}
            </div>
            <div className="mt-4">
              <Label>Write a review</Label>
              <StarRatingComponent rating={rating} handleRatingChange={handleRatingChange} />
              <Input value={reviewMsg} onChange={(e) => setReviewMsg(e.target.value)} placeholder="Write a review..." />
              <Button onClick={handleAddReview} disabled={!reviewMsg.trim()}>Submit</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailsDialog;
