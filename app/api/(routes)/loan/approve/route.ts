import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { LoanStatus } from "@prisma/client";
import { logAction } from "../../../utils/logAction";

// ✅ Mock function for Mono API fund disbursement (Replace with actual Mono API integration)
async function disburseFunds(userId: string, amount: number) {
    console.log(`✅ Disbursing ${amount} NGN to user ${userId}`);
    return { success: true, transactionId: `txn_${Date.now()}` };
}

// ✅ POST Route (Approve Loan) - Requires authentication
export async function POST(req: NextRequest) {
    // Apply JWT authentication middleware
    const authResponse = await jwtMiddleware(req);
    if (authResponse.status === 401 || authResponse.status === 403) {
        return authResponse; // Return the corresponding error response
    }

    try {
        const { loanId } = await req.json();
        const userId = req.headers.get("x-user-id"); // Extract the authenticated user ID
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized - User ID missing" }, { status: 401 });
        }

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
        const updatedLoan = await prisma.loan.update({
            where: { id: loanId },
            data: { status: LoanStatus.ACTIVE },
        });

        // Ensure userId exists before logging
       

        // Log the loan approval action
        await logAction(userId, "Approved Loan", `Loan ${loanId} approved & disbursed`);

        return NextResponse.json(
            {
                message: "✅ Loan approved and funds disbursed",
                transactionId: disbursement.transactionId,
                updatedLoan,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("❌ Loan Approval Error:", error);
        return NextResponse.json({ error: `Failed to approve loan: ${error}` }, { status: 500 });
    }
}
