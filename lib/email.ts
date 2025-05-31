import nodemailer from "nodemailer"

// Mailtrap configuration
const transporter = nodemailer.createTransport({
  host: process.env.HOST||"smtp.gmail.com",
  secure:true,
  port:465,
  auth: {
    user: process.env.USERNAME||"example@gmail.com",
    pass: process.env.PASSWORD||"password",
  },
})

export async function sendOrderEmail(order: any) {

  const { status, cart, subtotal, total, customerData} = order

  let subject: string
  let htmlContent: string

  if (status === "approved") {
    subject = `Order Confirmation`
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; background: rgba(255,255,255,0.1);">
          <h1 style="color: #4ade80; margin: 0; font-size: 28px;">Order Confirmed! 🎉</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for shopping with TechVault</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerData.fullName},</p>
          <p style="font-size: 16px; margin-bottom: 30px;">Your order has been successfully processed and will be shipped soon!</p>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h2 style="color: #a78bfa; margin-top: 0;">Order Details</h2>
            
            <h3 style="color: #a78bfa; margin-bottom: 15px;">Items Ordered:</h3>
            ${cart
              .map(
                (item: any) => `
              <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="margin: 0; font-weight: bold;">${item.product.name}</p>
                <p style="margin: 5px 0; font-size: 14px;">Color: ${item.selectedVariants.color} | Size: ${item.selectedVariants.size}</p>
                <p style="margin: 5px 0; font-size: 14px;">Quantity: ${item.quantity} × $${item.product.price.toFixed(2)} = $${(item.product.price * item.quantity).toFixed(2)}</p>
              </div>
            `,
              )
              .join("")}
            
            <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
              <p style="margin: 5px 0;">Shipping: <span style="color: #4ade80;">Free</span></p>
              <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #fbbf24;">Total: $${total.toFixed(2)}</p>
            </div>
          </div>
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h2 style="color: #a78bfa; margin-top: 0;">Shipping Address</h2>
            <p style="margin: 5px 0;">${customerData.address}</p>
            <p style="margin: 5px 0;">${customerData.city}, ${customerData.state} ${customerData.zipCode}</p>
          </div>
          
          <p style="font-size: 16px; margin-top: 30px;">We'll send you another email when your order ships.</p>
          <p style="font-size: 16px; margin-bottom: 0;">Thank you for choosing TechVault! 🚀</p>
        </div>
      </div>
    `
  } else {
    subject = `Order ${status === "declined" ? "Payment Issue" : "Processing Error"}`
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px 30px; text-align: center; background: rgba(255,255,255,0.1);">
          <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">${status === "declined" ? "Payment Issue ⚠️" : "Processing Error 🔧"}</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">We encountered an issue with your order</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Dear ${customerData.fullName},</p>
          <p style="font-size: 16px; margin-bottom: 30px;">We encountered an issue processing your order</p>
          
          ${
            status === "declined"
              ? "<p style='font-size: 16px; margin-bottom: 20px;'>Your payment could not be processed. Please check your payment information and try again.</p>"
              : "<p style='font-size: 16px; margin-bottom: 20px;'>We experienced a technical error while processing your order. Our team has been notified and will contact you shortly.</p>"
          }
          
          <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0;">
            <h2 style="color: #fbbf24; margin-top: 0;">Order Details</h2>
            <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
          </div>
          
          <p style="font-size: 16px; margin-top: 30px;">If you have any questions, please contact our customer support.</p>
          <p style="font-size: 16px; margin-bottom: 0;">We apologize for any inconvenience.</p>
        </div>
      </div>
    `
  }

  const mailOptions = {
    from: '"TechVault" <noreply@techvault.com>',
    to: customerData.email,
    subject,
    html: htmlContent,
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${customerData.email}`);
  } catch (error) {
    console.error("Email sending failed:", error)
    throw error
  }
}