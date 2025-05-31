import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 })
    }

    // Parse the stringified array
    const parsedOrders = await JSON.parse(orderId);

    if (!Array.isArray(parsedOrders)) {
      return NextResponse.json({ error: "Invalid orderId format" }, { status: 400 })
    }

    
    const orderIds = parsedOrders.map((o: { orderId: string }) => o.orderId)

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { product: true, user: true },
    });

    if (orders.length === 0) {
      return NextResponse.json({ error: "No matching orders found" }, { status: 404 })
    }
    
    return NextResponse.json({ orderIds, items: orders })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}
