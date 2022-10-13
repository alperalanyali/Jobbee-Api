//Create and send a token annd save in cookie
const sendToken = (user,statusCode,res)=>{
    
    //Create jwt token 
    const token = user.getjwtToken()        
    const expire = new Date(Date.now() + parseInt(process.env.COOKIE_EXPIRES_TIME)*60000)    
    //options for cookie
    const options={
        expires: expire,
        httpOnly:true
    }    
    /*
    if(process.env.NODE_ENV === 'production'){
        options.secure = true
    }*/
    res
        .status(statusCode)
        .cookie('token',token,options)
        .json({
            success:true,
            token
        })
}

module.exports = sendToken