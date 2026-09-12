import axiosInstance from "../api/axiosInstance";

export const forgotPassword = async (data) => {
    const response = await axiosInstance.post(
        "/auth/forgot-password/",
        data
    );

    return response.data;
};

export const verifyForgotOTP = async (data) => {
    const response = await axiosInstance.post(
        "/auth/verify-forgot-otp/",
        data
    );

    return response.data;
};

export const resetPassword = async (data) => {
    const response = await axiosInstance.post(
        "/auth/reset-password/",
        data
    );

    return response.data;
};