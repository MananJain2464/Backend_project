const asyncHandler = (requestHandler) => {
    (req , res , next) => {
        Promise.resolve(requestHandler(req, res, next)).
        catch((err) => next(err)) 
    }
} 

export {asyncHandler}


// const asyncHandler = ()=> {

// } This is the common implementation of the async function

// const asyncHandler = (func) => () => {}
// this is the implementation if we want to use async functions inside async functions


//This is a way for asyncHandler , we will perform another way round
// const asyncHandler = (fn) => async (req, res , next) =>{
//     try {
//         await fn(req , res , next)
//     }
//     catch (error) {
//         res.status(error.code || 500).json({
//             success: false ,
//             message: error.message
//         })
//     }
// }


