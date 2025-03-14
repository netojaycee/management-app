// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
// import { middleware } from "@/app/api/middlewares/handler";
// import { KycStatus } from "@prisma/client";
// import https from "https";

// // IDAnalyzer API Credentials
// const ID_ANALYZER_API_KEY = process.env.ID_ANALYZER_API_KEY || "";
// const ID_ANALYZER_PROFILE_ID = process.env.ID_ANALYZER_PROFILE_ID || "";

// /**
//  * Encodes an image file into Base64
//  */
// async function encodeFileToBase64(file: File): Promise<string> {
//     const buffer = Buffer.from(await file.arrayBuffer()); // Convert file to Buffer
//     return buffer.toString("base64"); // Convert to Base64
// }

// /**
//  * KYC Verification Endpoint
//  */
// const verifyKYC = async (req: Request) => {
//     try {
//         // Parse FormData (Accept Image Upload)
//         const formData = await req.formData();
//         const file = formData.get("file") as File;
//         const face = formData.get("face") as File;
//         const { userId } = req as any;

//         if (!file || !face) {
//             return NextResponse.json({ error: "Both document and face images are required." }, { status: 400 });
//         }

//         console.log("🔍 Processing KYC for User:", userId);

//         // Convert Image to Base64
//         const DOCUMENT_BASE64 = await encodeFileToBase64(file);
//         const FACE_BASE64 = await encodeFileToBase64(face);

//         // Build API Payload
//         const payload = JSON.stringify({
//             profile: ID_ANALYZER_PROFILE_ID,
//             document: DOCUMENT_BASE64,
//             face: FACE_BASE64,
//         });

//         // Set HTTPS Request Options
//         const options = {
//             hostname: "api2.idanalyzer.com",
//             port: 443,
//             path: "/scan",
//             method: "POST",
//             headers: {
//                 "X-API-KEY": ID_ANALYZER_API_KEY,
//                 "Accept": "application/json",
//                 "Content-Type": "application/json",
//                 "Content-Length": Buffer.byteLength(payload),
//             },
//         };

//         // Send API Request
//         const response = await new Promise<any>((resolve, reject) => {
//             const req = https.request(options, (res: any) => {
//                 let data = "";
//                 res.on("data", (chunk: any) => {
//                     data += chunk;
//                 });
//                 res.on("end", () => resolve(JSON.parse(data)));
//             });

//             req.on("error", (error: any) => reject(error));
//             req.write(payload);
//             req.end();
//         });

//         // console.log("✅ IDAnalyzer Response:", response);

//         // Handle Verification Response
//         if (!response || response.error) {
//             return NextResponse.json({ error: "KYC verification failed", details: response }, { status: 400 });
//         }

//         const { decision, transactionId, warning } = response;

//         // If KYC is accepted
//         if (decision === "accept") {
//             await prisma.user.update({
//                 where: { id: userId },
//                 data: {
//                     kycVerified: true,
//                     kycStatus: KycStatus.VERIFIED,
//                     kycDocument: transactionId || "No ID found",
//                 },
//             });

//             return NextResponse.json({
//                 message: "✅ KYC verification successful! Your identity has been verified.",
//                 status: "VERIFIED",
//             }, { status: 200 });

//             // If KYC is rejected
//         } else if (decision === "reject") {
//             const reasons = warning?.map((w: any) => `${w.code}: ${w.description}`).join(", ") || "Unknown reason";

//             await prisma.user.update({
//                 where: { id: userId },
//                 data: {
//                     kycVerified: false,
//                     kycStatus: KycStatus.FAILED,
//                     kycDocument: transactionId || "No ID found",
//                 },
//             });

//             return NextResponse.json({
//                 error: "❌ KYC verification failed.",
//                 details: `Your verification was rejected due to the following reason(s): ${reasons}`,
//                 status: "FAILED",
//             }, { status: 400 });

//             // If KYC needs manual review (commented out)
//             // } else if (decision === "review") {
//             //     await prisma.user.update({
//             //         where: { id: userId },
//             //         data: {
//             //             kycVerified: false,
//             //             kycStatus: KycStatus.PENDING,
//             //             kycDocument: transactionId || "No ID found",
//             //         },
//             //     });

//             //     return NextResponse.json({
//             //         message: "⚠️ KYC verification requires manual review. Please wait for an update.",
//             //         status: "PENDING",
//             //     }, { status: 202 });
//         }

