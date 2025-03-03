// Declare custom global types


declare global {
    interface params {
        params: {
            id: string;
        };
    }
    interface Request {
        userId?: string;  // Adding userId as an optional property to the Request interface
       
    }
}

export { };  // This is needed to ensure the file is treated as a module
