"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart, Star, Heart, Eye, Zap, Package, Check } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useTheme } from "@/components/theme-provider"
import { scroller } from 'react-scroll';

// Mock product data with suggested products

type Product = {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  image: string
  category: string
  rating: number
  reviews: number
  inventory: number
  isNew?: boolean
  isBestseller?: boolean
  size: string[]
  color: string[]
}

type SelectedVariants = {
  color: string
  size: string
}

type CartItem = {
  product: Product
  selectedVariants: SelectedVariants
  quantity: number
}

type Props = {
  allProducts: Product[]
}

export default function LandingPage() {
  const router = useRouter()
  const { actualTheme } = useTheme()
  const [selectedProductIndex, setSelectedProductIndex] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState({
    color: "",
    size: "",
  })
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showAddToCartAnimation, setShowAddToCartAnimation] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [allProducts,setAllProducts] = useState<Product[]>([]);

  const selectedProduct = allProducts[selectedProductIndex];
  const suggestedProducts = allProducts.filter((_, index) => index !== selectedProductIndex)

  const getProducts = async()=>{
    const blob = await fetch("/api/product");
    const data = await blob.json();
    setAllProducts(data.product)
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    getProducts();
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const handleVariantChange = (key: keyof SelectedVariants, value: string):void => {
    setSelectedVariants(prev => ({ ...prev, [key]: value }))
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity)
    }
  }

  const handleProductSwap = async (newProductIndex: number) => {
    if (isSwapping || newProductIndex === selectedProductIndex) return

    setIsSwapping(true)

    // Wait for animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300))

    setSelectedProductIndex(newProductIndex)
    setSelectedVariants({ color: "", size: "" })
    setQuantity(1)

    // Wait for swap animation to complete
    await new Promise((resolve) => setTimeout(resolve, 300))
    setIsSwapping(false)
    handleScroll();
  }

  const handleAddToCart = async () => {
    if (!selectedVariants.color || !selectedVariants.size) {
      alert("Please select all product variants")
      return
    }

    const cartItem: CartItem = {
      product: selectedProduct,
      selectedVariants,
      quantity,
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.product.id === cartItem.product.id &&
        item.selectedVariants.color === cartItem.selectedVariants.color &&
        item.selectedVariants.size === cartItem.selectedVariants.size,
    )

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += cartItem.quantity
      setCart(updatedCart)
    } else {
      // Add new item to cart
      setCart([...cart, cartItem])
    }

    // Show add to cart animation
    setShowAddToCartAnimation(true)
    setTimeout(() => setShowAddToCartAnimation(false), 2000)

    // Reset selections
    setSelectedVariants({ color: "", size: "" })
    setQuantity(1)
  }

  const handleBuyNow = async () => {
    if (!selectedVariants.color || !selectedVariants.size) {
      alert("Please select all product variants")
      return
    }

    setIsLoading(true)

    // Add current item to cart first
    await handleAddToCart()

    // Navigate to checkout
    setTimeout(() => {
      router.push("/checkout")
    }, 500)
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Your cart is empty")
      return
    }
    router.push("/checkout")
  }

  const getTotalCartItems = (): number => {
    return cart.reduce((sum, item) => sum + item.quantity, 0)
  }

  const getTotalCartValue = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const handleScroll = () => {
    scroller.scrollTo('about', {
      duration: 500,
      smooth: 'easeInOutQuart',
    });
  };

  const isVariantsSelected = selectedVariants.color && selectedVariants.size

  if (allProducts.length === 0) return <div>Loading products...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-500">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{ backgroundColor: "var(--blob-1)" }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          style={{ backgroundColor: "var(--blob-2)" }}
        ></div>
        <div
          className="absolute top-40 left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"
          style={{ backgroundColor: "var(--blob-3)" }}
        ></div>
      </div>

      {/* Header */}
      <header className="relative z-10 glass-effect border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TechVault
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="relative glass-effect hover:bg-accent/50"
                onClick={handleCheckout}
              >
                <ShoppingCart className="w-6 h-6" />
                {getTotalCartItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {getTotalCartItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div  id="about" className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Product Section */}
          <div
            className={`grid md:grid-cols-2 gap-8 transition-all duration-500 ${isSwapping ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
          >
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 gradient-primary rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-300"></div>
                <div className="relative aspect-square rounded-2xl overflow-hidden glass-effect shadow-custom">
                  <Image
                    src={selectedProduct?.image || "/placeholder.svg"}
                    alt={selectedProduct?.name||"placeholder-img"}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {selectedProduct?.isNew && <Badge className="bg-green-500 text-white font-semibold">NEW</Badge>}
                    {selectedProduct?.isBestseller && (
                      <Badge className="bg-orange-500 text-white font-semibold">BESTSELLER</Badge>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" className="glass-effect hover:bg-accent/50">
                      <Eye className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div className="glass-effect rounded-2xl p-6 shadow-custom">
                <div className="mb-2">
                  <Badge variant="outline" className="text-primary border-primary mb-2">
                    {selectedProduct?.category}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">{selectedProduct?.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedProduct?.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedProduct?.rating} ({selectedProduct?.reviews} reviews)
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-6">{selectedProduct?.description}</p>

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-foreground">${selectedProduct?.price?.toFixed(2)}</div>
                  <div className="text-lg text-muted-foreground">
                    ${selectedProduct?.originalPrice?.toFixed
                      ? selectedProduct.originalPrice.toFixed(2)
                      : "0.00"}
                  </div>
                  <Badge className="bg-green-500 text-white">
                    Save $
                    {selectedProduct?.originalPrice != null && selectedProduct?.price != null
                      ? (selectedProduct.originalPrice - selectedProduct.price).toFixed(2)
                      : "0.00"}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-green-500" />
                  <span className="text-green-500 font-medium">{selectedProduct?.inventory} in stock</span>
                </div>
              </div>

              {/* Variant Selectors */ }
              <div className="glass-effect rounded-2xl p-6 shadow-custom space-y-4">
                <div>
                  <Label htmlFor="color" className="text-base font-medium text-foreground mb-2 block">
                    Color
                  </Label>
                  <Select value={selectedVariants.color} onValueChange={(value) => handleVariantChange("color", value)}>
                    <SelectTrigger className="w-full glass-effect border-border">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.color?.map((color:string) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size" className="text-base font-medium text-foreground mb-2 block">
                    Size
                  </Label>
                  <Select value={selectedVariants.size} onValueChange={(value) => handleVariantChange("size", value)}>
                    <SelectTrigger className="w-full glass-effect border-border">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct?.size?.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity Selector */}
                <div>
                  <Label className="text-base font-medium text-foreground mb-2 block">Quantity</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="glass-effect border-border hover:bg-accent/50"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-xl font-medium w-12 text-center text-foreground">{quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 10}
                      className="glass-effect border-border hover:bg-accent/50"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="glass-effect rounded-2xl p-6 shadow-custom">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-foreground">Total:</span>
                  <span className="text-2xl font-bold text-foreground">
                    ${(selectedProduct?.price * quantity).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isVariantsSelected || isSwapping}
                    className="w-full h-12 text-lg gradient-primary hover:opacity-90 text-white border-0"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!isVariantsSelected || isLoading || isSwapping}
                    className="w-full h-12 text-lg gradient-accent hover:opacity-90 text-white border-0"
                    size="lg"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    {isLoading ? "Processing..." : "Buy Now"}
                  </Button>
                </div>
                {!isVariantsSelected && (
                  <p className="text-sm text-destructive mt-2 text-center">Please select all variants to continue</p>
                )}
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="mt-8 glass-effect rounded-2xl p-6 shadow-custom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Cart Summary</h3>
                    <p className="text-muted-foreground">
                      {getTotalCartItems()} items • ${getTotalCartValue().toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button onClick={handleCheckout} className="gradient-secondary hover:opacity-90 text-white">
                  Checkout
                </Button>
              </div>
            </div>
          )}

          {/* Suggested Products Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-foreground mb-2">You might also like</h2>
              <p className="text-muted-foreground">Click on any product to explore more options</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestedProducts.map((product, index) => {
                const originalIndex = allProducts.findIndex((p) => p.id === product.id)
                return (
                  <div key={product.id} className="group relative">
                    <div className="absolute inset-0 gradient-primary rounded-2xl blur opacity-0 group-hover:opacity-25 transition duration-300"></div>
                    <Card
                      className={`relative cursor-pointer transition-all duration-300 hover:scale-105 glass-effect shadow-custom ${
                        isSwapping ? "animate-pulse" : ""
                      }`}
                      onClick={() => handleProductSwap(originalIndex) }
                    >
                      <div className="p-4">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isNew && <Badge className="bg-green-500 text-white text-xs">NEW</Badge>}
                            {product.isBestseller && (
                              <Badge className="bg-orange-500 text-white text-xs">BESTSELLER</Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Badge variant="outline" className="text-primary border-primary text-xs">
                            {product.category}
                          </Badge>
                          <h3 className="font-semibold text-lg text-foreground line-clamp-2">{product.name}</h3>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? "text-yellow-400 fill-current"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {product.rating} ({product.reviews})
                            </span>
                          </div>

                          <p className="text-muted-foreground text-sm line-clamp-2">{product.description}</p>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                              <div className="text-xl font-bold text-foreground">${product.price.toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground line-through">
                                ${product?.originalPrice?.toFixed(2)}
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs text-green-500 border-green-500">
                              {product.inventory} left
                            </Badge>
                          </div>

                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full transition-colors glass-effect border-border hover:bg-accent/50"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleProductSwap(originalIndex)
                                handleScroll();
                              }}
                            >
                              View Product
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Add to Cart Animation */}
          {showAddToCartAnimation && (
            <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
              <div className="glass-effect rounded-2xl p-8 shadow-2xl animate-bounce">
                <div className="flex items-center space-x-4 text-foreground">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Added to Cart!</h3>
                    <p className="text-muted-foreground">{selectedProduct.name}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Swap Animation Overlay */}
          {isSwapping && (
            <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
              <div className="glass-effect rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center space-x-3 text-foreground">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="font-medium">Switching products...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
