const bodyParser = require('body-parser')
const express = require('express')
const router = express.Router()
//importing jobs controller method
const {getJobs,getJob,newJob,getJobInRadius,updateJob,deleteJob,getStats,getAllJobsAvg,applyJob} = require('../controllers/jobsController')
const {isAuthenticatedUser,authorizeRole}  = require('../middlewares/auth')
const roles = ['employeer','admin']
/*router.get('/jobs', (req,res)=>{
     res.status(200).json({
        success:true,
        message:'This route will be display all jobs in the future'
    })

    We use this method before jobsController
})*/
router.route('/jobs').get(getJobs)
router.route('/job/:id/:slug').get(getJob)
router.route('/job/new').post(isAuthenticatedUser,authorizeRole('employer','admin'),newJob)
router.route('/jobs/:zipcode/:distance').get(getJobInRadius)
router.route('/job/:id').put(isAuthenticatedUser,updateJob)
router.route('/job/:id').delete(isAuthenticatedUser,authorizeRole('employer','admin'),deleteJob)
router.route('/stats/:topics').get(getStats)
router.route('/allstats').get(getAllJobsAvg)
router.route('/job/:id/apply').put(isAuthenticatedUser,authorizeRole('user'),applyJob)
module.exports= router