import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "../../middlewares/jwtMiddleware";
import { logAction } from "../../utils/logAction";

// ✅ GET route (Fetch all roles) - Public
export async function GET() {
    try {
        const roles = await prisma.role.findMany({
            include: {
                department: true, // Include department info
                permissions: true, // Include associated permissions
            },
        });

        return NextResponse.json(roles, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching roles:", error);
        return NextResponse.json({ error: `Failed to fetch roles: ${error}` }, { status: 500 });
    }
}

// ✅ POST route (Create a new role) - Requires Authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) return authResponse;

    try {
        const { name, departmentId, permissions } = await req.json();
        const userId = req.headers.get("x-user-id"); // Extract userId from middleware

        // Validate required fields
        if (!name || !departmentId || !permissions) {
            return NextResponse.json(
                { error: "Name, department, and permissions are required." },
                { status: 400 }
            );
        }

        // Convert role name to lowercase
        const roleName = name.toLowerCase();

        // Get department's existing permissions
        const department = await prisma.department.findUnique({
            where: { id: departmentId },
            select: { permissions: { select: { id: true } } },
        });

        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        // Merge department permissions with provided permissions
        const permissionsToConnect = [
            ...department.permissions.map((perm) => perm.id),
            ...permissions,
        ];

        // Create the new role
        const role = await prisma.role.create({
            data: {
                name: roleName,
                department: { connect: { id: departmentId } },
                permissions: {
                    connect: permissionsToConnect.map((id) => ({ id })),
                },
            },
            include: { department: true, permissions: true },
        });

        // Ensure userId exists before logging
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Log role creation
        await logAction(userId, "Created a new role", `Role ${name} created.`);

        return NextResponse.json(role, { status: 201 });

    } catch (error) {
        console.error("❌ Error creating role:", error);
        return NextResponse.json({ error: `Failed to create role: ${error}` }, { status: 500 });
    }
}
