import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const handleLoanRepaymentWebhook = async (req: Request) => {
    try {
        const { transactionId, amount, reference, status } = await req.json();

        console.log("🔍 Loan Repayment Webhook Received:", { transactionId, amount, reference, status });

        if (status !== "successful") {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        // Extract user ID from reference
        const userId = reference.split("_")[2];

        // Find active loan
        const loan = await prisma.loan.findFirst({
            where: { userId, status: "ACTIVE" },
        });

        if (!loan) {
            return NextResponse.json({ error: "No active loan found for user" }, { status: 404 });
        }

        // Check if the amount paid matches the loan amount
        if (amount < loan.totalPayable) {
            return NextResponse.json({ error: "Insufficient payment amount" }, { status: 400 });
        }

        // Update loan status to REPAID
        await prisma.loan.update({
            where: { id: loan.id },
            data: {
                status: "REPAID",
                paidAt: new Date(),
            },
        });

        // Update credit score (+50 for on-time, -50 for late)
        const isLate = new Date() > new Date(loan.dueDate);
        await prisma.user.update({
            where: { id: userId },
            data: {
                creditScore: { increment: isLate ? -50 : 50 },
            },
        });

        return NextResponse.json({ message: "Loan successfully repaid" }, { status: 200 });

    } catch (error) {
        console.error("❌ Loan Repayment Webhook Error:", error);
        return NextResponse.json({ error: "Failed to process repayment" }, { status: 500 });
    }
};

export { handleLoanRepaymentWebhook as POST };
