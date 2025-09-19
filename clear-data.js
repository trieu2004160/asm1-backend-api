require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./src/models/Product");

async function clearDatabase() {
  try {
    console.log("🔗 Đang kết nối MongoDB Atlas...");

    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Kết nối MongoDB Atlas thành công!");

    // Xóa tất cả products
    console.log("🗑️  Đang xóa tất cả dữ liệu products...");
    const result = await Product.deleteMany({});
    console.log(`✅ Đã xóa ${result.deletedCount} sản phẩm`);

    // Kiểm tra collection có tồn tại không
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const productCollection = collections.find((c) => c.name === "products");

    if (productCollection) {
      console.log("📋 Collection 'products' đã tồn tại và sẵn sàng sử dụng");
    } else {
      console.log(
        "⚠️  Collection 'products' chưa tồn tại, sẽ được tạo khi có dữ liệu đầu tiên"
      );
    }

    console.log("\n🎉 Hoàn thành! Database đã sẵn sàng để lưu dữ liệu mới");
    console.log(
      "📝 Bạn có thể sử dụng các API endpoints để thêm/sửa/xóa dữ liệu:"
    );
    console.log("POST   http://localhost:4000/api/products - Tạo sản phẩm mới");
    console.log(
      "GET    http://localhost:4000/api/products - Lấy danh sách sản phẩm"
    );
    console.log(
      "GET    http://localhost:4000/api/products/:id - Lấy sản phẩm theo ID"
    );
    console.log(
      "PUT    http://localhost:4000/api/products/:id - Cập nhật sản phẩm"
    );
    console.log("DELETE http://localhost:4000/api/products/:id - Xóa sản phẩm");
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
}

clearDatabase();
