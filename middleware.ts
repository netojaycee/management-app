"use server";
import { NextResponse, NextRequest } from "next/server";

const authPages = ["/register", "/login"]; // Only accessible when NOT logged in
const protectedPaths = [/^\/(\/.*)?$/, /^\/kyc(\/.*)?$/, /^\/loan(\/.*)?$/];

export async function middleware(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value; // Get the auth token
    // const userCookie = request.cookies.get("user")?.value;

    // Helper function to check if token is valid
    const isTokenValid = (token: string | undefined) => token && token !== "undefined";

    // Check if the current path is an authentication page
    const isAuthPage = authPages.includes(request.nextUrl.pathname);

    

    // 🚫 If NOT authenticated and accessing a protected page → Redirect to login
    const isProtected = protectedPaths.some((path) => path.test(request.nextUrl.pathname));
    if (!isTokenValid(token) && isProtected) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", request.nextUrl.pathname); // Store original path for redirection
        return NextResponse.redirect(url);
    }

    // 🚫 If authenticated and trying to access login/register → Redirect to KYC/Home
    if (isTokenValid(token) && isAuthPage) {
        const destination = "/";
        return NextResponse.redirect(new URL(destination, request.url));
    }



    return NextResponse.next(); // ✅ Allow access if none of the conditions match
}

// Middleware config
export const config = {
    matcher: [
        "/",
        "/register",
        "/login",
        "/loan/:path*",

    ],
};
