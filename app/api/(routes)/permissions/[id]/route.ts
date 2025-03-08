import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { logAction } from "../../../utils/logAction";

// ✅ GET route (Fetch a specific permission by ID) - Public, No authentication required
export async function GET(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion


    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        const permission = await prisma.permission.findUnique({
            where: { id },
        });

        if (!permission) {
            return NextResponse.json({ error: "Permission not found" }, { status: 404 });
        }

        return NextResponse.json(permission, { status: 200 });
    } catch (error) {
        console.error("❌ Error fetching permission:", error);
        return NextResponse.json({ error: `Failed to fetch permission: ${error}` }, { status: 500 });
    }
}

// ✅ PATCH route (Update a specific permission) - Requires authentication
export async function PATCH(req: NextRequest, context: any) {
    const id = (context.params as { id: string }).id; // Force type assertion
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse;
    }

    const { name, description } = await req.json();
    const userId = req.headers.get("x-user-id"); // Extract the userId from middleware

    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }
    if (!name || !description) {
        return NextResponse.json({ error: "Name and description are required." }, { status: 400 });
    }
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
    }

    try {
        const updatedPermission = await prisma.permission.update({
            where: { id },
            data: { name: name.toLowerCase().replace(/\s+/g, "_"), description },
        });

        // Log the update action
        await logAction(userId, "Updated a permission", `Permission "${name}" updated`);

        return NextResponse.json(updatedPermission, { status: 200 });
    } catch (error) {
        console.error("❌ Error updating permission:", error);
        return NextResponse.json({ error: `Failed to update permission: ${error}` }, { status: 500 });
    }
}
