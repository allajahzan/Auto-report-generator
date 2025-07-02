// Error handler
export const errorHandler = (
    error: any,
    notify: (msg: string) => void,
    setConnection: (value: boolean) => void,
    clearAuth: () => void
) => {
    const message =
        error?.response?.data?.errors?.message || "Something went wrong";
    const status = error?.status || error?.response?.status;

    if (status === 403) {
        notify("Connection to Report Buddy is lost ⛓️‍💥");
        localStorage.removeItem("connection");
        setConnection(false);
    } else if (status === 401) {
        notify("You are not authorized to access this page 🚫");
        clearAuth();
    } else if (status >= 400 && status < 500) {
        notify(`${message} 🤥`);
    } else {
        notify("Something went wrong, try again later 🤥");
    }
};
