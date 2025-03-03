import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "../logs/route"; // Log actions
import { middleware } from "../../middlewares/handler"; // Central middleware handler
import { jwtMiddleware } from "../../middlewares/jwtMiddleware"; // JWT middleware

// GET route (fetch all leave applications) - Public, no authentication required
const getLeaves = async () => {
    try {
        const leaves = await prisma.leave.findMany({
            include: {
                user: true, // Include user information (if needed)
            },
        });

        return NextResponse.json(leaves, { status: 200 });
    } catch (error) {
        console.error("Error fetching all leaves:", error);
        return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
    }
};

// POST route (create a new leave application) - Requires authentication
const createLeave = async (req: Request) => {
    const { startDate, endDate } = await req.json();
    const { userId: authenticatedUserId } = req;

    if (!authenticatedUserId || !startDate || !endDate) {
        console.error("Missing required fields: authenticatedUserId, startDate, or endDate.");
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // Create the new leave application with a "Pending" status initially
        const leave = await prisma.leave.create({
            data: {
                userId: authenticatedUserId,
                startDate,
                endDate,
                status: "Pending", // Set status to "Pending" initially
            },
        });

        // Ensure userId is available before logging
        if (!authenticatedUserId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }

        // Log the action with the userId attached to the request
        await logAction(authenticatedUserId, "Created a new leave application");

        return NextResponse.json(leave, { status: 201 });
    } catch (error) {
        console.error("Error creating leave application:", error);
        return NextResponse.json({ error: "Failed to create leave" }, { status: 500 });
    }
};

// Apply middlewares to the GET and POST routes

// GET route (public, no authentication required)
const getLeavesHandler = middleware(jwtMiddleware, getLeaves); // No middleware applied, open route

// POST route (requires authentication)
const createLeaveHandler = middleware(jwtMiddleware, createLeave); // Requires authentication

export { getLeavesHandler as GET, createLeaveHandler as POST };
