import { verifyToken } from "../utils/jwtService";
import { JwtPayload } from "jsonwebtoken";
import { NextCustomMiddlewareType } from "./handler";

export const jwtMiddleware: NextCustomMiddlewareType = async (
    req: Request,
    _context: { params?: { [key: string]: string } } = {},
    options?: { next?: () => void }
) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(
            JSON.stringify({
                error: "Authentication token missing or invalid",
                success: false,
            }),
            { status: 401 }
        );
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = verifyToken(token) as JwtPayload; // Verify and decode the token
        (req as any).userId = decoded.userId; // Attach decoded user info to the request
        options?.next?.(); // Proceed to the next middleware
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ error: "Invalid or expired token" }),
            { status: 401 }
        );
    }
};
