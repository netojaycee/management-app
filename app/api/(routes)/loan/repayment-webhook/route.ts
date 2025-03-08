import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ POST Route (Handle Loan Repayment Webhook)
export async function POST(req: NextRequest) {
    try {
        const { transactionId, amount, reference, status } = await req.json();

        console.log("🔍 Loan Repayment Webhook Received:", { transactionId, amount, reference, status });

        if (status !== "successful") {
            return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
        }

        // Extract user ID from reference
        const referenceParts = reference.split("_");
        if (referenceParts.length < 3) {
            return NextResponse.json({ error: "Invalid payment reference format" }, { status: 400 });
        }
        const userId = referenceParts[2];

        // Find active loan
        const loan = await prisma.loan.findFirst({
            where: { userId, status: "ACTIVE" },
        });

        if (!loan) {
            return NextResponse.json({ error: "No active loan found for user" }, { status: 404 });
        }

        // Ensure the paid amount is equal to or greater than the total payable
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

        // Calculate if the loan was paid late or on time
        const isLate = new Date() > new Date(loan.dueDate);
        const creditScoreChange = isLate ? -50 : 50;

        // Update user's credit score
        await prisma.user.update({
            where: { id: userId },
            data: {
                creditScore: { increment: creditScoreChange },
            },
        });

        console.log(`✅ Loan repaid successfully. Credit Score ${isLate ? "decreased" : "increased"} by ${creditScoreChange}.`);

        return NextResponse.json({ message: "Loan successfully repaid" }, { status: 200 });

    } catch (error) {
        console.error("❌ Loan Repayment Webhook Error:", error);
        return NextResponse.json({ error: `Failed to process repayment: ${error}` }, { status: 500 });
    }
}
