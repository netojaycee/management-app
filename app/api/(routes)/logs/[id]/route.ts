import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ GET route (fetch a specific log by ID) - Requires authentication
export async function GET(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }


    // Ensure the ID parameter is provided
    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        // Fetch a specific log by ID
        const log = await prisma.log.findUnique({
            where: { id },
            include: {
                user: true, // Optionally include user info related to the log
            },
        });

        if (!log) {
            console.error("❌ Log not found with id:", id);
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }

        return NextResponse.json(log, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching log by ID:", error);
        return NextResponse.json({ error: `Failed to fetch log: ${error}` }, { status: 500 });
    }
}
