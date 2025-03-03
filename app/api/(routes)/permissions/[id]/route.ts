import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction } from "../../logs/route"; // Log actions
import { middleware, NextCustomMiddlewareType } from "@/app/api/middlewares/handler";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware"; // JWT middleware

// GET route (fetch a specific permission by ID) - Public, no authentication required
const getPermission: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    // Ensure the ID parameter is provided
    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        // Fetch a specific permission by ID
        const permission = await prisma.permission.findUnique({
            where: { id },
        });

        if (!permission) {
            console.error("Permission not found with id:", id);
            return NextResponse.json({ error: "Permission not found" }, { status: 404 });
        }

        return NextResponse.json(permission, { status: 200 });
    } catch (error) {
        console.error("Error fetching permission:", error);
        return NextResponse.json({ error: "Failed to fetch permission" }, { status: 500 });
    }
};

// PATCH route (update a specific permission) - Requires authentication
const updatePermission: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    // Ensure the ID parameter is provided
    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    const { name, description } = await req.json();
    const { userId } = req;

    try {
        if (!name || !description) {
            console.error("Missing required fields: name or description.");
            return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
        }

        // Update the permission
        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: { name: name.toLowerCase().replace(/\s+/g, "_"), description },
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
        await logAction(userId, "Updated a permission", `Permission ${name} updated`);

        return NextResponse.json(updatedPermission, { status: 200 });
    } catch (error) {
        console.error("Error updating permission:", error);
        return NextResponse.json({ error: "Failed to update permission" }, { status: 500 });
    }
};

// Apply middlewares to the GET and PATCH routes

// GET route (public, no authentication required)
const getPermissionHandler = middleware(getPermission); // No middleware applied, open route

// PATCH route (requires authentication)
const updatePermissionHandler = middleware(jwtMiddleware, updatePermission); // Requires authentication

export { getPermissionHandler as GET, updatePermissionHandler as PATCH };
