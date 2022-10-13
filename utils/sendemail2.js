const nodemailer = require("nodemailer")
let mailTransporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"alanyalialper@gmail.com",
        pass:"Senkuluffy2526"
    }
})

let mailDetails = {
    from:"alanyalialper@gmail.com",
    to:"alanyalialper@gmail.com",
    subject:"Test",
    text:"Test 343434"

}

mailTransporter.sendMail(mailDetails, err=>{
    if(err){
        console.log(err);
    }
    console.log('Email send successfully');
})