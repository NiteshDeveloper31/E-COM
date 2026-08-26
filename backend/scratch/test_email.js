import { sendBackInStockEmail } from "../src/services/emailService.js";
import dotenv from "dotenv";
dotenv.config();

console.log("Testing EmailJS Restock Email sending to np370768@gmail.com ...");

const result = await sendBackInStockEmail({
  toEmail: "np370768@gmail.com",
  userName: "Nitesh Pawar",
  productName: "Pickle",
  productImage: "/uploads/banners/test.png",
  productPrice: 399,
  productId: "6488229e9e23704ebf000001",
  shortDescription: "Traditional Indian pickles made with authentic spices."
});

console.log("Email Result:", result);
process.exit(0);
