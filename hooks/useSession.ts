import { useEffect, useState } from "react";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "@/app/api/utils/jwtService"; // Assuming you already have this function
import { getAccessToken } from "./cookieService";

export const useSession = () => {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const token = getAccessToken();

        if (token) {
            try {
                const decoded = verifyToken(token) as JwtPayload; // Type assertion here
                if (decoded && decoded.userId) {
                    setSession({ userId: decoded.userId });
                } else {
                    setSession(null); // Invalid or expired token
                }
            } catch (error) {
                console.log("Session generation failed", error);
                setSession(null); // Handle error
            }
        } else {
            setSession(null); // No token
        }
    }, []);

    return session;
};
