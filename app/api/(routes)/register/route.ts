import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// import { generateToken } from "@/app/api/utils/jwtService"; // Assuming you have a utility to generate JWT tokens
import { middleware } from "../../middlewares/handler";

const register = async (req: Request) => {
    try {
        // Parse the JSON body
        const { name, email, password, departmentId, roleId } = await req.json();

        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user in the database
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                departmentId,  // Assuming departmentId is passed from frontend
                roleId,        // Assuming roleId is passed from frontend
            },
        });

        // Generate JWT token for the newly created user
        // const token = generateToken(user.id);

        // Return success message with token
        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
        console.error("Error registering user:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
};

// Apply middleware to the POST route for registration
const registerHandler = middleware(register);

export { registerHandler as POST };
