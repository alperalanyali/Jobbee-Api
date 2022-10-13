const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { nextTick } = require('process')
const roles = ['user','employeer']


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please enter your name']
    },
    email:{
        type:String,
        required:[true,'Please enter your email address'],
        unique:true,
        validate:[validator.isEmail,'Please enter valid email address']
    },
    role:{
        type:String,
        enum:{
            values:roles,
            message:'Please select correct role'
        },    
        default:'user'
    },
    password:{
        type:String,
        required:[true,'Please enter your password'],          
        minLenght:[8,'Your password must be at least 8 characters'],
        select:false
    },
    createAt:{
        type:Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire:Date

},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})
//Encryting passwords before saving

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
})
userSchema.pre('update', async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password,10)
})
//Return JSON Web Token
userSchema.methods.getjwtToken = function(){
    //console.log('Insıde GetjwtToken from models/users');
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE_TIME
    })
}
//Compare user password in database password
userSchema.methods.comparePassword = async function(enteredPassword){
    console.log('Entered password: '+enteredPassword+' Password: '+this.password);
    if(enteredPassword === this.password){
        return true
    }
    else {
        return await bcrypt.compare(enteredPassword,this.password)     
    }
    
}
// Generate Password Reset Token
userSchema.methods.getResetPasswordToken =  function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set to resetPasswordToken
    this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

    // Set token expire time
    this.resetPasswordExpire = Date.now() + 30*60*1000;
    console.log(resetToken);
    return resetToken;
}

//Show all job created by user using virtuals
userSchema.virtual('jobPublish',{
    ref:'Job',
    localField:'_id',
    foreignField:'user',
    justOne:false
})

module.exports =   mongoose.model('User',userSchema)