import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware"; // Import JWT Middleware
import { logAction } from "../../../utils/logAction";

// ✅ GET Route (Fetch a specific leave application by ID) - Public
export async function GET(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion


    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        const leave = await prisma.leave.findUnique({
            where: { id },
            include: {
                user: true, // Include user information
            },
        });

        if (!leave) {
            return NextResponse.json({ error: "Leave not found" }, { status: 404 });
        }

        return NextResponse.json(leave, { status: 200 });
    } catch (error) {
        console.error("Error fetching leave by ID:", error);
        return NextResponse.json({ error: `Failed to fetch leave: ${error}` }, { status: 500 });
    }
}

// ✅ PATCH Route (Update a leave application status) - Requires authentication
export async function DELETE(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }

    const { action, reason } = await req.json();
    const userId = req.headers.get("x-user-id"); // Extract authenticated user ID

    if (!id || !action || (action !== "approve" && action !== "decline")) {
        return NextResponse.json({ error: "Invalid action. Use 'approve' or 'decline'." }, { status: 400 });
    }

    try {
        let updatedLeave;

        if (action === "approve") {
            updatedLeave = await prisma.leave.update({
                where: { id },
                data: {
                    status: "Approved",
                    reason: null, // Clear reason if approved
                },
            });
        } else if (action === "decline") {
            if (!reason) {
                return NextResponse.json({ error: "Reason is required when declining a leave." }, { status: 400 });
            }
            updatedLeave = await prisma.leave.update({
                where: { id },
                data: {
                    status: "Declined",
                    reason, // Store decline reason
                },
            });
        }

        // Ensure userId exists before logging
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Log the action
        await logAction(userId, `Updated leave request (ID: ${id})`, `Action: ${action}`);

        return NextResponse.json(updatedLeave, { status: 200 });
    } catch (error) {
        console.error("Error updating leave status:", error);
        return NextResponse.json({ error: `Failed to update leave: ${error}` }, { status: 500 });
    }
}
