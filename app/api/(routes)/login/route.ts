import bcrypt from "bcryptjs";
import { generateToken } from "@/app/api/utils/jwtService";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { middleware } from "../../middlewares/handler";


const login = async (req: Request) => {
    try {
        // Parse the JSON body
        const { email, password } = await req.json();

        // Check if the user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        // Check if the password matches
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        // Generate JWT token
        const token = generateToken(user.id);

        // Send the token in the response
        return NextResponse.json({ message: "Login Successful", token: token }, { status: 200 });
    }
    catch (error) {
        console.log(error, "Server Error")
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }


}



const loginHandler = middleware(login); // Requires authentication

export { loginHandler as POST };