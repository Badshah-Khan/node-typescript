// get the response function 
export const ReS = (res, data, status) => {
    return res.json({
        success: true,
        data,
        status
    });
};

export const ReE = (res, data, status) => {
    return res.json({
        success: false,
        data,
        status
    });
}
