"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
}

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  address: string
}

interface OrderItem {
  id: string
  createdAt: string
  productId: string
  quantity: number
  subtotal: number
  total: number
  variantColor: string
  variantSize: string
  userId: string
  product: Product
  user: User
}

interface OrderResponse {
  orderIds: string[]
  items: OrderItem[]
}

export default function ThankYouPage() {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderResponse[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const orderId = sessionStorage.getItem("orders");

    if (orderId) {
      fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data?.error) {
            setOrderDetails(Array.isArray(data) ? data : [data])
          } else {
            console.error(data?.error)
          }
        })
        .catch((err) => {
          console.error("Fetch failed:", err)
        })
        .finally(() => {
          sessionStorage.clear();
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const groupedOrders = orderDetails?.flatMap(o => o.items).reduce((acc: Record<string, OrderItem[]>, item) => {
    if (!acc[item.id]) acc[item.id] = []
    acc[item.id].push(item)
    return acc
  }, {}) ?? {}

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-16 h-16 text-green-400" />
      case "declined":
        return <XCircle className="w-16 h-16 text-red-400" />
      case "error":
        return <AlertCircle className="w-16 h-16 text-yellow-400" />
      default:
        return <AlertCircle className="w-16 h-16 text-gray-400" />
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "approved":
        return {
          title: "Order Confirmed!",
          message:
            "Thank you for your purchase. Your order has been successfully processed and you will receive a confirmation email shortly.",
          color: "text-green-400",
        }
      case "declined":
        return {
          title: "Payment Declined",
          message:
            "We're sorry, but your payment could not be processed. Please check your payment information and try again.",
          color: "text-red-400",
        }
      case "error":
        return {
          title: "Processing Error",
          message:
            "We encountered an error while processing your order. Our team has been notified and will contact you shortly.",
          color: "text-yellow-400",
        }
      default:
        return {
          title: "Unknown Status",
          message: "Please contact customer support for assistance.",
          color: "text-gray-400",
        }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (!orderDetails || orderDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300">Order not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  let user:any;
  let total:number=0;
  let count:number=0;

  return (<div className="h-screen overflow-scroll md:overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 relative">
  <button onClick={()=>{ router.push("/"); }} className="px-5 py-3 bg-sky-600 absolute bottom-0 md:top-0 md:left-0 h-fit left-0">Back to Home</button>
  <h1 className="font-extrabold h-[10%] flex justify-center items-center uppercase text-center font-serif text-sm md:text-2xl">🎉 Thank You for Your Purchase‼️ </h1>
  <div className="flex md:flex-row h-full px-10 gap-10">
    <div className="h-[90%] w-full hidden md:block space-y-10 overflow-y-auto px-10 "
      style={{
        overflowY: "auto",
        scrollbarWidth: "auto", 
        scrollbarColor: "#888 #000",
        scrollBehavior: "smooth",
      }}  
      >
      {Object.entries(groupedOrders).map(([orderId, items]) => {
        const createdAt = items[0].createdAt
        const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
        total = items.reduce((sum, item) => sum + item.total, 0)
        user = items[0].user
        count+=1;

        return (
          <div key={orderId} className="mb-12 pt-5">
            <Card className="glass-effect mb-8">
              <CardHeader>
                <CardTitle className="text-foreground">Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order Number</Label>
                  <p className="text-lg font-mono text-foreground">{orderId}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Order Date</Label>
                  <p className="text-foreground">
                    {new Date(createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <Separator className="bg-border" />

                <div className="h-full">
                  <Label className="text-sm font-medium text-muted-foreground">
                    Items Ordered ({items.length} items)
                  </Label>
                  <div className="mt-2 space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="bg-secondary/5 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image
                              src={"/placeholder.svg"}
                              alt={item.product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm">{item.product.name}</h4>
                            <div className="text-xs text-muted-foreground space-y-1 mt-1">
                              <div>
                                Color: <Badge variant="secondary" className="text-xs">{item.variantColor}</Badge>
                              </div>
                              <div>
                                Size: <Badge variant="secondary" className="text-xs">{item.variantSize}</Badge>
                              </div>
                              <div>Quantity: {item.quantity}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground text-sm">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${item.product.price.toFixed(2)} each
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border" />

                <div className="space-y-2">
                  <div className="flex justify-between text-foreground">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Shipping</span>
                    <span className="text-green-400">Free</span>
                  </div>
                  <div className="flex justify-between text-foreground">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Separator />
          </div>
        )
      })}

    </div>
        <Card className="glass-effect h-fit">
        <CardHeader>
          <CardTitle className="text-foreground">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Contact Information</Label>
            <div className="mt-2 space-y-1">
              <p className="font-medium text-foreground">{user.fullName}</p>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-muted-foreground">{user.phone}</p>
            </div>
          </div>
          <Separator className="bg-border" />
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Shipping Address</Label>
            <div className="mt-2 text-foreground">
              <p>{user.address}</p>
            </div>
          </div>
          <Separator className="bg-border" />
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
            <div className="mt-2 text-foreground">
              <p>**** **** **** XXXX</p>
            </div>
          </div>
          <Separator className="bg-border" />
          <div className="flex justify-between font-bold text-foreground">
            <span>Total Orders:</span>
            <span>{count}</span>
          </div>
          <Separator className="bg-border" />
          <div className="flex justify-between text-foreground">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>
  </div>
  </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}