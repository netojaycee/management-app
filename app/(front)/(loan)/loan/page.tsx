"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loanRequestSchema } from "@/lib/zodSchema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useApproveLoanMutation,
  useGetLoanHistoryQuery,
  useRepayLoanMutation,
  useRequestLoanMutation,
} from "@/redux/appData";
import LoaderDialog from "@/components/local/LoaderDialog";

export default function LoanDashboard() {
  const [pendingLoan, setPendingLoan] = useState<any>(null);
  const [activeLoan, setActiveLoan] = useState<any>(null);

  // Loan request mutation
  const [
    requestLoan,
    {
      isLoading: isRequesting,
      isError: isErrorRequest,
      isSuccess: isSuccessRequest,
      error: errorRequest,
      data: dataRequest,
    },
  ] = useRequestLoanMutation();

  // Loan approval mutation
  const [
    approveLoan,
    {
      isLoading: isApproving,
      isError: isErrorApprove,
      isSuccess: isSuccessApprove,
      error: errorApprove,
    },
  ] = useApproveLoanMutation();

  // Loan repayment mutation
  const [
    repayLoan,
    {
      isLoading: isRepaying,
      isError: isErrorRepay,
      isSuccess: isSuccessRepay,
      error: errorRepay,
    },
  ] = useRepayLoanMutation();

  // Fetch loan history
  const {
    data: loanHistory,
    isLoading: isFetchingLoan,
    isError: isErrorHistory,
    error: errorHistory,
  } = useGetLoanHistoryQuery(undefined);

  // ✅ Unified loading state (if any process is loading)
  const isLoading = isRequesting || isApproving || isRepaying || isFetchingLoan;

  // ✅ Unified error state (if any request fails)
  const isError =
    isErrorRequest || isErrorApprove || isErrorRepay || isErrorHistory;

  // ✅ Collect all error messages for debugging/logging
  const errorMessages = [errorRequest, errorApprove, errorRepay, errorHistory]
    .filter(Boolean) // Remove undefined values
    .map((err) => err?.data?.message || err?.error || "Unknown error"); // Extract error messages

  // ✅ Unified success state (if any request was successful)
  const isSuccess = isSuccessRequest || isSuccessApprove || isSuccessRepay;

  const form = useForm({
    resolver: zodResolver(loanRequestSchema),
    defaultValues: { amount: 0 },
  });

  // Determine the user's loan status dynamically
  useEffect(() => {
    if (loanHistory?.loans) {
      const pending = loanHistory.loans.find(
        (loan) => loan.status === "PENDING"
      );
      const active = loanHistory.loans.find((loan) => loan.status === "ACTIVE");

      setPendingLoan(pending || null);
      setActiveLoan(active || null);
    }
  }, [loanHistory]);

  const onSubmit = async (values: { amount: number }) => {
    // setGlobalError("");
    try {
      // console.log(values);
      await requestLoan(values);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ||
        "An unexpected error occurred.";
      toast.error(message);
      // setGlobalError(message);
      console.error("An error occurred:", error);
    }
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast.success("Action completed successfully! 🎉");
    }

    if (isError) {
      const errorMessage =
        errorMessages.length > 0
          ? errorMessages[0]
          : "An unexpected error occurred.";
      toast.error(errorMessage);
    }
  }, [
    isSuccess,
    isError,
    loanHistory,
    errorMessages,
    isSuccessRequest,
    dataRequest,
  ]);

  return (
    <div className='mx-auto py-10 w-full max-w-2xl'>
      <LoaderDialog isLoading={isLoading} />
      <h1 className='text-2xl font-bold mb-5'>Loan Dashboard</h1>

      {/* Loan Request Form */}
      {!pendingLoan && !activeLoan ? (
        <Card>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold mb-4'>Request a Loan</h2>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='p-3 md:p-4'
              >
                <div className='flex flex-col gap-2'>
                  <div className='grid gap-2'>
                    <FormField
                      control={form.control}
                      name='amount'
                      render={({ field }) => (
                        <FormItem className='grid gap-1'>
                          <FormLabel htmlFor='amount'>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              placeholder='Enter loan amount'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <Loader2 className='animate-spin h-4 w-4 mr-2' />
                    ) : (
                      "Request Loan"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : null}

      {/* Pending Loan Screen */}
      {pendingLoan && (
        <Card>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold'>Loan Offer</h2>
            <p>
              Approved Amount:{" "}
              <strong>₦{pendingLoan.approvedAmount.toLocaleString()}</strong>
            </p>
            <p>
              Interest Rate:{" "}
              <strong>{(pendingLoan.interestRate * 100).toFixed(2)}%</strong>
            </p>
            <p>
              Total Payable:{" "}
              <strong>₦{pendingLoan.totalPayable.toLocaleString()}</strong>
            </p>
            <p>
              Repayment Date:{" "}
              <strong>
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                }).format(new Date(pendingLoan.dueDate))}
              </strong>
            </p>
            <Button
              onClick={async () =>
                await approveLoan({ loanId: pendingLoan.id })
              }
              className='mt-4 w-full'
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className='animate-spin h-4 w-4 mr-2' />
              ) : (
                "Accept Loan"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loan Repayment Section */}
      {activeLoan && (
        <Card className='mt-6'>
          <CardContent className='p-6'>
            <h2 className='text-xl font-semibold'>Repay Loan</h2>
            <p>
              Amount Due:{" "}
              <strong>₦{activeLoan.totalPayable.toLocaleString()}</strong>
            </p>
            <p>
              Bank Account: <strong>1234567890 (Bank XYZ)</strong>
            </p>
            <Button
              onClick={async () => await repayLoan(undefined)}
              className='mt-4 w-full'
              disabled={isRepaying}
            >
              {isRepaying ? (
                <Loader2 className='animate-spin h-4 w-4 mr-2' />
              ) : (
                "Mark as Paid"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loan History Table */}
      <Card className='mt-6'>
        <CardContent className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>Loan History</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Amount</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Total Payable</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Repayment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loanHistory &&
                loanHistory?.loans?.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>₦{loan.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {(loan.interestRate * 100).toFixed(2)}%
                    </TableCell>
                    <TableCell>₦{loan.totalPayable.toLocaleString()}</TableCell>
                    <TableCell>{loan.status}</TableCell>
                    <TableCell>
                      {loan.dueDate
                        ? new Date(loan.dueDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
