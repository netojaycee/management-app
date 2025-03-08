import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "../../middlewares/jwtMiddleware";

// ✅ GET route (fetch all logs) - Requires authentication
export async function GET(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }

    try {
        const logs = await prisma.log.findMany({
            include: {
                user: true, // Optionally include user info related to the log
            },
            orderBy: {
                createdAt: 'desc', // Order logs by creation date in descending order
            },
        });

        return NextResponse.json(logs, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching logs:", error);
        return NextResponse.json({ error: `Failed to fetch logs: ${error}` }, { status: 500 });
    }
}


