import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";

function UserCartItemsContent({ cartItem }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast } = useToast();

  function handleUpdateQuantity(type) {
    let newQuantity =
      type === "increment" ? cartItem.quantity + 1 : cartItem.quantity - 1;

    if (newQuantity === 0) {
      dispatch(deleteCartItem(cartItem?._id)).then((response) => {
        if (response?.payload?.success) {
          toast({
            title: "Cart Item removed successfully",
          });
        }
      });
      return;
    }

    dispatch(
      updateCartQuantity({
        cartItemId: cartItem?._id,
        userId: user?.id,
        quantity: newQuantity,
      })
    ).then((response) => {
      if (response?.payload?.success) {
        toast({
          title: `Quantity ${type === "increment" ? "increased" : "decreased"}`,
        });
      }
    });
  }

  function handleRemoveCartItem() {
    dispatch(deleteCartItem(cartItem?._id)).then((response) => {
      if (response?.payload?.success) {
        toast({
          title: "Cart Item removed successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-start gap-4">
      <img
        src={cartItem?.productId?.image}
        className="h-[120px] w-[120px] rounded-lg object-cover"
      />
      <div className="flex flex-1 flex-col gap-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{cartItem?.productId?.title}</h3>
            <p className="text-sm text-muted-foreground">
              ${cartItem?.productId?.price}
            </p>
          </div>
          <Button
            onClick={handleRemoveCartItem}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleUpdateQuantity("decrement")}
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
          >
            <Minus className="h-3 w-3" />
            <span className="sr-only">Remove one item</span>
          </Button>
          <span className="text-sm">{cartItem?.quantity}</span>
          <Button
            onClick={() => handleUpdateQuantity("increment")}
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-full"
          >
            <Plus className="h-3 w-3" />
            <span className="sr-only">Add one item</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserCartItemsContent;
