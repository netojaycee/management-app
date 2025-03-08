import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { jwtMiddleware } from "../../middlewares/jwtMiddleware"; // JWT middleware
import { logAction } from '../../utils/logAction';

// ✅ GET route (Fetch all departments) - Public, no authentication required
// export async function GET(req: NextRequest) {
export async function GET() {

    try {
        const departments = await prisma.department.findMany({
            include: {
                permissions: true, // Include permissions in the response
            },
        });

        return NextResponse.json(departments, { status: 200 });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
    }
}

// ✅ POST route (Create a new department) - Requires authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }
    const { name, permissions } = await req.json();
    const userId = req.headers.get("x-user-id"); // Extract the userId from middleware

    try {
        if (!name || !permissions) {
            return NextResponse.json({ error: "Name and permissions are required." }, { status: 400 });
        }

        const existingDepartment = await prisma.department.findUnique({
            where: { name },
        });

        if (existingDepartment) {
            return NextResponse.json({ error: `Department "${name}" already exists.` }, { status: 400 });
        }

        // Create the new department
        const department = await prisma.department.create({
            data: {
                name,
                permissions: {
                    connect: permissions.map((id: string) => ({ id })), // Connect the permission IDs to the department
                },
            },
            include: {
                permissions: true, // Include permissions in the response
            },
        });

        // Ensure userId exists before logging
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Log the action with the authenticated user ID
        await logAction(userId, "Created a new department", `Department ${name} created`);

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
    }
}
