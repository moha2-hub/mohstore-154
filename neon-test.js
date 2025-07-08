// Minimal Neon DB connectivity test
import { neon } from "@neondatabase/serverless"

const DATABASE_URL = "postgresql://neondb_owner:npg_E5KhirvO0MHI@ep-fragrant-surf-a4ejben8-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

async function testConnection() {
  try {
    const sql = neon(DATABASE_URL)
    const result = await sql`SELECT 1 as test`
    console.log("Connection successful! Result:", result)
  } catch (error) {
    console.error("Connection failed:", error)
  }
}

testConnection()
