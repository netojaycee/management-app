import { prisma } from "@/lib/prisma";
import { middleware, NextCustomMiddlewareType } from "@/app/api/middlewares/handler";
import { NextResponse } from "next/server";

// GET route (fetch a specific log by ID) - Public, no authentication required
const getLog: NextCustomMiddlewareType = async (req, { params }) => {
    const id = params?.id;

    // Ensure the ID parameter is provided
    if (!id) {
        return NextResponse.json({ error: "ID parameter is required" }, { status: 400 });
    }

    try {
        // Fetch a specific log by ID
        const log = await prisma.log.findUnique({
            where: { id },
            include: {
                user: true, // Optionally include user info related to the log
            },
        });

        if (!log) {
            console.error("Log not found with id:", id);
            return NextResponse.json({ error: "Log not found" }, { status: 404 });
        }

        // Optionally log the access to the log information (unnecessary for public routes but can be included for audit)
        // await logAction(userId, "Viewed log", `User viewed log with ID: ${id}`); 

        return NextResponse.json(log, { status: 200 });
    } catch (error) {
        console.error("Error fetching log by id:", error);
        return NextResponse.json({ error: "Failed to fetch log" }, { status: 500 });
    }
};

// Apply middleware (if authentication is required)
const getLogHandler = middleware(getLog); // No middleware applied for open routes

export { getLogHandler as GET };
