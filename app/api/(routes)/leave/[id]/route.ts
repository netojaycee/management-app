import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "../../logs/route"; // Log actions
import { middleware, NextCustomMiddlewareType } from "@/app/api/middlewares/handler";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";


// PATCH route (update a leave application) - Requires authentication
const updateLeave: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    } const { action, reason } = await req.json();
    const { userId } = req;

    if (!action || (action !== "approve" && action !== "decline")) {
        return NextResponse.json({ error: "Invalid action. Use 'approve' or 'decline'." }, { status: 400 });
    }

    try {
        let updatedLeave;

        if (action === "approve") {
            updatedLeave = await prisma.leave.update({
                where: { id },
                data: {
                    status: "Approved",
                    reason: null, // Ensure reason is cleared if approved
                },
            });
        } else if (action === "decline") {
            if (!reason) {
                return NextResponse.json({ error: "Reason is required for declined leave." }, { status: 400 });
            }
            updatedLeave = await prisma.leave.update({
                where: { id },
                data: {
                    status: "Declined",
                    reason, // Set the decline reason
                },
            });
        }

        // Ensure userId is available before logging
        if (!userId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }

        // Log the action
        await logAction(userId, "Updated a leave request", `User updated leave request with ID: ${id}`);

        return NextResponse.json(updatedLeave, { status: 200 });
    } catch (error) {
        console.error("Error updating leave status:", error);
        return NextResponse.json({ error: "Failed to update leave" }, { status: 500 });
    }
};

// GET route (fetch a specific leave application by ID) - Public, no authentication required
const getLeave: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    try {
        const leave = await prisma.leave.findUnique({
            where: { id },
            include: {
                user: true, // Include user information (if needed)
            },
        });

        if (!leave) {
            console.error("Leave not found with id:", id);
            return NextResponse.json({ error: "Leave not found" }, { status: 404 });
        }

        return NextResponse.json(leave, { status: 200 });
    } catch (error) {
        console.error("Error fetching leave by id:", error);
        return NextResponse.json({ error: "Failed to fetch leave" }, { status: 500 });
    }
};

// Apply middlewares to the GET and PATCH routes

// GET route (public, no authentication required)
const getLeaveHandler = middleware(getLeave); // No middleware applied, open route

// PATCH route (requires authentication)
const updateLeaveHandler = middleware(jwtMiddleware, updateLeave); // Requires authentication

export { getLeaveHandler as GET, updateLeaveHandler as PATCH };
