
"use server"

export async function loginWithGoogle(email: string) {
  try {
    const users = await query<User>(
      `SELECT id, username, email, role, points, reserved_points 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );
    if (users.length === 0) {
      return { success: false, message: "User not found" };
    }
    const user = users[0];
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return { success: true, user };
  } catch (error) {
    console.error("Google login error:", error);
    return { success: false, message: "Failed to login with Google" };
  }
}

import { cookies } from "next/headers"
import { query } from "@/lib/db"
import { recordLoginAttempt, isLocked } from "@/lib/login-attempts"

// Separate type for login, which includes password_hash
interface DBUser {
  id: number
  username: string
  email: string
  role: string
  points: number
  reserved_points: number
  password_hash: string
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Check if locked
  const lockedFor = isLocked(email);
  if (lockedFor > 0) {
    return { success: false, message: `Too many failed attempts. Try again in ${lockedFor} seconds.` };
  }

  try {
    const users = await query<DBUser>(
      `SELECT id, username, email, role, points, reserved_points, password_hash 
       FROM users 
       WHERE email = $1 
       LIMIT 1`,
      [email]
    );

    if (users.length === 0) {
      recordLoginAttempt(email, false);
      return { success: false, message: "User not found" };
    }

    const user = users[0];

    if (password !== user.password_hash) {
      recordLoginAttempt(email, false);
      return { success: false, message: "Invalid password" };
    }

    // Success: reset attempts
    recordLoginAttempt(email, true);

    // Set cookies
    const cookieStore = await cookies();
    cookieStore.set("userId", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    cookieStore.set("userRole", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        points: user.points,
        reserved_points: user.reserved_points,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
}
// This type matches what's returned from SELECT
interface User {
  id: number
  username: string
  email: string
  role: string
  points: number
  reserved_points: number
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value

    if (!userId) {
      return null
    }

    const users = await query<User>(
      `SELECT id, username, email, role, points, reserved_points 
       FROM users 
       WHERE id = $1 
       LIMIT 1`,
      [Number.parseInt(userId)]
    )

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
export async function register(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const existingUsers = await query(
      `SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1`,
      [email, username]
    )

    if (existingUsers.length > 0) {
      return { success: false, message: "User already exists" }
    }

    // In production, hash the password!
    const passwordHash = password

    const result = await query(
      `INSERT INTO users (username, email, password_hash, role, points, reserved_points)
       VALUES ($1, $2, $3, 'customer', 0, 0)
       RETURNING id`,
      [username, email, passwordHash]
    )

    return { success: true, userId: result[0]?.id }
  } catch (error) {
    console.error("Create user error:", error)
    return { success: false, message: "Failed to create user" }
  }
}
export async function registerWithGoogle(user: { email: string, displayName?: string, whatsapp?: string }) {
  try {
    // Check if user already exists
    const existingUsers = await query(
      `SELECT id FROM users WHERE email = $1 LIMIT 1`,
      [user.email]
    );
    if (existingUsers.length > 0) {
      return { success: false, message: "User already exists" };
    }
    // Insert new user with Google info and whatsapp
    const result = await query(
      `INSERT INTO users (username, email, role, points, reserved_points, whatsapp)
       VALUES ($1, $2, 'customer', 0, 0, $3)
       RETURNING id`,
      [user.displayName || user.email, user.email, user.whatsapp || null]
    );
    return { success: true, userId: result[0]?.id };
  } catch (error) {
    console.error("Google register error:", error);
    return { success: false, message: "Failed to create user with Google" };
  }
}
