const crypto = require('crypto')
const User = require('../models/users')
const ErrorHandler = require('../utils/errorHandler')
const sendEmail = require("../utils/sendEmail")
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const sendToken = require('../utils/jwtToken')

//Register a new user => /api/v1/register
exports.registerUser = catchAsyncErrors( async (req,res,next)=>{
    const {name,email, password,role} = req.body
    let user = new User({
        name:name,
        email:email,
        password:password,       
        role:role 
    })
    user = await User.create(user)
    //Create JWT Token
    const token = user.getjwtToken()
     //#region Before sendToken 
    /*res.status(200).json({
        success:true,
        message:'User is registered',
        token:token
    })*/
    //#endregion
    sendToken(user,200,res)
})
// Get all users
exports.getUsers =  catchAsyncErrors( async (req,res,next)=>{
    const email = req.body.email
    const user = await User.findOne({email})
   // console.log(user.password);
    res.status(200).json({
        data:user
    })
})
//Login user => /api/v1/login
exports.loginUser = catchAsyncErrors( async (req,res,next)=> {
    //console.log('Insıde login user');
    const {email,password} = req.body

    //Check email or password is entered by user
    if(!email || !password){
        return next( new ErrorHandler('Please enter email and/or password',404))
    } 

    //Finding user in db
    const user = await User.findOne({email}).select('+password')

    if(!user){
        return next(new ErrorHandler('Invalid email or password',401))
    }
    console.log(user);
    //Check if password is correct
    const isPasswordMatched = await user.comparePassword(password)
    console.log(isPasswordMatched)
    if(!isPasswordMatched){
        return next( new ErrorHandler('Invalid email or password',401))
    }
    //#region Before sendToken
    //JSONWebToken
    // Before sendToken
    /* const token = user.getjwtToken()

    res.status(200).json({
        success:false,
        token: token
    })*/
    //#endregion
    sendToken(user,200,res)
})

//Forgot Password => /api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors( async (req,res,next)=>{
    const emailReq = req.body.email
    //console.log(emailReq);    
    
    const user =  await User.findOne({emailReq   })
  //  console.log(user[0].email);
    //Check user email is in the database
    if(!user){
        return next(new ErrorHandler('No user found with this email',404))
    }
    console.log(user);
    // Get reset token    
    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave:false})

    //Create reset password url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `Your password reset link is as follow:\n\n${resetUrl}\n\n If you have  not request this please ignore that`
    try {
        await sendEmail({
            email:user.email,
            subject:'Jobbee Passwort Reset Email',
            message:message

        })

        res.status(200).json({
            success:true,
            message:`Email send successfully ${emailReq}}`
        })
    } catch (error) {
        console.log(error);
        user.getResetPasswordToken = undefined
        user.resetPasswordExpire= undefined
        await user.save({validateBeforeSave:false})

        return next(new ErrorHandler('Email is not sent',500 ))
    }
})
//Reset password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors( async (req,res,next) => {
    const urlToken = req.params.token
    const newPassword = req.body.password
    console.log('New password: '+ newPassword);
    console.log('URLTOKEN: '+urlToken);
    //Hash  url token
    const resetPasswordToken = crypto.createHash('sha256')
                                     .update(urlToken)  
                                     .digest('hex')
    console.log('Reset Token: '+resetPasswordToken);
    
    let   user = await User.findOneAndUpdate({
        resetPasswordToken,
        resetPasswordExpire:{$gt: Date.now()}
    },{password:newPassword,
        resetPasswordExpire:undefined,
        resetPasswordToken:undefined
     })                 
    console.log(user.password);
    if(!user){
        return next(new ErrorHandler('Password reset token is invalid',400))
    }                        
    //console.log(newPassword);
    //Set up new password
    //user.password = newPassword

    //user.resetPasswordToken= undefined
   // user.resetPasswordExpire = undefined
  

    sendToken(user,200,res)
})

// Logout user  => /api/v1/logout
exports.logout = catchAsyncErrors( async (req,res,next)=>{
    res.cookie('token','none',{
        expires: new Date(Date.now()),
        httpOnly:true    
    })
    res.status(200).json({
        success:true,
        message:'Logged out successfully '
    })
})