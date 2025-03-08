import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware"; // Import JWT Middleware
import { logAction } from "../../utils/logAction";

// ✅ GET Route (Fetch all leave applications) - Public
export async function GET() {
    try {
        const leaves = await prisma.leave.findMany({
            include: {
                user: true, // Include user information
            },
        });

        return NextResponse.json(leaves, { status: 200 });
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        return NextResponse.json({ error: `Failed to fetch leaves: ${error}` }, { status: 500 });
    }
}

// ✅ POST Route (Create a new leave application) - Requires authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }

    try {
        const { startDate, endDate } = await req.json();
        const userId = req.headers.get("x-user-id"); // Extract the authenticated user ID

        if (!userId || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields: startDate or endDate." }, { status: 400 });
        }

        // Create the new leave application with a "Pending" status initially
        const leave = await prisma.leave.create({
            data: {
                userId,
                startDate,
                endDate,
                status: "Pending", // Default status
            },
        });

        // Log the action with the authenticated user ID
        await logAction(userId, "Created a new leave application");

        return NextResponse.json(leave, { status: 201 });
    } catch (error) {
        console.error("Error creating leave application:", error);
        return NextResponse.json({ error: `Failed to create leave: ${error}` }, { status: 500 });
    }
}
