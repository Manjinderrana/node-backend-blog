export interface CustomError extends Error {
    status?: number;
    data?: any;
    err?: any
}

