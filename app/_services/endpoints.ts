const baseUrls = {
    employee: process.env.EMPLOYEE_BASE_URL || "/api", // Make sure this is set correctly in your .env file
};

export const endpoints = {
    login: {
        baseURL: baseUrls.employee,
        url: '/login',
        method: 'post',
    },
    register: {
        baseURL: baseUrls.employee,
        url: '/register',
        method: 'post',
    },
    requestLoan: {
        baseURL: baseUrls.employee,
        url: "/loan/request",
        method: "post",
    },
    approveLoan: {
        baseURL: baseUrls.employee,
        url: "/loan/approve",
        method: "post",
    },
    repayLoan: {
        baseURL: baseUrls.employee,
        url: "/loan/repay",
        method: "post",
    },
    loanHistory: {
        baseURL: baseUrls.employee,
        url: "/loan/history",
        method: "get",
    },
    // Uncomment and adapt other endpoints as needed
    // getMembers: (page: number, limit: number) => ({
    //     baseURL: baseUrls.afmMembers,
    //     url: `/api/v2/user?page=${page}&limit=${limit}`,
    //     method: 'get',
    // }),
    // getAdmins: (page: number, limit: number) => ({
    //     url: `/api/v1/admin?page=${page}&limit=${limit}`,
    //     method: 'get',
    // }),
};
