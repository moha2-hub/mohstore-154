"use server"

import { query } from "@/lib/db"

// Define an Offer type matching your DB schema
export type Offer = {
  id: number
  product_id: number
  quantity: number
  price: number
  title: string
  description: string
}

// Update an offer by ID
export async function updateOffer(formData: FormData) {
  const id = Number(formData.get("id"));
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const quantity = Number(formData.get("quantity"));
  const price = Number(formData.get("price"));
  if (!id || !title || !description || isNaN(quantity) || isNaN(price)) {
    return { success: false, message: "All fields are required" };
  }
  try {
    await query(
      `UPDATE offers SET title = $1, description = $2, quantity = $3, price = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5`,
      [title, description, quantity, price, id]
    );
    return { success: true };
  } catch (error) {
    console.error("Update offer error:", error);
    return { success: false, message: "Failed to update offer" };
  }
}

// Get all offers for a given product
export async function getOffersByProduct(productId: number): Promise<Offer[]> {
  try {
    const offers = await query<Offer>(
      `SELECT * FROM offers WHERE product_id = $1 AND is_active = true ORDER BY created_at DESC`,
      [productId],
    )
    return offers || []
  } catch (error) {
    console.error("Get offers by product error:", error)
    return []
  }
}

// Create a new offer for a product
export async function createOffer(formData: FormData) {
  const productId = Number.parseInt(formData.get("productId") as string);
  const quantity = Number.parseInt(formData.get("quantity") as string);
  const price = parseFloat(formData.get("price") as string);
  const title = (formData.get("title") as string) || `Offer for ${quantity}+ units`;
  const description = (formData.get("description") as string) || "Quantity-based offer";

  if (
    isNaN(productId) ||
    isNaN(quantity) ||
    isNaN(price) ||
    quantity <= 0 ||
    price <= 0
  ) {
    return { success: false, message: "Valid product, quantity, and price are required" };
  }

  try {
    const result = await query<{ id: number }>(
      `INSERT INTO offers (product_id, title, description, quantity, price, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING id`,
      [productId, title, description, quantity, price],
    );
    return { success: true, offerId: result[0].id };
  } catch (error) {
    console.error("Create offer error:", error);
    return { success: false, message: "Failed to create offer" };
  }
}

// Delete an offer by ID
export async function deleteOffer(offerId: number) {
  try {
    await query('DELETE FROM offers WHERE id = $1', [offerId]);
    return { success: true };
  } catch (error) {
    console.error('Delete offer error:', error);
    return { success: false, message: 'Failed to delete offer' };
  }
}

// Get all products with their offers joined (optional example)
export async function getAllProductsWithOffers() {
  try {
    const productsWithOffers = await query(
      `SELECT p.*, o.id as offer_id, o.title as offer_title, o.discount as offer_discount
       FROM products p
       LEFT JOIN offers o ON o.product_id = p.id AND o.is_active = true
       ORDER BY p.name`,
    )
    return productsWithOffers || []
  } catch (error) {
    console.error("Get all products with offers error:", error)
    return []
  }
}
