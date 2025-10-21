const { Router } = require("express");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");
const auth = require("../middleware/auth");

const router = Router();

// GET /api/orders – Get user's orders
router.get("/", auth, async (req, res, next) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate("products.productId", "name image")
      .sort({ createdAt: -1 });

    console.log("📋 Found orders count:", orders.length);
    res.json(orders);
  } catch (err) {
    console.error("❌ Get orders error:", err);
    next(err);
  }
});

// GET /api/orders/:id – Get single order
router.get("/:id", auth, async (req, res, next) => {
  try {
    console.log("🔍 Getting order ID:", req.params.id);

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    }).populate("products.productId", "name image description");

    if (!order) {
      console.log("❌ Order not found for ID:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order found:", order._id);
    res.json(order);
  } catch (err) {
    console.error("❌ Get order error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

// POST /api/orders – Create new order
router.post("/", auth, async (req, res, next) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    console.log("📝 Creating order:", {
      userId: req.userId,
      productsCount: products?.length,
      paymentMethod,
      shippingAddress: shippingAddress ? "provided" : "missing",
      requestBody: req.body,
    });

    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log("❌ Validation failed: Products are required");
      return res.status(400).json({ message: "Products are required" });
    }

    if (!shippingAddress) {
      console.log("❌ Validation failed: Shipping address is required");
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // Validate products and calculate total
    let totalAmount = 0;
    const validatedProducts = [];

    for (const item of products) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          message: "Invalid product data: productId and quantity are required",
        });
      }

      // Get product details
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.image,
      });
    }

    // Create order
    console.log("📦 Creating order with data:", {
      userId: req.userId,
      productsCount: validatedProducts.length,
      totalAmount,
      paymentMethod: paymentMethod || "cash_on_delivery",
    });

    const order = new Order({
      userId: req.userId,
      products: validatedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "cash_on_delivery",
      status: "paid",
    });

    console.log("💾 Saving order to database...");
    const savedOrder = await order.save();
    console.log("✅ Order saved to DB:", savedOrder._id);

    // Populate the response
    console.log("🔄 Populating order data...");
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "products.productId",
      "name image description"
    );

    console.log("✅ Order creation completed successfully");
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("❌ Create order error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    // Return more specific error messages
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        details: err.message,
      });
    }

    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid data format",
        details: err.message,
      });
    }

    next(err);
  }
});

// PUT /api/orders/:id/status – Update order status
router.put("/:id/status", auth, async (req, res, next) => {
  try {
    const { status } = req.body;
    console.log("🔄 Updating order status:", req.params.id, "to", status);

    if (
      !status ||
      !["pending", "paid", "shipped", "delivered", "cancelled"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { status },
      { new: true, runValidators: true }
    ).populate("products.productId", "name image description");

    if (!order) {
      console.log("❌ Order not found for ID:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order status updated:", order._id);
    res.json(order);
  } catch (err) {
    console.error("❌ Update order status error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

// PUT /api/orders/:id/payment – Update order payment status
router.put("/:id/payment", auth, async (req, res, next) => {
  try {
    const { paymentId, status } = req.body;
    console.log("💳 Updating order payment:", req.params.id, {
      paymentId,
      status,
    });

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid order ID" });
    }

    const updateData = {};
    if (paymentId) updateData.paymentId = paymentId;
    if (status) updateData.status = status;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).populate("products.productId", "name image description");

    if (!order) {
      console.log("❌ Order not found for ID:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("✅ Order payment updated:", order._id);
    res.json(order);
  } catch (err) {
    console.error("❌ Update order payment error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

module.exports = router;
