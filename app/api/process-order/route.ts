import { type NextRequest, NextResponse } from "next/server"
import { sendOrderEmail } from "@/lib/email"
import prisma from "@/lib/prisma"

function simulateTransaction() {
  const random = Math.random()
  if (random < 0.7) return { status: "approved", message: "Transaction approved" }
  else if (random < 0.9) return { status: "declined", message: "Payment declined" }
  else return { status: "error", message: "Gateway error" }
}

export async function POST(request: NextRequest) {
  try {
    const { cart, customerData } = await request.json()
    
    const transactionResult = simulateTransaction()

    const subtotal = cart.reduce(
      (total: number, item: any) => total + item.product.price * item.quantity,
      0
    )
    const total = subtotal

    if (transactionResult.status !== "approved") {
      return NextResponse.json({
        status: transactionResult.status,
        message: transactionResult.message,
      })
    }

    const createdOrders = await prisma.$transaction(async (tx:any) => {
      const user = await tx.user.upsert({
        where: { email: customerData.email },
        update: {
          fullName: customerData.fullName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
          cardNumber: customerData.cardNumber,
          expiryDate: customerData.expiryDate,
          cvv: customerData.cvv,
        },
        create: {
          fullName: customerData.fullName,
          email: customerData.email,
          phone: customerData.phone,
          address: customerData.address,
          city: customerData.city,
          state: customerData.state,
          zipCode: customerData.zipCode,
          cardNumber: customerData.cardNumber,
          expiryDate: customerData.expiryDate,
          cvv: customerData.cvv,
        },
      })

        const orders = await Promise.all(
          cart.map((item: any, index: number) => {
          const color = item.selectedVariants?.color
          const size = item.selectedVariants?.size

          if (!color || !size) {
            throw new Error(`Missing variant color/size in cart item at index ${index}`)
          }

          return tx.order.create({
            data: {
              userId: user.id,
              productId: item.product.id,
              variantColor: color,
              variantSize: size,
              quantity: item.quantity,
              subtotal: item.product.price * item.quantity,
              total,
            },
          })
        })
      )

      return orders
    })

    const orderRecord = {
      status: transactionResult.status,
      cart,
      subtotal,
      total,
      customerData,
      timestamp: new Date().toISOString(),
      transactionMessage: transactionResult.message,
    }

    try {
      await sendOrderEmail(orderRecord);
    } catch (emailError) {
      console.error("Failed to send email:", emailError)
    }

    return NextResponse.json({
      status: transactionResult.status,
      message: transactionResult.message,
      orders: createdOrders.map((order:any) => ({
        orderId:order.id,
        productId: order.productId,
        quantity: order.quantity,
      })
      ),
    })
  } catch (error) {
    console.error("Order processing error:", error)
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 })
  }
}
