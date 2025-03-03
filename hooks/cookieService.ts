import cookie from "cookie";

/**
 * Get the access token from cookies (Client-Side Only)
 */
export const getAccessToken = (): string | undefined => {
    if (typeof window === "undefined") return undefined; // Prevent SSR errors

    const cookies = cookie.parse(document.cookie);
    return cookies.auth_token;
};

/**
 * Save the access token in cookies (Client-Side Only)
 */
export const saveAccessToken = (token: string) => {
    if (typeof window !== "undefined") {
        document.cookie = `auth_token=${token}; path=/; secure; samesite=strict`;
    }
};

/**
 * Remove the access token from cookies (Client-Side Only)
 */
export const removeAccessToken = () => {
    if (typeof window !== "undefined") {
        document.cookie = "auth_token=; path=/; secure; samesite=strict; max-age=0";
    }
};
