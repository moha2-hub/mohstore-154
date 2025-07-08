"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Castle, ShoppingCart, Wallet, Clock, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { getCustomerDashboardData } from "@/app/actions/customer-dashboard"

export function CustomerDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getCustomerDashboardData().then((data) => {
      setDashboard(data)
      setIsLoading(false)
    })
  }, [])

  const userData = dashboard?.userData || { points: 0, castles: 0, active_orders: 0, completed_orders: 0 }
  const featuredProducts = dashboard?.featuredProducts || []
  const recentOrders = dashboard?.recentOrders || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Customer Dashboard</h1>

      {/* Wallet Card */}
      <Card className="bg-primary text-primary-foreground">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            My Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm opacity-90">Available Balance</p>
              <p className="text-3xl font-bold">{isLoading ? "..." : `${userData.points} Points`}</p>
            </div>
            <Button variant="secondary" className="w-full md:w-auto" asChild>
              <a href="/customer/wallet">Top Up Points</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Castles</CardTitle>
            <Castle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : userData.castles}</div>
            <Button variant="link" className="px-0" asChild>
              <a href="/customer/castles">Manage Castles</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : userData.active_orders}</div>
            <Button variant="link" className="px-0" asChild>
              <a href="/customer/orders">View Orders</a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : userData.completed_orders}</div>
            <Button variant="link" className="px-0" asChild>
              <a href="/customer/orders?status=completed">View Completed</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured Products */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">Loading products...</div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {featuredProducts.map((product: any) => (
                <div key={product.id} className="border rounded-lg p-4 flex flex-col gap-2">
                  <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover rounded" />
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.description}</div>
                  <div className="font-bold">{product.price} Points</div>
                  <Button variant="outline" asChild>
                    <a href={`/customer/shop/${product.id}`}>View Product</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">No featured products</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">Loading orders...</div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">#{order.id}</p>
                      <div className="flex items-center gap-1">
                        {order.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="text-xs capitalize">{order.status}</span>
                      </div>
                    </div>
                    <p className="text-sm">
                      {order.product_name} for {order.castle_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ordered on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a href={`/customer/orders/${order.id}`}>View Details</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">No orders yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
