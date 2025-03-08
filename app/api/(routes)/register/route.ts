import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAction } from "../../utils/logAction";
import { generateToken } from "@/app/api/utils/jwtService"; // Ensure this exists

// ✅ POST route (User Registration)
export async function POST(req: NextRequest) {
    try {
        // Parse the JSON body
        const { name, email, password, departmentId, roleId } = await req.json();

        // Validate required fields
        if (!name || !email || !password || !departmentId || !roleId) {
            return NextResponse.json({ error: "All fields are required." }, { status: 400 });
        }

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                departmentId,
                roleId,
            },
        });

        // Log the registration action
        await logAction(newUser.id, "Registered a new user", `User ${name} created.`);

        // Generate JWT token
        const token = generateToken(newUser.id);

        // Return success response
        return NextResponse.json({
            message: "User registered successfully",
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email },
        }, { status: 201 });

    } catch (error) {
        console.error("❌ Error registering user:", error);
        return NextResponse.json({ error: `Server Error: ${error}` }, { status: 500 });
    }
}
