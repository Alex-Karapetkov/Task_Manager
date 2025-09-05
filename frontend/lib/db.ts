// database client helper
// centralizes database logic, easy to maintain, cleaner NextAuth.js API route

import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";

export async function openDB() {
    return open({
        filename: "../../backend/user_database.db",
        driver: sqlite3.Database,
    });
}

// Get user by email
export async function getUserByEmail(email: string) {
    const db = await openDB();
    return db.get("SELECT * FROM users WHERE email = ?", email);
}

// Get user by id
export async function getUserById(id: number) {
    const db = await openDB();
    return db.get("SELECT * FROM users WHERE id = ?", id);
}

// Create a new user (hash password before storing)
export async function createUser(username: string, email: string, password: string) {
    const db = await openDB();
    const password_hash = await bcrypt.hash(password, 10);
    const result = await db.run(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        username,
        email,
        password_hash
    );

    // check to make sure lastID is not undefined
    if (result.lastID === undefined) {
        throw new Error("Failed to create user, no ID returned.");
    }
    return getUserById(result.lastID);
}

// Verify password
export async function verifyPassword(user: { password_hash: string }, password: string) {
    return bcrypt.compare(password, user.password_hash);
}