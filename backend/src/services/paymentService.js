/**
 * paymentService.js
 * 
 * Pre-coded placeholder for future Razorpay integration.
 * In the final phase, the Razorpay SDK will be initialized here.
 */

/**
 * Creates a payment order payload on Razorpay.
 * @param {string} orderId - ReetSutra internal order database ID
 * @param {number} amount - Order value in INR
 * @returns {Promise<object>} - Mock Razorpay order object
 */
export const createRazorpayOrder = async (orderId, amount) => {
  // In the future:
  // const options = { amount: amount * 100, currency: "INR", receipt: orderId };
  // const razorpayOrder = await razorpayInstance.orders.create(options);
  // return razorpayOrder;

  console.log(`[PAYMENT SERVICE - MOCK]: Creating Razorpay Order for Internal Order: ${orderId}, Amount: ₹${amount}`);
  
  return {
    id: `rzp_order_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    entity: "order",
    amount: amount * 100, // Razorpay works in paisa
    amount_paid: 0,
    amount_due: amount * 100,
    currency: "INR",
    receipt: orderId.toString(),
    status: "created",
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000)
  };
};

/**
 * Verifies Razorpay payment signatures against secret keys.
 * @param {string} razorpayOrderId 
 * @param {string} razorpayPaymentId 
 * @param {string} razorpaySignature 
 * @returns {boolean}
 */
export const verifyRazorpaySignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  // In the future:
  // const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
  // hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
  // const generatedSignature = hmac.digest("hex");
  // return generatedSignature === razorpaySignature;

  console.log(`[PAYMENT SERVICE - MOCK]: Verifying Razorpay signature for Order: ${razorpayOrderId}`);
  return true; // Mock verification success
};
