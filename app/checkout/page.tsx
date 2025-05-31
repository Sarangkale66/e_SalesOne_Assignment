"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, CreditCard, Lock, Trash2, Plus, Minus, Zap, ShoppingCart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"

interface CartItem {
  product: any
  selectedVariants: any
  quantity: number
}

interface FormData {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

interface FormErrors {
  [key: string]: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      const cartData = JSON.parse(savedCart)
      if (cartData.length === 0) {
        router.push("/")
        return
      }
      setCart(cartData)
    } else {
      router.push("/")
    }
  }, [router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    const phoneRegex = /^\+?[\d\s\-$$$$]{10,}$/
    if (!formData.phone) {
      newErrors.phone = "Phone number is required"
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    // State validation
    if (!formData.state.trim()) {
      newErrors.state = "State is required"
    }

    // Zip code validation
    const zipRegex = /^\d{6}$/;

    if (!formData.zipCode) {
      newErrors.zipCode = "Zip code is required";
    } else if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid 6-digit zip code";
    }

    // Card number validation (16 digits)
    const cardRegex = /^\d{16}$/
    if (!formData.cardNumber) {
      newErrors.cardNumber = "Card number is required"
    } else if (!cardRegex.test(formData.cardNumber.replace(/\s/g, ""))) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number"
    }

    // Expiry date validation (MM/YY format and future date)
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required"
    } else if (!expiryRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = "Please enter date in MM/YY format"
    } else {
      const [month, year] = formData.expiryDate.split("/")
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1
      const expYear = Number.parseInt(year)
      const expMonth = Number.parseInt(month)

      if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryDate = "Expiry date must be in the future"
      }
    }

    // CVV validation (3 digits)
    const cvvRegex = /^\d{3}$/
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required"
    } else if (!cvvRegex.test(formData.cvv)) {
      newErrors.cvv = "Please enter a valid 3-digit CVV"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(index)
      return
    }

    const updatedCart = [...cart]
    updatedCart[index].quantity = newQuantity
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))
  }

  const removeCartItem = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index)
    setCart(updatedCart)
    localStorage.setItem("cart", JSON.stringify(updatedCart))

    if (updatedCart.length === 0) {
      router.push("/")
    }
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/process-order", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          customerData: formData,
        }),
      })

      const result:{ message:string, orders:any[], error:any } = await response.json();
      
      if (response.ok) {
        // Clear cart and store order ID for thank you page
        localStorage.removeItem("cart")
        sessionStorage.setItem("orders", JSON.stringify(result.orders))
        setTimeout(() => {
          router.push("/thank-you")
        }, 500);
      } else {
        alert(`Transaction failed: ${result.error}`)
      }
    } catch (error) {
      alert("An error occurred while processing your order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (cart.length === 0) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-background/20 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TechVault
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-foreground">
                <ShoppingCart className="w-5 h-5" />
                <span>{getTotalItems()} items</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shopping
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Checkout Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Customer Information</h3>

                      <div>
                        <Label htmlFor="fullName" className="text-foreground">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className={`input ${errors.fullName ? "border-red-500" : ""}`}
                        />
                        {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="email" className="text-foreground">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`input ${errors.email ? "border-red-500" : ""}`}
                        />
                        {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                      </div>

                      <div>
                        <Label htmlFor="phone" className="text-foreground">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className={`input ${errors.phone ? "border-red-500" : ""}`}
                        />
                        {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Shipping Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Shipping Address</h3>

                      <div>
                        <Label htmlFor="address" className="text-foreground">
                          Address *
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className={`input ${errors.address ? "border-red-500" : ""}`}
                        />
                        {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-foreground">
                            City *
                          </Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => handleInputChange("city", e.target.value)}
                            className={`input ${errors.city ? "border-red-500" : ""}`}
                          />
                          {errors.city && <p className="text-red-400 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-foreground">
                            State *
                          </Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            className={`input ${errors.state ? "border-red-500" : ""}`}
                          />
                          {errors.state && <p className="text-red-400 text-sm mt-1">{errors.state}</p>}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="zipCode" className="text-foreground">
                          Zip Code *
                        </Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          className={`input ${errors.zipCode ? "border-red-500" : ""}`}
                        />
                        {errors.zipCode && <p className="text-red-400 text-sm mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>

                    <Separator className="bg-border" />

                    {/* Payment Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>

                      <div>
                        <Label htmlFor="cardNumber" className="text-foreground">
                          Card Number *
                        </Label>
                        <Input
                          id="cardNumber"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className={`input ${errors.cardNumber ? "border-red-500" : ""}`}
                        />
                        {errors.cardNumber && <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate" className="text-foreground">
                            Expiry Date *
                          </Label>
                          <Input
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, "")
                              if (value.length >= 2) {
                                value = value.substring(0, 2) + "/" + value.substring(2, 4)
                              }
                              handleInputChange("expiryDate", value)
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`input ${errors.expiryDate ? "border-red-500" : ""}`}
                          />
                          {errors.expiryDate && <p className="text-red-400 text-sm mt-1">{errors.expiryDate}</p>}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-foreground">
                            CVV *
                          </Label>
                          <Input
                            id="cvv"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ""))}
                            placeholder="123"
                            maxLength={3}
                            className={`input ${errors.cvv ? "border-red-500" : ""}`}
                          />
                          {errors.cvv && <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>}
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                      disabled={isLoading}
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      {isLoading ? "Processing..." : `Complete Order - $${getCartTotal().toFixed(2)}`}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Cart Summary */}
            <div>
              <Card className="sticky top-8 glass-effect">
                <CardHeader>
                  <CardTitle className="text-foreground">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={index} className="bg-secondary/5 rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-foreground text-sm">{item.product.name}</h4>
                            <div className="text-xs text-muted-foreground space-y-1 mt-1">
                              <div>
                                Color:{" "}
                                <Badge variant="secondary" className="text-xs">
                                  {item.selectedVariants.color}
                                </Badge>
                              </div>
                              <div>
                                Size:{" "}
                                <Badge variant="secondary" className="text-xs">
                                  {item.selectedVariants.size}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2 mt-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 bg-secondary/10 border-border text-foreground"
                                  onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-foreground text-sm w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 bg-secondary/10 border-border text-foreground"
                                  onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6 bg-red-500/20 border-red-500/20 text-red-400 hover:bg-red-500/30"
                                  onClick={() => removeCartItem(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-foreground">
                              ${(item.product.price * item.quantity).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">${item.product.price.toFixed(2)} each</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-border" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-foreground">
                      <span>Subtotal ({getTotalItems()} items)</span>
                      <span>${getCartTotal().toFixed(2)}</span>
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

                  <Separator className="bg-border" />

                  <div className="flex justify-between text-lg font-bold text-foreground">
                    <span>Total</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .input {
          @apply bg-secondary/10 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0;
        }
      `}</style>
    </div>
  )
}
