// With timeout
export const withTimeout = (
    promise: Promise<any>,
    second: number,
    fallback: any
) : Promise<string> => {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => resolve(fallback), second);

        promise
            .then((data) => {
                clearTimeout(timeout);
                resolve(data);
            })
            .catch((err) => {
                clearTimeout(timeout);
                resolve(fallback);
            });
    });
};
