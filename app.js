const express = require('express')
const app = express()
const dotnev = require('dotenv')
const morgan = require('morgan')
const fileUpload = require('express-fileupload')
const bodyparser = require('body-parser')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xssClean = require('xss-clean')
var hpp = require('hpp');
const cors = require('cors')



const geoCoder = require('./utils/geocoder')

const errorMiddleware = require('./middlewares/errors')
const ErrorHandler = require('./utils/errorHandler')
//Setting up  config.env file variables
app.use(bodyparser.json())
dotnev.config({path: './config/config.env'})

//importing route
const jobs = require('./routes/jobs')
const auth = require('./routes/auth')
const user = require('./routes/user')


app.use(bodyparser.urlencoded({
    extended:true
}))
const apiURL = '/api/v1'


const PORT = process.env.PORT 
const connectDatabase = require('./config/database')
const { mongo } = require('mongoose')
//Setup security headers
app.use(helmet())

//Middlewares
//Set Cookie
app.use(express.static('public'))
app.use(morgan('tiny'))
app.use(cookieParser())

//Handle file upload
app.use(fileUpload())

//Sanitize data
app.use(mongoSanitize())
//Prevent Xss attacks
app.use(xssClean())
//Prevent  Parameter Pollution
app.use(hpp())
//rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max:100

})
app.use(limiter)
//Handling Uncaught Expections
process.on('uncaughtException', err => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to uncaught exception');
    process.exit(1)
})

//Setup CORS - Accessible by other domains
app.use(cors())

//connecting to database
connectDatabase()
//Handle unhandle routes 
app.get('/',(req,res)=>{
    res.sendFile(__dirname+'/public/index.html')
})
app.use(apiURL,jobs)
app.use(apiURL,auth)
app.use(apiURL,user)
app.all('*',(req,res,next)=> {
    next(new ErrorHandler(`${req.originalUrl} route not found`,404))
})
app.use(errorMiddleware)

const server = app.listen(PORT,()=>{
    console.log(`Server is started on port ${PORT} in ${process.env.NODE_ENV}`);    
})
// Handling Unhandle Promise Rejection
process.on('unhandledRejection',(err)=>{
    console.log(`Error: ${err.messsage}`)
    console.log('Shutting down the server due to handle promise rejection');
    server.close(()=>{
        process.exit(1)                
    })
})
