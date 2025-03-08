import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware"; // Import middleware
import { logAction } from "../../../utils/logAction";

// ✅ GET Route (Public)

export async function GET(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        const department = await prisma.department.findUnique({
            where: { id },
            include: { permissions: true },
        });

        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        return NextResponse.json(department, { status: 200 });
    } catch (error) {
        console.error("Error fetching department:", error);
        return NextResponse.json({ error: `Failed to fetch department: ${error}` }, { status: 500 });
    }
}

// ✅ PATCH Route (Protected)
export async function PATCH(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse;
    }

    const { name, permissions } = await req.json();
    const userId = req.headers.get("x-user-id");

    if (!id || !name || !permissions) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
    }

    try {
        const updatedDepartment = await prisma.department.update({
            where: { id },
            data: { name, permissions: { set: permissions } },
            include: { permissions: true },
        });

        // Log the action
        await logAction(userId, `Updated Department: ${name}`);

        return NextResponse.json(updatedDepartment, { status: 200 });
    } catch (error) {
        console.error("Error updating department:", error);
        return NextResponse.json({ error: `Failed to update department: ${error}` }, { status: 500 });
    }
}

// ✅ DELETE Route (Protected)
export async function DELETE(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse;
    }

    const userId = req.headers.get("x-user-id");

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
    }

    try {
        await prisma.department.delete({ where: { id } });

        // Log the action
        await logAction(userId, `Deleted Department with ID: ${id}`);

        return NextResponse.json({ message: "Department deleted successfully" }, { status: 204 });
    } catch (error) {
        console.error("Error deleting department:", error);
        return NextResponse.json({ error: `Failed to delete department: ${error}` }, { status: 500 });
    }
}
