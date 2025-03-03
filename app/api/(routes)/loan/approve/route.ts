import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { middleware } from "@/app/api/middlewares/handler";
import { LoanStatus } from "@prisma/client";

// Mock function for Mono API fund disbursement
async function disburseFunds(userId: string, amount: number) {
    // Integrate with Mono API for real fund disbursement
    console.log(`✅ Disbursing ${amount} NGN to user ${userId}`);
    return { success: true, transactionId: `txn_${Date.now()}` };
}

const approveLoan = async (req: Request) => {
    try {
        const { loanId } = await req.json();
        const { userId } = req as any;

        if (!loanId) {
            return NextResponse.json({ error: "Loan ID is required" }, { status: 400 });
        }

        // Fetch loan details
        const loan = await prisma.loan.findUnique({
            where: { id: loanId, userId },
        });

        if (!loan) {
            return NextResponse.json({ error: "Loan not found or not associated with user" }, { status: 404 });
        }

        if (loan.status !== "PENDING") {
            return NextResponse.json({ error: "Only pending loans can be approved" }, { status: 400 });
        }

        // Disburse Funds via Mono API
        const disbursement = await disburseFunds(userId, loan.approvedAmount);
        if (!disbursement.success) {
            return NextResponse.json({ error: "Failed to disburse funds" }, { status: 500 });
        }

        // Mark Loan as Active
        await prisma.loan.update({
            where: { id: loanId },
            data: {
                status: LoanStatus.ACTIVE,
            },
        });

        return NextResponse.json({ message: "Loan approved and funds disbursed", transactionId: disbursement.transactionId }, { status: 200 });

    } catch (error) {
        console.error("❌ Loan Approval Error:", error);
        return NextResponse.json({ error: "Failed to approve loan" }, { status: 500 });
    }
};

// Apply Authentication Middleware
const approveLoanHandler = middleware(jwtMiddleware, approveLoan);
export { approveLoanHandler as POST };
