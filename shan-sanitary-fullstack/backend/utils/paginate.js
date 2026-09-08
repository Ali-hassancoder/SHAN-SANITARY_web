export const getaPagination = (query) => {
    const page = math.max(parseInt(query.page) || 1, 1); 

    const limit = Math.min(Math.max(parseInt(query.limit) || 20, 1), 100);
    const skip = (page - 1 ) * limit; 
    return { page, limit, skip }; 
};

export const buildPaginationMeta = (total, page, limit) => ({
    total, 
    page, 
    pages: Math.max(Math.ceil(total / limit), 1),
    limit, 
});