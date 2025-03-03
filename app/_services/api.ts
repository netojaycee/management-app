
import { saveAccessToken } from "@/hooks/cookieService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation";
import { axiosBaseQuery } from "./request";
import { endpoints } from "./endpoints";
import { ILogin, IRegister } from "@/lib/types";
import { toast } from "sonner";



export const useLoginMutation = () => {
    const queryClient = useQueryClient();

    const router = useRouter();

    return useMutation({
        mutationFn: (data: ILogin) => axiosBaseQuery({ ...endpoints.login, data }),
        onSuccess: (resp) => {
            queryClient.setQueryData(['user'], resp.data);
            toast.success(resp?.message || "Login success.");
console.log(resp)
            saveAccessToken(resp.token);


            router.push('/');
        },
        onError: (error) => {
            console.log(error)
            toast.error(error?.data?.error || "Login failed. Please try again.");
        }
    });
};

export const useRegisterMutation = () => {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: IRegister) => axiosBaseQuery({ ...endpoints.register, data }),  // Assuming you have a `register` endpoint in `endpoints`
        onSuccess: (resp) => {
            queryClient.setQueryData(['user'], resp.data);
            toast.success(resp?.message || "Registration successful!");


            router.push('/login');  // Redirect to home or dashboard after successful registration
        },
        onError: (error) => {
            // Handle error, show error message
            toast.error(error?.data?.error || "Registration failed. Please try again.");
        }
    });
};

// Loan Request Hook
export const useLoanRequest = () => {
    return useMutation({
        mutationFn: (data: { amount: number }) =>
            axiosBaseQuery({ ...endpoints.requestLoan, data }),
        onSuccess: (resp) => {
            console.log(resp)
            toast.success(resp?.data?.message || "Loan request successful!");
        },
        onError: (error) => {
            console.log(error)  
            toast.error(error?.data?.error || "Loan request failed!");
        },
    });
};

// Loan Approval Hook
export const useLoanApprove = () => {
    return useMutation({
        mutationFn: (data: { loanId: string }) =>
            axiosBaseQuery({ ...endpoints.approveLoan, data }),
        onSuccess: (resp) => {
            toast.success(resp?.data?.message || "Loan approved successfully!");
        },
        onError: (error) => {
            toast.error(error?.data?.error || "Loan approval failed!");
        },
    });
};

// Loan Repayment Hook
export const useLoanRepay = () => {
    return useMutation({
        mutationFn: (data: { loanId: string }) =>
            axiosBaseQuery({ ...endpoints.repayLoan, data }),
        onSuccess: (resp) => {
            toast.success(resp?.data?.message || "Loan repaid successfully!");
        },
        onError: (error) => {
            toast.error(error?.data?.error || "Loan repayment failed!");
        },
    });
};

// Loan History Query Hook
export const useLoanHistory = () => {
    return useQuery({
        queryKey: ["loanHistory"],
        queryFn: () => axiosBaseQuery({ ...endpoints.loanHistory }),
    });
};









// // app/_services/api.ts
// import { useMutation, useQuery } from "react-query";
// import axios from "axios";

// // Fetch all permissions
// export const fetchPermissions = async () => {
//     const response = await axios.get("/api/permissions");
//     return response.data;
// };

// // Create permission
// export const createPermission = async (permissionData: { name: string; description?: string }) => {
//     const response = await axios.post("/api/permissions", permissionData);
//     return response.data;
// };

// // Update permission
// export const updatePermission = async (id: string, permissionData: { name: string; description?: string }) => {
//     const response = await axios.put(`/api/permissions/${id}`, permissionData);
//     return response.data;
// };

// // Custom hook for creating permission
// export const useCreatePermissionMutation = () => {
//     return useMutation(createPermission);
// };

// // Custom hook for updating permission
// export const useUpdatePermissionMutation = () => {
//     return useMutation(updatePermission);
// };