//         return NextResponse.json({
//             error: "Unexpected response from IDAnalyzer.",
//             status: "FAILED",
//         }, { status: 500 });

//     } catch (error) {
//         console.error("❌ KYC Verification Error:", error);
//         return NextResponse.json({ error: "Failed to verify KYC" }, { status: 500 });
//     }
// };

// // Apply Authentication Middleware
// const verifyKYCHandler = middleware(jwtMiddleware, verifyKYC);
// export { verifyKYCHandler as POST };


import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import https from "https";

// ✅ IDAnalyzer API Credentials
const ID_ANALYZER_API_KEY = process.env.ID_ANALYZER_API_KEY || "";
const ID_ANALYZER_PROFILE_ID = process.env.ID_ANALYZER_PROFILE_ID || "";

/**
 * Encodes an image file into Base64 format.
 */
async function encodeFileToBase64(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer()); // Convert file to Buffer
    return buffer.toString("base64"); // Convert to Base64
}

/**
 * ✅ **KYC Verification API**
 */
export async function POST(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return authentication error response
    }

    try {
        // Parse FormData (Accept Image Upload)
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const face = formData.get("face") as File;
        const userId = req.headers.get("x-user-id") ?? undefined; // Fix here

        if (!userId) {
            return NextResponse.json({ error: "User ID is missing" }, { status: 400 });
        }

        if (!file || !face) {
            return NextResponse.json(
                { error: "Both document and face images are required." },
                { status: 400 }
            );
        }

        console.log("🔍 Processing KYC for User:", userId);

        // Convert images to Base64
        const DOCUMENT_BASE64 = await encodeFileToBase64(file);
        const FACE_BASE64 = await encodeFileToBase64(face);

        // Build API Payload
        const payload = JSON.stringify({
            profile: ID_ANALYZER_PROFILE_ID,
            document: DOCUMENT_BASE64,
            face: FACE_BASE64,
        });

        // Set HTTPS Request Options
        const options = {
            hostname: "api2.idanalyzer.com",
            port: 443,
            path: "/scan",
            method: "POST",
            headers: {
                "X-API-KEY": ID_ANALYZER_API_KEY,
                Accept: "application/json",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
            },
        };

        // Send API Request
        const response = await new Promise<any>((resolve, reject) => {
            const request = https.request(options, (res) => {
                let data = "";
                res.on("data", (chunk) => (data += chunk));
                res.on("end", () => resolve(JSON.parse(data)));
            });

            request.on("error", (error) => reject(error));
            request.write(payload);
            request.end();
        });

        // Handle Verification Response
        if (!response || response.error) {
            return NextResponse.json(
                { error: "KYC verification failed", details: response },
                { status: 400 }
            );
        }

        const { decision, transactionId, warning } = response;

        if (decision === "accept") {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    kycVerified: true,
                    kycStatus: "VERIFIED",
                    kycDocument: transactionId || "No ID found",
                },
            });

            return NextResponse.json(
                {
                    message: "✅ KYC verification successful! Your identity has been verified.",
                    status: "VERIFIED",
                },
                { status: 200 }
            );
        } else if (decision === "reject") {
            const reasons =
                warning?.map((w: any) => `${w.code}: ${w.description}`).join(", ") || "Unknown reason";

            await prisma.user.update({
                where: { id: userId },
                data: {
                    kycVerified: false,
                    kycStatus: "FAILED",
                    kycDocument: transactionId || "No ID found",
                },
            });

            return NextResponse.json(
                {
                    error: "❌ KYC verification failed.",
                    details: `Your verification was rejected due to: ${reasons}`,
                    status: "FAILED",
                },
                { status: 400 }
            );
        }
        else if (decision === "review") {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    kycVerified: false,
                    kycStatus: "FAILED",
                    kycDocument: transactionId || "No ID found",
                },
            });

            return NextResponse.json({
                // message: "⚠️ KYC verification requires manual review. Please wait for an update.",
                message: "⚠️ KYC verification Failed.",

                status: "FAILED",
            }, { status: 202 });
        }

        return NextResponse.json(
            { error: "Unexpected response from IDAnalyzer.", status: "FAILED" },
            { status: 500 }
        );
    } catch (error) {
        console.error("❌ KYC Verification Error:", error);
        return NextResponse.json(
            { error: "Failed to verify KYC", details: error },
            { status: 500 }
        );
    }
}
