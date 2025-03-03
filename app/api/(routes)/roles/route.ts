import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "../logs/route";
import { middleware } from "../../middlewares/handler"; // Central middleware handler
import { jwtMiddleware } from "../../middlewares/jwtMiddleware"; // JWT middleware

const getRoles = async () => {
    try {
        const roles = await prisma.role.findMany({
            include: {
                department: true, // Include department for each role
                permissions: true, // Include permissions for each role
            },
        });

        return NextResponse.json(roles, { status: 200 });
    } catch (error) {
        console.error("Error fetching roles:", error);
        return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
    }
};

// POST route (create a new role) - Requires authentication
const createRole = async (req: Request) => {
    const { name, departmentId, permissions } = await req.json();
    const { userId } = req;

    if (!name || !departmentId || !permissions) {
        console.error("Missing required fields: name, departmentId, or permissions.");
        return NextResponse.json({ error: "Name, department, and permissions are required." }, { status: 400 });
    }

    // Convert role name to lowercase
    const roleName = name.toLowerCase();

    // Get the permissions of the department to which the role belongs
    const departmentPermissions = await prisma.department.findUnique({
        where: { id: departmentId },
        select: {
            permissions: {
                select: {
                    id: true, // Only get the permissions' IDs
                },
            },
        },
    });

    if (!departmentPermissions) {
        console.error("Department not found with id:", departmentId);
        return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    // Merge department permissions with the provided permissions
    const permissionsToConnect = [
        ...departmentPermissions.permissions.map((perm) => perm.id),
        ...permissions, // Adding the permissions passed in the request
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
        include: {
            department: true,
            permissions: true,
        },
    });

    // Ensure userId is available before logging
    if (!userId) {
        console.error("User ID is missing in the request.");
        return new NextResponse(
            JSON.stringify({ error: "Unauthorized - User ID missing" }),
            { status: 401 }
        );
    }

    // Log the action with the userId attached to the request
    await logAction(userId, "Created a new role", `Role ${name} created`);
    // await logAction("user", "Created a new role", `Role ${name} created`);

    return NextResponse.json(role, { status: 201 });
};

// Apply middlewares to the GET and POST routes

// GET route (public, no authentication required)
const getRolesHandler = middleware(getRoles); // No middleware applied, open route

// POST route (requires authentication)
const createRoleHandler = middleware(jwtMiddleware, createRole); // Requires authentication

export { getRolesHandler as GET, createRoleHandler as POST };

