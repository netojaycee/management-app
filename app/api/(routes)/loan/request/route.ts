import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import dayjs from "dayjs";
import { middleware } from '@/app/api/middlewares/handler';
import { jwtMiddleware } from '@/app/api/middlewares/jwtMiddleware';
import { logAction } from '../../logs/route';

// Loan eligibility function
const checkEligibility = async (userId: string, requestedAmount: number) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return { eligible: false, message: "User not found", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }
    if (!user.kycVerified) {
        return { eligible: false, message: "KYC verification is required", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    // Check if the user has an active loan
    const activeLoan = await prisma.loan.findFirst({
        where: { userId, status: { in: ["PENDING", "ACTIVE"] } },
    });

    if (activeLoan) {
        return { eligible: false, message: "You must repay your current loan before requesting another", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }
    // Credit Score-based Loan Decision
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
    }
    else if (user.creditScore >= 250) {
        approvedAmount = Math.min(requestedAmount, 10000); // Cap at ₦50,000
        interestRate = 0.16;
    } else {
        return { eligible: false, message: "Not eligible for a loan at this time", approvedAmount: 0, interestRate: 0, totalPayable: 0, dueDate: new Date() };
    }

    // Calculate total payable amount
    const totalPayable = approvedAmount + (approvedAmount * interestRate);
    const dueDate = dayjs().add(30, "days").toDate(); // Due in 30 days

    return { eligible: true, approvedAmount, interestRate, totalPayable, dueDate };
};

// Loan request handler
const requestLoan = async (req: Request) => {
    try {
        const { amount } = await req.json();
        const { userId } = req; // Extracted from JWT middleware

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid loan amount." }, { status: 400 });
        }
        if (userId === undefined) return NextResponse.json({ error: "Invalid user ID." }, { status: 400 });
        // Check user's loan eligibility
        const result = await checkEligibility(userId, amount);
        if (!result.eligible) return NextResponse.json({ error: result.message }, { status: 400 });

        // Save loan request in database
        const loan = await prisma.loan.create({
            data: {
                userId,
                amount,
                approvedAmount: result.approvedAmount as number, // ✅ Force TypeScript to treat it as number
                interestRate: result.interestRate as number,
                totalPayable: result.totalPayable as number,
                dueDate: result.dueDate as Date,
                status: "PENDING",
                currency: "NGN",
            },
        });

        // Log the loan request action
        await logAction(userId, "Requested a loan", `Loan of ₦${amount} requested`);

        return NextResponse.json({ message: "Loan request submitted successfully", loan }, { status: 201 });

    } catch (error) {
        console.error("Error requesting loan:", error);
        return NextResponse.json({ error: "Failed to process loan request" }, { status: 500 });
    }
};

// Apply middleware
const requestLoanHandler = middleware(jwtMiddleware, requestLoan); // Requires authentication

export { requestLoanHandler as POST };
