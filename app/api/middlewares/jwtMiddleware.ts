import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../utils/jwtService";
import { JwtPayload, TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

export async function jwtMiddleware(req: NextRequest) {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Authentication token missing or invalid", success: false },
            { status: 401 }
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token) as JwtPayload; // Verify and decode the token

        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Clone the request and attach userId to it (Next.js requests are immutable)
        req.headers.set("x-user-id", decoded.userId);

        return NextResponse.next(); // Allow the request to proceed
    } catch (error) {
        console.error("JWT Middleware Error:", error);

        if (error instanceof TokenExpiredError) {
            return NextResponse.json({ error: "Token expired" }, { status: 403 });
        } else if (error instanceof JsonWebTokenError) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        return NextResponse.json({ error: "Authentication error" }, { status: 500 });
    }
}
