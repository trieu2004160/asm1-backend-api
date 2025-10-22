const { Router } = require("express");
const Order = require("../src/models/Order");
const Product = require("../src/models/Product");
const auth = require("../middleware/auth");
const PayOS = require("../lib/payos");
const MockPayOS = require("../lib/mock-payos");

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

    // Create order with different logic based on payment method
    let orderData = {
      userId: req.userId,
      products: validatedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "cash_on_delivery",
    };

    if (paymentMethod === "cash_on_delivery") {
      // COD: Mark as confirmed (order successful) and set cancellation deadline to 24 hours
      console.log("📦 Creating COD order with confirmed status and 24h cancellation window");
      orderData.status = "confirmed";
      orderData.cancelableUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    } else {
      // Online payment: Mark as pending until payment is completed
      console.log("📦 Creating online payment order with pending status");
      orderData.status = "pending";
    }

    const order = new Order(orderData);

    console.log("💾 Saving order to database...");
    const savedOrder = await order.save();
    console.log("✅ Order saved with status:", orderData.status, "ID:", savedOrder._id);

    // Populate the response
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

// PUT /api/orders/:id/cancel – Cancel an order
router.put("/:id/cancel", auth, async (req, res, next) => {
  try {
    console.log("🚫 Cancelling order ID:", req.params.id);

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid order ID" });
    }

    // Find the order first to check if it can be cancelled
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!order) {
      console.log("❌ Order not found for ID:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    // Only allow cancellation if order is in "paid" or "pending" status
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        message: "Cannot cancel order that has been delivered",
      });
    }

    if (order.status === "shipped") {
      return res.status(400).json({
        message:
          "Cannot cancel order that is already shipped. Please contact support.",
      });
    }

    // Check cancellation deadline for COD orders
    if (order.paymentMethod === "cash_on_delivery" && order.cancelableUntil) {
      const now = new Date();
      if (now > order.cancelableUntil) {
        return res.status(400).json({
          message: "Cancellation deadline has passed. You can only cancel COD orders within 24 hours.",
        });
      }
    }

    // Update order status to cancelled
    order.status = "cancelled";
    const updatedOrder = await order.save();

    // Populate product details
    const populatedOrder = await Order.findById(updatedOrder._id).populate(
      "products.productId",
      "name image description"
    );

    console.log("✅ Order cancelled successfully:", order._id);
    res.json({
      message: "Order cancelled successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("❌ Cancel order error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

// POST /api/orders/payos – Create new order with PayOS payment
router.post("/payos", auth, async (req, res, next) => {
  try {
    const { products, shippingAddress, paymentMethod } = req.body;
    console.log("💳 Creating PayOS order:", {
      userId: req.userId,
      productsCount: products?.length,
      paymentMethod,
      shippingAddress: shippingAddress ? "provided" : "missing",
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

    // Create order with pending status for PayOS
    const order = new Order({
      userId: req.userId,
      products: validatedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod: "payos",
      status: "pending",
    });

    console.log("💾 Saving PayOS order to database...");
    const savedOrder = await order.save();
    console.log("✅ PayOS order saved with pending status, ID:", savedOrder._id);

    // Create PayOS payment link with fallback to mock
    let paymentResult = null;
    let useMockPayOS = false;
    
    try {
      const payos = new PayOS();
      
      // Generate unique order code (use timestamp + order ID hash)
      const orderCode = parseInt(Date.now().toString().slice(-8)) + Math.floor(Math.random() * 1000);
      
      const paymentData = {
        orderCode: orderCode,
        amount: totalAmount,
        description: `Đơn hàng #${savedOrder._id.slice(-8)} - ${validatedProducts.length} sản phẩm`,
        items: validatedProducts.map(product => ({
          name: product.name,
          quantity: product.quantity,
          price: product.price,
        })),
        returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${savedOrder._id}?payment=success`,
        cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/${savedOrder._id}?payment=cancelled`,
      };

      paymentResult = await payos.createPaymentLink(paymentData);
      console.log("✅ PayOS payment link created:", paymentResult.checkoutUrl);
      
    } catch (payosError) {
      console.error("❌ PayOS integration error:", payosError.message);
      console.log("🔄 Falling back to MockPayOS for testing...");
      
      try {
        const mockPayOS = new MockPayOS();
        console.log("🎭 Creating MockPayOS payment link for order:", savedOrder._id);
        console.log("🎭 Order ID type:", typeof savedOrder._id);
        console.log("🎭 Total amount:", totalAmount);
        
        const mockOrderData = {
          orderCode: String(savedOrder._id), // Convert ObjectId to string
          amount: totalAmount,
          description: `Đơn hàng #${String(savedOrder._id).slice(-8)} - ${validatedProducts.length} sản phẩm`,
          items: validatedProducts.map(product => ({
            name: product.name,
            quantity: product.quantity,
            price: product.price,
          })),
          returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/${savedOrder._id}?payment=success`,
          cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:8081'}/payment/${savedOrder._id}?payment=cancelled`,
        };
        
        console.log("🎭 Mock order data:", JSON.stringify(mockOrderData, null, 2));
        
        paymentResult = await mockPayOS.createPaymentLink(mockOrderData);
        useMockPayOS = true;
        console.log("✅ MockPayOS payment link created:", paymentResult.checkoutUrl);
      } catch (mockError) {
        console.error("❌ MockPayOS error:", mockError.message);
        console.error("❌ MockPayOS stack:", mockError.stack);
        
        // Final fallback: create a placeholder payment URL
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';
        paymentResult = {
          success: true,
          checkoutUrl: `${frontendUrl}/mock-payment/${savedOrder._id}?amount=${totalAmount}`,
          orderCode: `mock_${savedOrder._id}`,
        };
        useMockPayOS = true;
        console.log("⚠️ Using final fallback payment URL:", paymentResult.checkoutUrl);
      }
    }
    
    // Update order with payment URL and order code
    if (paymentResult) {
      savedOrder.paymentUrl = paymentResult.checkoutUrl;
      savedOrder.paymentId = paymentResult.orderCode.toString();
      await savedOrder.save();
      
      if (useMockPayOS) {
        console.log("🎭 Using MockPayOS for testing - payment will be simulated");
      }
    }

    // Populate the response
    const populatedOrder = await Order.findById(savedOrder._id).populate(
      "products.productId",
      "name image description"
    );

    console.log("✅ PayOS order creation completed successfully");
    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("❌ Create PayOS order error:", err);
    console.error("❌ Error details:", {
      name: err.name,
      message: err.message,
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

// POST /api/orders/payos/webhook – PayOS webhook handler
router.post("/payos/webhook", async (req, res, next) => {
  try {
    console.log("🔔 Received PayOS webhook:", JSON.stringify(req.body, null, 2));
    
    const { orderCode, status, amount, description, checksum } = req.body;
    
    // Verify webhook signature
    const payos = new PayOS();
    const isValidWebhook = payos.verifyWebhook(req.body);
    
    if (!isValidWebhook) {
      console.error("❌ Invalid PayOS webhook signature");
      return res.status(400).json({ message: "Invalid webhook signature" });
    }
    
    // Find order by payment ID (orderCode)
    const order = await Order.findOne({ paymentId: orderCode.toString() });
    
    if (!order) {
      console.error("❌ Order not found for PayOS orderCode:", orderCode);
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Update order status based on payment status
    if (status === 'PAID') {
      order.status = 'paid';
      console.log("✅ Payment successful for order:", order._id);
      
      // Send notification to user (you can add email/SMS notification here)
      // await sendPaymentSuccessNotification(order);
      
    } else if (status === 'CANCELLED') {
      order.status = 'cancelled';
      console.log("❌ Payment cancelled for order:", order._id);
      
    } else if (status === 'EXPIRED') {
      order.status = 'cancelled';
      console.log("⏰ Payment expired for order:", order._id);
      
    } else {
      console.log("ℹ️ Payment status update:", status, "for order:", order._id);
    }
    
    await order.save();
    
    // Return success response to PayOS
    res.status(200).json({ 
      success: true,
      message: "Webhook processed successfully",
      orderId: order._id,
      status: order.status
    });
    
  } catch (err) {
    console.error("❌ PayOS webhook error:", err);
    res.status(500).json({ message: "Webhook processing failed" });
  }
});

// GET /api/orders/:id/payment-status – Check payment status
router.get("/:id/payment-status", auth, async (req, res, next) => {
  try {
    console.log("🔍 Checking payment status for order:", req.params.id);

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

    // If order has PayOS payment, check status with PayOS
    if (order.paymentMethod === "payos" && order.paymentId && order.paymentId.startsWith("test_") === false) {
      try {
        const payos = new PayOS();
        const paymentInfo = await payos.getPaymentRequestInfo(order.paymentId);
        
        console.log("💳 PayOS payment status:", paymentInfo);
        
        // Update order status if different from PayOS
        if (paymentInfo.data && paymentInfo.data.status) {
          const payosStatus = paymentInfo.data.status;
          if (payosStatus === "PAID" && order.status !== "paid") {
            order.status = "paid";
            await order.save();
          } else if ((payosStatus === "CANCELLED" || payosStatus === "EXPIRED") && order.status !== "cancelled") {
            order.status = "cancelled";
            await order.save();
          }
        }
      } catch (payosError) {
        console.log("⚠️ Could not check PayOS status:", payosError.message);
        // Continue with current order status
      }
    }

    console.log("✅ Payment status check completed:", order._id, order.status);
    res.json({
      orderId: order._id,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentUrl: order.paymentUrl,
    });
  } catch (err) {
    console.error("❌ Check payment status error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

// POST /api/orders/:id/complete-payment – Complete payment process
router.post("/:id/complete-payment", auth, async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    console.log("💰 Completing payment for order:", req.params.id, "Status:", paymentStatus);

    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!order) {
      console.log("❌ Order not found for ID:", req.params.id);
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status based on payment result
    if (paymentStatus === "success" || paymentStatus === "paid") {
      order.status = "paid";
      console.log("✅ Payment completed successfully for order:", order._id);
    } else if (paymentStatus === "cancelled" || paymentStatus === "failed") {
      order.status = "cancelled";
      console.log("❌ Payment failed/cancelled for order:", order._id);
    }

    await order.save();

    // Populate the response
    const populatedOrder = await Order.findById(order._id).populate(
      "products.productId",
      "name image description"
    );

    res.json({
      message: "Payment status updated successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("❌ Complete payment error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Order not found" });
    }
    next(err);
  }
});

module.exports = router;
