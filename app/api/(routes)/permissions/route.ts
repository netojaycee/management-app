import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "../../middlewares/jwtMiddleware";
import { logAction } from "../../utils/logAction";

// ✅ GET route (Fetch all permissions) - Public, no authentication required
export async function GET() {
    try {
        const permissions = await prisma.permission.findMany();
        return NextResponse.json(permissions, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching permissions:", error);
        return NextResponse.json({ error: `Failed to fetch permissions: ${error}` }, { status: 500 });
    }
}

// ✅ POST route (Create a new permission) - Requires authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return authentication error response
    }

    try {
        // Parse request data
        const { name, description } = await req.json();
        const userId = req.headers.get("x-user-id"); // Extract the userId from middleware

        // Validate required fields
        if (!name || typeof name !== "string") {
            return NextResponse.json(
                { error: "Permission name is required and must be a string." },
                { status: 400 }
            );
        }

        if (!description || typeof description !== "string") {
            return NextResponse.json(
                { error: "Permission description is required and must be a string." },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - User ID missing" },
                { status: 401 }
            );
        }

        // Normalize and create permission record
        const permission = await prisma.permission.create({
            data: {
                name: name.toLowerCase().replace(/\s+/g, "_"), // Normalize name
                description,
            },
        });

        // Log the action with user details
        await logAction(
            userId,
            "Created a new permission",
            `Permission "${name}" created with description: "${description}"`
        );

        return NextResponse.json(permission, { status: 201 });
    } catch (error) {
        console.error("❌ Error creating permission:", error);
        return NextResponse.json(
            { error: `Failed to create permission: ${error}` },
            { status: 500 }
        );
    }
}
