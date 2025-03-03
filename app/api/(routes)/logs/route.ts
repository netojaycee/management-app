import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { middleware } from "../../middlewares/handler";
import { jwtMiddleware } from "../../middlewares/jwtMiddleware";

// GET route (fetch all logs) - Public, no authentication required
const getLogs = async () => {
    try {
        const logs = await prisma.log.findMany({
            include: {
                user: true, // Optionally include user info related to the log
            },
            orderBy: {
                createdAt: 'desc', // Order logs by creation date in descending order
            },
        });

        return NextResponse.json(logs, { status: 200 });
    } catch (error) {
        console.error("Error fetching logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
};





// GET route (public, no authentication required)
const getLogsHandler = middleware(jwtMiddleware, getLogs); // No middleware applied, open route


export { getLogsHandler as GET };


export async function logAction(userId: string, action: string, details?: string) {
    try {
        await prisma.log.create({
            data: {
                userId,
                action,
                details,
            },
        });
    } catch (error) {
        console.error("Error logging action:", error);
    }
}
