import { getAccessToken, saveAccessToken } from "@/hooks/cookieService";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base Query with Authentication Headers
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers) => {
    const access_token = getAccessToken();
    if (access_token && access_token !== "undefined") {
      headers.set("Authorization", `Bearer ${access_token}`);
    }
    // headers.set("Content-Type", "application/json");
    return headers;
  },
});

// RTK Query API Setup
export const loanApi = createApi({
  reducerPath: "loanApi",
  baseQuery,
  tagTypes: ["Loan"], // Auto-refresh UI when loan data changes
  endpoints: (builder) => ({
    // User Registration
    register: builder.mutation({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
    }),

    // User Login
    login: builder.mutation({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const data = await queryFulfilled;
          console.log("f", data);
          saveAccessToken(data.data.token);
        } catch (error) {
          console.error("❌ Error plogging in:", error);
        }
      },
    }),

    // Loan Request
    requestLoan: builder.mutation({
      query: (data) => ({
        url: "/loan/request",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Loan"], // Refresh loan history after request
    }),

    // Approve Loan
    approveLoan: builder.mutation({
      query: (data) => ({
        url: "/loan/approve",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Loan"], // Refresh UI after approval
    }),

    // Repay Loan
    repayLoan: builder.mutation({
      query: () => ({
        url: "/loan/repay",
        method: "POST",
        // body: data,
      }),
      invalidatesTags: ["Loan"], // Refresh UI after repayment

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data: repaymentDetails } = await queryFulfilled;

          // ✅ Extract the response to create webhook payload
          const webhookPayload = {
            transactionId: repaymentDetails.transactionId, // Generate unique transaction ID
            amount: repaymentDetails.amountToPay, // Use amount from repay response
            reference: repaymentDetails.reference, // Unique reference
            status: "successful", // Mocking successful status
          };

          // ✅ Automatically trigger the repayment webhook
          dispatch(
            loanApi.endpoints.sendRepaymentWebhook.initiate(webhookPayload)
          );
        } catch (error) {
          console.error("❌ Error processing repayment webhook:", error);
        }
      },
    }),

    // Fetch Loan History
    getLoanHistory: builder.query({
      query: () => ({
        url: "/loan/history",
        method: "GET",
      }),
      providesTags: ["Loan"],
    }),

    // Fetch Repayment Details (Account Info)
    getRepaymentDetails: builder.query({
      query: () => ({
        url: "/loan/repayment-details",
        method: "GET",
      }),
      providesTags: ["Loan"],
    }),

    // Send Repayment Webhook
    sendRepaymentWebhook: builder.mutation({
      query: (data) => ({
        url: "/loan/repayment-webhook",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Loan"],
    }),
    submitKYC: builder.mutation({
      query: (data) => ({
        url: "/kyc",
        method: "POST",
        body: data,
        headers: {},
      }),
    }),
  }),
});

// Export Hooks
export const {
  useRegisterMutation,
  useLoginMutation,
  useRequestLoanMutation,
  useApproveLoanMutation,
  useRepayLoanMutation,
  useGetLoanHistoryQuery,
  useGetRepaymentDetailsQuery,
  useSendRepaymentWebhookMutation,
  useSubmitKYCMutation,
} = loanApi;
