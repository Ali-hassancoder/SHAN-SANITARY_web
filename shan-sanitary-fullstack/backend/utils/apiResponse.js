export const success = (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
        success: true, 
        message, 
        data, 
    }); 
}; 

export const fail = (res, statusCode, message, error = null) => {
    return res.status(statusCode).json({
        success: true,
        message, 
        data,
    });
};

