import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret" // Store securely in .env

// Create new user
export const createUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        // Check if user already exists
        const findUser = await prisma.user.findUnique({
            where: { email }
        })

        if (findUser) {
            return res.status(400).json({ error: "Email already taken" })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        })

        

        return res.status(201).json({
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
            message: "New user created successfully."
        })

    } catch (error) {
        console.error("Error creating user:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

// Login user
export const loginUser = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" })
    }

    try {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" })
        }

        // Generate token
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "10h" })

        console.log(token)
        // Exclude password from response
        const { password: userPassword, ...userWithoutPassword } = user

        return res.json({
            user: userWithoutPassword,
            token:token,
            message: "Login successful"
        })

    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({ error: "Internal server error" })
    }
}

// Get all users (for admin/testing)
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, createdAt: true } // Exclude passwords
        })

        if (!users.length) {
            return res.status(404).json({ error: "No users available" })
        }

        res.json(users)
    } catch (error) {
        console.error("Error fetching users:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}
