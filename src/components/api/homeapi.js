import axiosInstance from "../../api/axiosInstance";

export const getHomePage = async () => {

    const response = await axiosInstance.get(
        "/auth/home/"
    );

    return response.data;

};


