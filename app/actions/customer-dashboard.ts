"use server"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/app/actions/auth"

export async function getCustomerDashboardData() {
  const user = await getCurrentUser()
  if (!user) return { userData: null, featuredProducts: [], recentOrders: [] }

  // Fetch user stats
  const statsData = await query(
    `SELECT u.points,
      (SELECT COUNT(*) FROM castles WHERE user_id = $1) as castles,
      (SELECT COUNT(*) FROM orders WHERE customer_id = $1 AND status IN ('pending', 'accepted')) as active_orders,
      (SELECT COUNT(*) FROM orders WHERE customer_id = $1 AND status = 'completed') as completed_orders
     FROM users u WHERE u.id = $1`,
    [user.id]
  )

  // Fetch featured products
  const productsData = await query(
    `SELECT id, name, description, price, image_url FROM products WHERE active = true ORDER BY id LIMIT 3`
  )

  // Fetch recent orders
  const ordersData = await query(
    `SELECT o.id, o.status, o.created_at, p.name as product_name, c.name as castle_name
     FROM orders o
     JOIN products p ON o.product_id = p.id
     JOIN castles c ON o.castle_id = c.id
     WHERE o.customer_id = $1
     ORDER BY o.created_at DESC
     LIMIT 3`,
    [user.id]
  )

  return {
    userData: statsData[0] || null,
    featuredProducts: productsData,
    recentOrders: ordersData,
  }
}
