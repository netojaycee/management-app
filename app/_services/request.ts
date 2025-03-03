import axios, { AxiosRequestConfig, AxiosError } from 'axios';

interface IAxiosParam {
    baseURL: string;
    url: string;
    method: AxiosRequestConfig['method'];
    data?: AxiosRequestConfig['data']
    params?: AxiosRequestConfig['params']
}


export const axiosInstance = axios.create({
    timeout: 20000,
    headers: {
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNDkxMjdjMi0xNTE2LTQ5MDgtODM3Ny04ODdlMTVhY2JkMmQiLCJpYXQiOjE3NDEwMDY5MTcsImV4cCI6MTc0MTAxMDUxN30.GARBP8T0A_TGpEodE1qOM2UX19tYWG6MtzA82_u4bUM`
    }
});

axiosInstance.interceptors.request.use(
    request => {
        return request;
    },
    error => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

export const axiosBaseQuery = async (axiosParams: IAxiosParam) => {
    try {
        const result = await axiosInstance(axiosParams);

        return result.data;
    } catch (axiosError) {
        const err = axiosError as AxiosError;

        return Promise.reject({
            status: err.response?.status,
            data: err.response?.data || err.message
        });
    }
};
