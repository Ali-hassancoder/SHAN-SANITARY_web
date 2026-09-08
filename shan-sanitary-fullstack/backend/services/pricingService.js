const FLAT_SHIPPING_FEE = 250; 
const FREE_SHIPPING_THRESHOLD = 10000; 

export const calculateShippingFee = (subtotal) => {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
};