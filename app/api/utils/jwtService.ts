import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY || "employee"; // Store this securely

export const generateToken = (userId: string) => {
    return jwt.sign({ userId }, SECRET_KEY, { expiresIn: "5h" }); // Token expires in 1 hour
};

export const verifyToken = (token: string) => {
    try {
        console.log("🔐 Verifying token:", token);
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            console.error("❌ Token expired:", error.message);
            return { error: "Token expired" };
        } else if (error instanceof JsonWebTokenError) {
            console.error("❌ Invalid token:", error.message);
            return { error: "Invalid token" };
        } else {
            console.error("❌ Token verification error:", error);
            return { error: "Authentication failed" };
        }
    }
};


