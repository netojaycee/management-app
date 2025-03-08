import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";

// ✅ Mock Mono API function to get virtual account for loan repayment
async function getVirtualAccount(userId: string) {
    return {
        bankName: "Mono Bank",
        accountNumber: "1234567890",
        accountName: "Jaycee Loan Bank",
        reference: `loan_repay_${userId}_${Date.now()}`,
    };
}

// ✅ POST Route (Get Loan Repayment Details) - Requires authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return authentication error if unauthorized
    }

    try {
        const userId = req.headers.get("x-user-id"); // Extract authenticated user ID

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

        // Get user's active loan
        const loan = await prisma.loan.findFirst({
            where: { userId, status: "ACTIVE" },
        });

        if (!loan) {
            return NextResponse.json({ error: "No active loan found" }, { status: 404 });
        }

        // Fetch payment details (Mocked from Mono API)
        const paymentDetails = await getVirtualAccount(userId);

        return NextResponse.json({
            message: "Loan repayment details",
            bankName: paymentDetails.bankName,
            accountNumber: paymentDetails.accountNumber,
            accountName: paymentDetails.accountName,
            amountToPay: loan.totalPayable,
            reference: paymentDetails.reference,
            transactionId: `txn_${Date.now()}`,
        }, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching repayment details:", error);
        return NextResponse.json({ error: `Failed to fetch repayment details: ${error}` }, { status: 500 });
    }
}
