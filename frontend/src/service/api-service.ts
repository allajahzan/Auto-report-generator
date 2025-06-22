import axiosInstance from "./axios-instance";

// To fetch data
export const fetchData = async (url: string) => {
    try {
        const resp = await axiosInstance.get(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return resp;
    } catch (err: unknown) {
        throw err;
    }
};

// To post data
export const postData = async (url: string, data: any) => {
    try {
        const resp = await axiosInstance.post(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return resp;
    } catch (err: unknown) {
        throw err;
    }
};

// To update data
export const updateData = async (url: string, data: any) => {
    try {
        const resp = await axiosInstance.put(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return resp;
    } catch (err: unknown) {
        throw err;
    }
};

// To patch data
export const patchData = async (url: string, data: any) => {
    try {
        const resp = await axiosInstance.patch(url, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return resp;
    } catch (err: unknown) {
        throw err;
    }
};

// To delete data
export const deleteData = async (url: string) => {
    try {
        const resp = await axiosInstance.delete(url, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return resp;
    } catch (err: unknown) {
        throw err;
    }
};
