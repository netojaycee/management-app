import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "../../logs/route";
import { middleware, NextCustomMiddlewareType } from "@/app/api/middlewares/handler";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";


// GET route (fetch a specific role by ID) - Public, no authentication required
const getRole: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    try {
        // Fetch a specific role by ID
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                department: true, // Include the department for the role
                permissions: true, // Include the permissions for the role
            },
        });

        if (!role) {
            console.error("Role not found with id:", id);
            return NextResponse.json({ error: "Role not found" }, { status: 404 });
        }

        return NextResponse.json(role, { status: 200 });
    } catch (error) {
        console.error("Error fetching role:", error);
        return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
    }
};

// PATCH route (update a specific role) - Requires authentication
const updateRole: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    const { name, departmentId, permissions } = await req.json();
    const { userId } = req;

    try {
        if (!name || !departmentId || !permissions) {
            console.error("Missing required fields: name, departmentId, or permissions.");
            return NextResponse.json({ error: "Name, department, and permissions are required." }, { status: 400 });
        }

        // Convert role name to lowercase before saving
        const roleName = name.toLowerCase();

        // Get the permissions of the department to which the role belongs
        const departmentPermissions = await prisma.department.findUnique({
            where: { id: departmentId },
            select: {
                permissions: {
                    select: {
                        id: true,
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
            ...permissions,
        ];

        // Update the role
        const updatedRole = await prisma.role.update({
            where: { id },
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

        if (!userId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }

        // Log the update action
        await logAction(userId, "Updated a role", `Role ${name} updated`);

        return NextResponse.json(updatedRole, { status: 200 });
    } catch (error) {
        console.error("Error updating role:", error);
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
};

// DELETE route (delete a specific role) - Requires authentication
const deleteRole: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    const { userId } = req;

    try {
        // Delete the role by ID
        await prisma.role.delete({
            where: { id },
        });
        if (!userId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }
        // Log the delete action
        await logAction(userId, "Deleted a role", `Role with ID ${id} deleted`);

        return NextResponse.json({ message: 'deleted successfully' }, { status: 204 }) // No content
    } catch (error) {
        console.error("Error deleting role:", error);
        return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
    }
};

// Apply middlewares to the GET, PATCH, and DELETE routes

// GET route (public, no authentication required)
const getRoleHandler = middleware(getRole); // No middleware applied, open route

// PATCH route (requires authentication)
const updateRoleHandler = middleware(jwtMiddleware, updateRole); // Requires authentication

// DELETE route (requires authentication)
const deleteRoleHandler = middleware(jwtMiddleware, deleteRole); // Requires authentication

export { getRoleHandler as GET, updateRoleHandler as PATCH, deleteRoleHandler as DELETE };
