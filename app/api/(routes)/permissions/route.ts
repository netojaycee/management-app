import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { logAction } from "../logs/route"; // Log actions
import { middleware } from "../../middlewares/handler"; // Central middleware handler
import { jwtMiddleware } from "../../middlewares/jwtMiddleware"; // JWT middleware

// GET route (fetch all permissions) - Public, no authentication required
const getPermissions = async () => {
    try {
        const permissions = await prisma.permission.findMany();
        return NextResponse.json(permissions, { status: 200 });
    } catch (error) {
        console.error("Error fetching permissions:", error); // Log error
        return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
    }
};

// POST route (create a new permission) - Requires authentication
const createPermission = async (req: Request) => {
    try {
        // Parse request data
        const { name, description } = await req.json();
        const { userId } = req as any; // Get userId from JWT middleware

        // Validate required fields
        if (!name || typeof name !== "string") {
            console.error("Validation Error: 'name' is missing or invalid.");
            return NextResponse.json(
                { error: "Permission name is required and must be a string." },
                { status: 400 }
            );
        }

        if (!description || typeof description !== "string") {
            console.error("Validation Error: 'description' is missing or invalid.");
            return NextResponse.json(
                { error: "Permission description is required and must be a string." },
                { status: 400 }
            );
        }

        // Ensure userId is available before proceeding
        if (!userId) {
            console.error("Authorization Error: User ID is missing in the request.");
            return NextResponse.json(
                { error: "Unauthorized - User ID missing" },
                { status: 401 }
            );
        }

        // Create the permission record
        const permission = await prisma.permission.create({
            data: {
                name: name.toLowerCase().replace(/\s+/g, "_"), // Normalize permission name
                description,
            },
        });

        // Log the action with user details
        await logAction(
            userId,
            "Created a new permission",
            `Permission "${name}" created with description: "${description}"`
        );
        // await logAction(
        //     "user",
        //     "Created a new permission",
        //     `Permission "${name}" created with description: "${description}"`
        // );

        // Return the created permission
        return NextResponse.json(permission, { status: 201 });
    } catch (error) {
        // Handle and log errors
        console.error("Error creating permission:", error);
        return NextResponse.json(
            { error: "Failed to create permission. Please try again later." },
            { status: 500 }
        );
    }
};

// Apply middlewares to the GET and POST routes

// GET route (public, no authentication required)
const getPermissionsHandler = middleware(getPermissions); // No middleware applied, open route

// POST route (requires authentication)
const createPermissionHandler = middleware(jwtMiddleware, createPermission); // Requires authentication

export { getPermissionsHandler as GET, createPermissionHandler as POST };
