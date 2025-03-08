import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { logAction } from "../../../utils/logAction";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";

// ✅ GET route (Fetch a specific role) - Public
export async function GET(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    try {
        // Fetch role with department & permissions
        const role = await prisma.role.findUnique({
            where: { id },
            include: { department: true, permissions: true },
        });

        if (!role) {
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        return NextResponse.json(role, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching role:", error);
        return NextResponse.json({ error: `Failed to fetch role: ${error}` }, { status: 500 });
    }
}

// ✅ PATCH route (Update a role) - Requires Authentication
export async function PATCH(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    const { name, departmentId, permissions } = await req.json();
    const userId = req.headers.get("x-user-id"); // Extract userId from middleware

    if (!id || !name || !departmentId || !permissions) {
        return NextResponse.json(
            { error: "ID, name, department, and permissions are required." },
            { status: 400 }
        );
    }

    try {
        // Convert role name to lowercase
        const roleName = name.toLowerCase();

        // Get department permissions
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { permissions: { select: { id: true } } },
        });

        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        // Merge department permissions with provided ones
        const permissionsToConnect = [
            ...department.permissions.map((perm) => perm.id),
            ...permissions,
        ];

        // Update role
        const updatedRole = await prisma.role.update({
            where: { id },
            data: {
                name: roleName,
                department: { connect: { id: departmentId } },
                permissions: { connect: permissionsToConnect.map((id) => ({ id })) },
            },
            include: { department: true, permissions: true },
        });

        // Ensure userId exists before logging
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Log update action
        await logAction(userId, "Updated a role", `Role ${name} updated.`);

        return NextResponse.json(updatedRole, { status: 200 });

    } catch (error) {
        console.error("❌ Error updating role:", error);
        return NextResponse.json({ error: `Failed to update role: ${error}` }, { status: 500 });
    }
}

// ✅ DELETE route (Delete a role) - Requires Authentication
export async function DELETE(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    const userId = req.headers.get("x-user-id"); // Extract userId from middleware

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        await prisma.role.delete({ where: { id } });

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Log delete action
        await logAction(userId, "Deleted a role", `Role with ID ${id} deleted.`);

        return NextResponse.json({ message: "Role deleted successfully" }, { status: 204 });

    } catch (error) {
        console.error("❌ Error deleting role:", error);
        return NextResponse.json({ error: `Failed to delete role: ${error}` }, { status: 500 });
    }
}
