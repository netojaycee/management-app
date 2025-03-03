import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { middleware } from "@/app/api/middlewares/handler";

// Mock Mono API function to get virtual account for loan repayment
async function getVirtualAccount(userId: string) {
    return {
        bankName: "Mono Bank",
        accountNumber: "1234567890",
        accountName: "Jaycee Loan Bank",
        reference: `loan_repay_${userId}_${Date.now()}`,
    };
}

const getRepaymentDetails = async (req: Request) => {
    try {
        const { userId } = req as any;

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
        return NextResponse.json({ error: "Failed to fetch repayment details" }, { status: 500 });
    }
};

// Apply Authentication Middleware
const getRepaymentDetailsHandler = middleware(jwtMiddleware, getRepaymentDetails);
export { getRepaymentDetailsHandler as POST };
