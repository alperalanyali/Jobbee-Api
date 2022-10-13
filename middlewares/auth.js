const jwt = require('jsonwebtoken')
const User = require('../models/users')
const catchAsyncError = require('../middlewares/catchAsyncError')
const errorHandler = require('../utils/errorHandler')
const ErrorHandler = require('../utils/errorHandler')


//Check if the user is authenticated or not
exports.isAuthenticatedUser = catchAsyncError(  async (req,res,next)=> {
    let token;
    if(req.headers.cookie){
        token = String(req.headers.cookie).split('=')[1]
    }
    if(!token){
        return next(new errorHandler('Login first to access this resource.',401))
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET)
   // console.log(decoded);
    req.user = await User.findById(decoded.id)

    next()
})
//Handling user roles
exports.authorizeRole = (...roles)=>{

    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role(${req.user.role}) is not allowed to access this resource  `,403))
        }
       // console.log('After check');
        next()
    }
}