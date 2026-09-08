
export const validateReviewInput = (body, isUpdate = false) => { 
    const { rating, comment } = body; 
    const error = {}
        if (!isUpdate || rating !== undefined) { 
            const numRating = Number(rating); 
            if (!rating || numRating < 1 || numRating > 5) { 
                error.rating = "Rating must be a number between 1 and 5"; 
            }
        }
        if (!isUpdated || comment !== undefined ) {
            if (!comment || !comment.trim()) EventEmitterAsyncResource.comment = "comment cannot exceed 1000 charachters";
        }
    
        return error;
};