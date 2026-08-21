import nodemailer from "nodemailer";

// EmailJS Credentials
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "service_2typb8y";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "template_k7z5b09";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "x1gSusWWDNmKOTWLi";
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || "";

/**
 * Configure Nodemailer Transporter if SMTP env vars exist
 */
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return null;
};

/**
 * Send Back-in-Stock Email Notification
 */
export const sendBackInStockEmail = async ({ toEmail, userName: inputUserName, productName, productImage, productPrice, productId, shortDescription }) => {
  const shopUrl = (process.env.FRONTEND_URL || "").replace(/\/$/, "");
  const productUrl = shopUrl ? `${shopUrl}/product/${productId}` : "";
  
  let displayName = (inputUserName || "").trim();
  if (!displayName) {
    const raw = toEmail.split('@')[0];
    displayName = raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  const shortDescText = shortDescription || "Authentic traditional Bihari recipe made with pure ingredients.";

  const formattedMessage = `
Hi ${displayName},

Good news! 🎉

The product you were waiting for is back in stock.

*${productName}*
${shortDescText}
Price: ₹${productPrice}

Don't miss out — order now while stocks last.

${productUrl ? `👉 Shop Now: ${productUrl}\n` : ''}
Thank you for choosing ReetSutra ❤️

Warm regards,
Team ReetSutra
`.trim();

  // 1. Try sending via EmailJS REST API
  try {
    const emailJsPayload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      ...(EMAILJS_PRIVATE_KEY ? { accessToken: EMAILJS_PRIVATE_KEY } : {}),
      template_params: {
        to_email: toEmail,
        email: toEmail,
        user_email: toEmail,
        from_email: toEmail,
        name: displayName,
        from_name: displayName,
        userName: displayName,
        user_name: displayName,
        to_name: displayName,
        reply_to: toEmail,
        productName: productName,
        shortProductDescription: shortDescText,
        product_price: `₹${productPrice}`,
        product_image: productImage || "",
        product_url: productUrl,
        shop_url: shopUrl,
        subject: `🎉 ${productName} is Back in Stock! - ReetSutra`,
        message: formattedMessage
      }
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(emailJsPayload)
    });

    if (response.ok) {
      console.log(`✉️ [EMAILJS SUCCESS] Back-in-Stock email sent to ${toEmail} for "${productName}"`);
      return true;
    } else {
      const errText = await response.text();
      console.warn(`[EMAILJS WARN] ${errText}. Attempting SMTP fallback...`);
    }
  } catch (emailJsErr) {
    console.warn("[EMAILJS ERROR]", emailJsErr.message);
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const transporter = createTransporter();
    if (transporter) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #FAF6EF; border: 1px solid #C5972E; border-radius: 16px; padding: 28px; color: #143021;">
          <div style="text-align: center; padding-bottom: 16px; border-bottom: 2px solid #C5972E;">
            <h1 style="color: #143021; margin: 0; font-size: 28px; font-weight: 800;">ReetSutra</h1>
            <p style="color: #C5972E; margin: 4px 0 0 0; font-size: 11px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">The Taste of Bihar</p>
          </div>

          <div style="padding: 24px 0; text-align: left; line-height: 1.6;">
            <p style="font-size: 15px; font-weight: bold; color: #143021; margin-top: 0;">Hi ${displayName},</p>
            <p style="font-size: 15px; color: #143021;">Good news! 🎉</p>
            <p style="font-size: 15px; color: #143021;">The product you were waiting for is <strong style="color: #143021;">back in stock</strong>.</p>

            <div style="margin: 20px 0; padding: 18px; background: #FFFFFF; border-left: 4px solid #C5972E; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <h3 style="margin: 0 0 6px 0; color: #143021; font-size: 18px; font-weight: 800;">${productName}</h3>
              <p style="margin: 0; color: #4A5568; font-size: 13px;">${shortDescText}</p>
              <p style="margin: 8px 0 0 0; color: #7A5822; font-weight: bold; font-size: 16px;">Price: ₹${productPrice}</p>
            </div>

            <p style="font-size: 14px; color: #143021;">Don't miss out — order now while stocks last.</p>

            ${productUrl ? `
            <div style="margin: 24px 0; text-align: center;">
              <a href="${productUrl}" style="background-color: #143021; color: #C5972E; border: 1px solid #C5972E; padding: 14px 36px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px;">
                Shop Now &rarr;
              </a>
            </div>
            ` : ''}

            <p style="font-size: 14px; color: #143021; margin-top: 24px;">Thank you for choosing <strong>ReetSutra</strong> ❤️</p>
            <p style="font-size: 14px; color: #143021; margin: 4px 0 0 0;">Warm regards,<br/><strong style="color: #143021;">Team ReetSutra</strong></p>
          </div>

          <div style="border-top: 1px solid #E2E8F0; padding-top: 16px; text-align: center; font-size: 11px; color: #718096;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ReetSutra. Authentic Bihari Recipe Delivered to Your Doorstep.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Team ReetSutra" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: `🎉 ${productName} is Back in Stock! - ReetSutra`,
        html: htmlContent
      });
      console.log(`✉️ [SMTP SUCCESS] Back-in-stock notification email sent to ${toEmail}`);
    } else {
      console.log(`📧 [EMAIL LOG] Email intended for ${toEmail} for product "${productName}" (URL: ${productUrl})`);
    }
  } catch (smtpErr) {
    console.error("[SMTP ERROR]", smtpErr.message);
  }
};
