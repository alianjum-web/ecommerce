import rateLimit from "express-rate-limit";

 const addToCartLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each user to 10 requests per minute
    message: { success: false, message: "Too many requests, please try again later" },
  });

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { success: false, message: "Too many login attempts, please try again later" }
});

 const reviewLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // Limit to 5 reviews per user per day
    message: { success: false, message: "You have reached the review limit for today." },
  });
  
   const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // Limit each user to 20 searches per minute
    message: { success: false, message: "Too many searches, please slow down." },
  });

   const orderLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit to 5 orders per 10 minutes
    message: { success: false, message: "Too many orders placed, please wait." },
  });
  
  
//  const checkoutLimiter = rateLimit({
//     windowMs: 5 * 60 * 1000, // 5 minutes
//     max: 3, // Limit each user to 3 checkout attempts per 5 minutes
//     message: { success: false, message: "Too many checkout attempts, please wait." },
//   });
  
  
export {
    addToCartLimiter,
    authLimiter,
    reviewLimiter,
    searchLimiter,
    orderLimiter
}