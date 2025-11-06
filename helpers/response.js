export const success = (res, data, message = "OK", code = 200) => {
    console.log(`[SUCCESS] ${code} - ${message}`);
    if (data) console.log(" → Data:", data);

    return res.status(code).json({
        success: true,
        code,
        message,
        data,
    });
};

export const error = (res, message = "Something went wrong", code = 500) => {
    console.error(`[ERROR] ${code} - ${message}`);

    return res.status(code).json({
        success: false,
        code,
        message,
    });
};
