import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { logAction } from "../logs/route"; // Log actions
import { middleware } from "../../middlewares/handler"; // Central middleware handler
import { jwtMiddleware } from "../../middlewares/jwtMiddleware"; // JWT middleware

// GET route (fetch all departments) - Public, no authentication required
const getDepartments = async () => {
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
};

// POST route (create a new department with permissions) - Requires authentication
const createDepartment = async (req: Request) => {
    const { name, permissions } = await req.json();
    const { userId } = req;

    

    try {
        if (!name || !permissions) {
            console.error("Missing required fields: name or permissions.");
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

        // Ensure userId is available before logging
        if (!userId) {
            console.error("User ID is missing in the request.");
            return new NextResponse(
                JSON.stringify({ error: "Unauthorized - User ID missing" }),
                { status: 401 }
            );
        }

        // Log the action with the userId attached to the request
        await logAction(userId, "Created a new department", `Department ${name} created`);
        // await logAction("user", "Created a new department", `Department ${name} created`);

        return NextResponse.json(department, { status: 201 });
    } catch (error) {
        console.error("Error creating department:", error);
        return NextResponse.json({ error: "Failed to create department" }, { status: 500 });
    }
};

// Apply middlewares to the GET and POST routes

// GET route (public, no authentication required)
const getDepartmentsHandler = middleware(getDepartments); // No middleware applied, open route

// POST route (requires authentication)
const createDepartmentHandler = middleware(jwtMiddleware, createDepartment); // Requires authentication

export { getDepartmentsHandler as GET, createDepartmentHandler as POST };
