import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";

// ✅ GET Route (Fetch User Loan History) - Requires authentication
export async function GET(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return authentication error if unauthorized
    }

    try {
        const userId = req.headers.get("x-user-id"); // Extract authenticated user ID

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Fetch user loan history
        const loans = await prisma.loan.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ loans }, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching loan history:", error);
        return NextResponse.json({ error: `Failed to fetch loan history: ${error}` }, { status: 500 });
    }
}
