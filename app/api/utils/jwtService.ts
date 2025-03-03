import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "employee"; // Store this securely

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "5h" }); // Token expires in 1 hour
};

export const verifyToken = (token: string) => {
    try {
        console.log("token", token)
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        console.log("verification error", error)
        return null;
    }
};


export const extractUserIdFromRequest = (headers: Record<string, string>) => {
    const token = headers?.Authorization?.split(" ")[1]; // Extract token from "Bearer <token>"

    if (!token) {
        throw new Error("No token provided");
    }

    const decoded = verifyToken(token) as JwtPayload; // Verify token

    if (!decoded) {
        throw new Error("Invalid or expired token");
    }

    return decoded.userId; // Return the userId from the decoded token
};


// export const protectRoute = (req: Request) => {
//     try {
//         const userId = extractUserIdFromRequest(req.headers);

//         // You can add additional checks like checking if the user exists in the database.
//         // If the user is authenticated, continue the request
//         return NextResponse.next();
//     } catch (error) {
//         console.error(error);
//         // If the token is invalid or missing, block the request
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }
// };