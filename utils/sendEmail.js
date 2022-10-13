const nodemailer = require('nodemailer')

const sendEmail = async options => {
   /* const transporter=nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS
        }
    })*/
    const transporter=nodemailer.createTransport({
        
        host:"smtp.office365.com",
        port:587,
        auth:{
            user:process.env.SMPT_HOTMAIL_USER,
            pass:process.env.SMPT_HOTMAIL_PASSWORD
        }
    })
    /*const message =  {
        //from:`${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        from:"alanyalialper@gmail.com",
        to:options.email,
        subject:options.subject,
        text: options.message
    }*/
    console.log(options.message);
    const message =  {
        //from:`${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        from:"alper_alanyali@hotmail.com",
        to:options.email,
        subject:'Jobbee',
        text: options.message
    }
    await transporter.sendMail(message, err => {
        if(err){
            console.log(err);
        }
    })
}

module.exports =sendEmail