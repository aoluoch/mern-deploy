const paypal = require("../../helpers/paypal");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      payerId,
      cartId,
    } = req.body;

    // Create PayPal payment first
    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-return`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/shop/paypal-cancel`,
      },
      transactions: [
        {
          item_list: {
            items: cartItems.map((item) => ({
              name: item.title,
              sku: item.productId,
              price: item.price.toFixed(2),
              currency: "USD",
              quantity: item.quantity,
            })),
          },
          amount: {
            currency: "USD",
            total: totalAmount.toFixed(2),
          },
          description: "description",
        },
      ],
    };

    paypal.payment.create(create_payment_json, async (error, paymentInfo) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Error while creating paypal payment",
        });
      }

      // Create temporary order with pending status
      const tempOrder = new Order({
        userId,
        cartId,
        cartItems,
        addressInfo,
        orderStatus: "pending",
        paymentMethod,
        paymentStatus: "pending",
        totalAmount,
        orderDate,
        orderUpdateDate,
        paymentId: "",
        payerId: "",
      });

      await tempOrder.save();

      const approvalURL = paymentInfo.links.find(
        (link) => link.rel === "approval_url"
      ).href;

      res.status(201).json({
        success: true,
        approvalURL,
        orderId: tempOrder._id,
      });
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    // If order is already paid, prevent double processing
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // Verify payment with PayPal before updating order
    paypal.payment.get(paymentId, async (error, payment) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Error verifying payment with PayPal",
        });
      }

      if (payment.state !== "approved") {
        return res.status(400).json({
          success: false,
          message: "Payment not approved",
        });
      }

      // Update order only after payment verification
      order.paymentStatus = "paid";
      order.orderStatus = "confirmed";
      order.paymentId = paymentId;
      order.payerId = payerId;

      // Update product stock levels
      for (let item of order.cartItems) {
        let product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.title}`,
          });
        }

        if (product.totalStock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Not enough stock for product: ${product.title}`,
          });
        }

        product.totalStock -= item.quantity;
        await product.save();
      }

      // Clear the cart after successful payment
      const getCartId = order.cartId;
      if (getCartId) {
        await Cart.findByIdAndDelete(getCartId);
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: "Payment successful and order confirmed",
        data: order,
      });
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: e.message,
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};
