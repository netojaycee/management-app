import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction } from "../../logs/route"; // Log actions
import { middleware, NextCustomMiddlewareType } from '@/app/api/middlewares/handler';
import { jwtMiddleware } from '@/app/api/middlewares/jwtMiddleware';


// GET route (fetch a specific department by ID) - Public, no authentication required
const getDepartment: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    try {
        // Fetch a specific department by ID
        const department = await prisma.department.findUnique({
            where: { id },
            include: {
                permissions: true, // Including the permissions array with department
            },
        });

        if (!department) {
            console.error("Department not found with id:", id);
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        return NextResponse.json(department, { status: 200 });
    } catch (error) {
        console.error("Error fetching department:", error);
        return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 });
    }
};

// PATCH route (update a specific department) - Requires authentication
const updateDepartment: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    const { name, permissions } = await req.json();
    const { userId } = req;

    try {
        if (!name || !permissions) {
            console.error("Missing required fields: name or permissions.");
            return NextResponse.json({ error: "Name and permissions are required." }, { status: 400 });
        }

        // Update the department
        const updatedDepartment = await prisma.department.update({
            where: { id },
            data: {
                name,
                permissions: {
                    set: permissions, // Set the new permissions (assuming it's an array of permission IDs)
                },
            },
            include: {
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

        // Log the update action
        await logAction(userId, "Updated a department", `Department ${name} updated`);

        return NextResponse.json(updatedDepartment, { status: 200 });
    } catch (error) {
        console.error("Error updating department:", error);
        return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
    }
};

// DELETE route (delete a specific department) - Requires authentication
const deleteDepartment: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    const { userId } = req;

    try {
        await prisma.department.delete({ where: { id } });

        // Ensure userId is available before logging
        if (!userId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }

        // Log the delete action
        await logAction(userId, "Deleted a department", `Department with ID ${id} deleted`);

        return NextResponse.json({ message: "deleted successfully " }, { status: 204 }) // No content
    } catch (error) {
        console.error("Error deleting department:", error);
        return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
    }
};

// Apply middlewares to the GET, PATCH, and DELETE routes

// GET route (public, no authentication required)
const getDepartmentHandler = middleware(getDepartment); // No middleware applied, open route

// PATCH route (requires authentication)
const updateDepartmentHandler = middleware(jwtMiddleware, updateDepartment); // Requires authentication

// DELETE route (requires authentication)
const deleteDepartmentHandler = middleware(jwtMiddleware, deleteDepartment); // Requires authentication

export { getDepartmentHandler as GET, updateDepartmentHandler as PATCH, deleteDepartmentHandler as DELETE };
