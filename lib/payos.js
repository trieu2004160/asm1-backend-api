class PayOS {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID;
    this.apiKey = process.env.PAYOS_API_KEY;
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY;
    // ⚠️ SỬA LẠI BASE URL - Bạn đang dùng sandbox nên phải dùng đúng endpoint
    this.baseUrl = process.env.PAYOS_BASE_URL || "https://api-sandbox.payos.vn";
  }

  async createPaymentLink(orderData) {
    try {
      const paymentData = {
        orderCode: orderData.orderCode,
        amount: orderData.amount,
        description: orderData.description,
        // ✅ SỬA: items phải là array hợp lệ
        items: orderData.items || [],
        returnUrl: orderData.returnUrl,
        cancelUrl: orderData.cancelUrl,
        // ✅ QUAN TRỌNG: Thêm buyerName, buyerEmail, buyerPhone nếu có
        buyerName: orderData.buyerName || "Khách hàng",
        buyerEmail: orderData.buyerEmail || "",
        buyerPhone: orderData.buyerPhone || "",
        expiredAt:
          orderData.expiredAt || Math.floor(Date.now() / 1000) + 30 * 60,
      };

      // ❌ BỎ CHECKSUM - PayOS tự động tạo
      // const checksum = this.generateChecksum(paymentData);
      // paymentData.checksum = checksum;

      console.log("🔗 Creating PayOS payment link:", paymentData);

      // ✅ SỬA: Đúng endpoint cho sandbox
      const response = await axios.post(
        `${this.baseUrl}/v2/payment-requests`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-client-id": this.clientId,
            "x-api-key": this.apiKey,
          },
        }
      );

      console.log(
        "✅ PayOS API response:",
        JSON.stringify(response.data, null, 2)
      );

      // ✅ Xử lý response chuẩn
      if (response.data.code === "00") {
        return {
          success: true,
          checkoutUrl: response.data.data.checkoutUrl,
          orderCode: response.data.data.orderCode,
          qrCode: response.data.data.qrCode,
        };
      } else {
        throw new Error(response.data.desc || "Payment creation failed");
      }
    } catch (error) {
      console.error("❌ PayOS Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw new Error(
        `PayOS API error: ${error.response?.data?.desc || error.message}`
      );
    }
  }

  // ✅ Sửa lại phương thức verify webhook
  verifyWebhook(webhookData) {
    try {
      const { signature, ...data } = webhookData;

      // Tạo chuỗi data theo format: key1=value1&key2=value2
      const sortedKeys = Object.keys(data).sort();
      const dataStr = sortedKeys.map((key) => `${key}=${data[key]}`).join("&");

      const calculatedSignature = crypto
        .createHmac("sha256", this.checksumKey)
        .update(dataStr)
        .digest("hex");

      return signature === calculatedSignature;
    } catch (error) {
      console.error("❌ Error verifying webhook:", error);
      return false;
    }
  }
}
