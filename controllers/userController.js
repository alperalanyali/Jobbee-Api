const catchAsyncError = require('../middlewares/catchAsyncError')
const User = require('../models/users')
const Job   = require('../models/jobs')
const sendToken = require('../utils/jwtToken')
const ErrorHandler = require('../utils/errorHandler')
const { findByIdAndUpdate, findByIdAndDelete } = require('../models/users')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const { applyJob } = require('./jobsController')
const ApiFilter = require('../utils/apiFilters')

//Get current user profile => /api/v1/user
exports.getUserProfile =  catchAsyncError( async (req,res,next )=>{
    const userId = req.user.id
    console.log(userId);
    const  user   = await User.findById(userId)  

    res.status(200).json({
        success:true,
        data:user
    })
})

//Update current user password => api/v1/password/change

exports.updateUserPassword = catchAsyncError (async (req,res,next)=>{
    const userId = req.user.id
    const newPassword = req.body.newPassword
    const currentPassword = req.body.currentPassword
   // console.log(`currentPassword: ${currentPassword}\nnewPassword: ${newPassword}`);
    const hashPassword = await bcrypt.hash(newPassword,10)

    const user = await User.findByIdAndUpdate(userId,{
        password:hashPassword
    })
    sendToken(user,200,res)
})

//Update current user data => /api/v1/user/update
exports.updateUser = catchAsyncError( async (req,res,next)=>{
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }
    const userId = req.user.id
    console.log(userId);
    const user = await User.findByIdAndUpdate(userId,newUserData,{
        new:true,
        runValidators:true
    })

    res.status(200).json({
        success:true,
        data:user
    })
})


//Delete current user => /api/v1/user/delete

exports.deleteUser = catchAsyncError( async (req,res, next)=> {
    const userId = req.user.id
    const role = req.user.role
    deleteUserData(userId,role)
    res.status(200)
   /* const user = await User.findByIdAndDelete(userId,{
        
    })
    res.cookie('token','none',{
        expires: new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({
        success:true,
        message:'User is deleted successfully'
    })*/
})
//Show all applied jobs => api/v1/jobs/applied
exports.getAppliedJobs = catchAsyncError(async (req,res,next)=>{    
    
    const user = req.user.id
    //console.log(user);
    const jobs =  await Job.find({"applicantsApplied.id": user}).select('+applicantsApplied')        
    console.log(jobs); 

    res.status(200).json({
        success:true,
        result:jobs.length,
        data:jobs
    })
})

//Show all jobs published by employer =>  api/v1/jobs/published
exports.getPublishedJobs = catchAsyncError( async (req,res,next)=>{
    const userId = req.user.id

    const jobs = await Job.find({user: userId})

    console.log(jobs);

    res.status(200).json({
        success:true,
        result:jobs.length,
        data:jobs
    })
})

//Show all user => api/v1/admin/users
exports.getUsers = catchAsyncError(async (req,res,next)=>{
    console.log(req.user.id);
  /*  const apiFilters = new ApiFilter(User.find(),req.query)
                            .filter()
                            .sort()
                            .limitFields()
                            .pagination()
*/
    const users = await User.find()

    res.status(200).json({
    success:true,
    result:users.length,
    data:users
    })
}) 

//Delete user by admin => /api/v1/admin/deleteuser:id
exports.deleteUserByAdmin = catchAsyncError( async (req,res,next)=>{
    const userId = req.params.id
    console.log(userId);
    let user = await User.findById(req.params.id)
    console.log(user);
    if(!user){
        return next( new ErrorHandler(`User not found with id: ${userId}`,404))
    } else {
        deleteUserData(user.id,user.role)
        user = await User.findByIdAndDelete(userId)
        res.status(200).json({
            success:true,
            message:'User is deleted by admin'
        })
    }



})

async function deleteUserData(user,role){
    if(role === "employer"){
        await Job.deleteMany({user:user})
    }

    if(role === "user"){
        const applyJobs = await Job.find({"applicantsApplied.id": user}).select('+applicantsApplied')        
        console.log(applyJobs); 
        for(let i =0; i <= applyJobs.length;i++){
            let obj = applyJobs[i].applicantsApplied.find( o => o.id === user)
            
            let filepath = `${__dirname}/public/resume/${job.applicantsApplied[i].resume}`.replace('/controllers','')
            
            console.log(filepath);
            
            if(fs.existsSync(filepath)){
                fs.unlink(filepath, err =>{
                    if(err){
                       return console.log(err);
                    }                     
                })
            }    
            applyJobs[i].applicantsApplied.splice(applyJobs[i].applicantsApplied.indexOf(obj.id))
            console.log(applyJobs[i].applicantsApplied);
            console.log(applyJobs[i].applicantsApplied.indexOf(objd.id));
            await applyJobs[i].save()
        }
    }
}
