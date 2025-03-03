import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { middleware } from "@/app/api/middlewares/handler";

const getLoanHistory = async (req: Request) => {
    try {
        const { userId } = req as any;

        const loans = await prisma.loan.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ loans }, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching loan history:", error);
        return NextResponse.json({ error: "Failed to fetch loan history" }, { status: 500 });
    }
};

// Apply Authentication Middleware
const getLoanHistoryHandler = middleware(jwtMiddleware, getLoanHistory);
export { getLoanHistoryHandler as GET };
