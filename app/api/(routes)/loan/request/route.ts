import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { jwtMiddleware } from "@/app/api/middlewares/jwtMiddleware";
import { logAction } from "../../../utils/logAction";

// ✅ Loan eligibility function
const checkEligibility = async (userId: string, requestedAmount: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return { eligible: false, message: "User not found", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    if (!user.kycVerified) {
        return { eligible: false, message: "KYC verification is required", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    // ✅ Check if the user has an active loan
    const activeLoan = await prisma.loan.findFirst({
        where: { userId, status: { in: ["PENDING", "ACTIVE"] } },
    });

    if (activeLoan) {
        return { eligible: false, message: "You must repay your current loan before requesting another", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    // ✅ Credit Score-based Loan Decision
    let approvedAmount = 0;
    let interestRate = 0.15; // Default high-interest rate

    if (user.creditScore >= 750) {
        approvedAmount = requestedAmount;
        interestRate = 0.05; // Low interest for high credit score
    } else if (user.creditScore >= 600) {
        approvedAmount = Math.min(requestedAmount, 200000); // Cap at ₦200,000
        interestRate = 0.08;
    } else if (user.creditScore >= 400) {
        approvedAmount = Math.min(requestedAmount, 50000); // Cap at ₦50,000
        interestRate = 0.12;
    } else if (user.creditScore >= 250) {
        approvedAmount = Math.min(requestedAmount, 10000); // Cap at ₦10,000
        interestRate = 0.16;
    } else {
        return { eligible: false, message: "Not eligible for a loan at this time", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    // ✅ Calculate total payable amount
    const totalPayable = approvedAmount + (approvedAmount * interestRate);
    const dueDate = dayjs().add(30, "days").toDate(); // Due in 30 days

    return { eligible: true, approvedAmount, interestRate, totalPayable, dueDate };
};

// ✅ Loan request handler
export async function POST(req: NextRequest) {
    try {
        // Apply JWT authentication middleware
        const authResponse = await jwtMiddleware(req);
        if (authResponse.status === 401 || authResponse.status === 403) {
            return authResponse; // Return the corresponding error response
        }

        const { amount } = await req.json();
        const userId = req.headers.get("x-user-id"); // Extract userId from middleware

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid loan amount." }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
        }

        // ✅ Check user's loan eligibility
        const result = await checkEligibility(userId, amount);
        if (!result.eligible) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        // ✅ Save loan request in the database
        const loan = await prisma.loan.create({
            data: {
                userId,
                amount,
                approvedAmount: result.approvedAmount,
                interestRate: result.interestRate,
                totalPayable: result.totalPayable,
                dueDate: result.dueDate,
                status: "PENDING",
                currency: "NGN",
            },
        });

        // ✅ Log the loan request action
        await logAction(userId, "Requested a loan", `Loan of ₦${amount} requested`);

        return NextResponse.json({ message: "Loan request submitted successfully", loan }, { status: 201 });

    } catch (error) {
        console.error("❌ Error requesting loan:", error);
        return NextResponse.json({ error: `Failed to process loan request: ${error}` }, { status: 500 });
    }
}
