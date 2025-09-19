const { Router } = require("express");
const Product = require("../src/models/Product");

const router = Router();

// GET /api/products – List all products
router.get("/", async (_req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    console.log("📋 Found products count:", products.length);
    res.json(products);
  } catch (err) {
    console.error("❌ Get products error:", err);
    next(err);
  }
});

// GET /api/products/:id – Get a single product
router.get("/:id", async (req, res, next) => {
  try {
    console.log("🔍 Getting product ID:", req.params.id);

    // Kiểm tra ID có hợp lệ không
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log("❌ Product not found for ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product found:", product._id);
    res.json(product);
  } catch (err) {
    console.error("❌ Get product error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(err);
  }
});

// POST /api/products – Create a new product
router.post("/", async (req, res, next) => {
  try {
    const { name, description, price, image } = req.body;
    console.log("📝 Creating product:", { name, description, price, image });

    if (!name || !description || typeof price !== "number") {
      return res
        .status(400)
        .json({ message: "name, description, price are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      image: image || null,
    });

    const savedProduct = await product.save();
    console.log("✅ Product saved to DB:", savedProduct);
    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id – Update a product
router.put("/:id", async (req, res, next) => {
  try {
    const { name, description, price, image } = req.body;
    console.log("🔄 Updating product ID:", req.params.id);
    console.log("🔄 Update data:", { name, description, price, image });

    if (!name || !description || typeof price !== "number") {
      return res
        .status(400)
        .json({ message: "name, description, price are required" });
    }

    // Kiểm tra ID có hợp lệ không
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, description, price, image: image || null },
      { new: true, runValidators: true }
    );

    if (!product) {
      console.log("❌ Product not found for ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product updated:", product);
    res.json(product);
  } catch (err) {
    console.error("❌ Update error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(err);
  }
});

// DELETE /api/products/:id – Delete a product
router.delete("/:id", async (req, res, next) => {
  try {
    console.log("🗑️ Deleting product ID:", req.params.id);

    // Kiểm tra ID có hợp lệ không
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      console.log("❌ Product not found for deletion, ID:", req.params.id);
      return res.status(404).json({ message: "Product not found" });
    }

    console.log("✅ Product deleted:", product._id);
    res.status(204).send();
  } catch (err) {
    console.error("❌ Delete error:", err);
    if (err.name === "CastError") {
      return res.status(404).json({ message: "Product not found" });
    }
    next(err);
  }
});

module.exports = router;
