import bcrypt from "bcryptjs";
import { generateToken } from "@/app/api/utils/jwtService";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAction } from "../../utils/logAction";

// ✅ Login Handler
export async function POST(req: NextRequest) {
    try {
        // Parse JSON request body
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // ✅ Check if the user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // ✅ Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // ✅ Update last login timestamp
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // ✅ Generate JWT token
        const token = generateToken(user.id);

        // ✅ Log user login action
        await logAction(user.id, "User Logged In", `User ${user.email} logged in`);

        // ✅ Return response with token
        return NextResponse.json({ message: "Login Successful", token }, { status: 200 });

    } catch (error) {
        console.error("❌ Server Error during login:", error);
        return NextResponse.json({ error: `Server Error: ${error}` }, { status: 500 });
    }
}
