const Job = require('../models/jobs')
const geoCoder = require('../utils/geocoder')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncError')
const catchAsyncError = require('../middlewares/catchAsyncError')
const path = require('path')
const APIFILTERS = require('../utils/apiFilters')
//Get all jobs  => /api/v1/jobs
exports.getJobs= catchAsyncErrors( async (req,res,next)=>{
    const apiFilters = new APIFILTERS(Job.find(),req.query)
        .filter()
        .sort()
        .limitFields()
        .searchByQuery()
        .pagination()
    const jobs =await apiFilters.query

    res.status(200).json({
        success:true,
        results: jobs.length,
        data:jobs
    })
})

//Create New Job => /api/v1/job/new

exports.newJob = catchAsyncErrors( async (req,res,next)=>{
    console.log(req.body);
    //#region
    //const job =  await new Job.create(req.body)
   /* const job = new Job()  
    job.title = req.body.title
    job.description = req.body.description
    job.email = req.body.email
    job.address = req.body.address
    job.company = req.body.company
    job.industry = req.body.industry
    job.jobType = req.body.jobType
    job.minEducation = req.body.minEducation
    job.position = req.body.position
    job.experience = req.body.experience
    job.salary = req.body.salary
    job.save()
    */
   
   //#endregion
   
   
   //Adding user to body
   req.body.user  = req.user.id

   
   let job = new Job(req.body)
   job = await  Job.create(job)
    
    
    res.status(200).json({
        success:true,
        message:'Job created successfully',
        slug:job.slug,
        data:job
    })
})

//Get single job with id and slug => /api/v1/job/:id/:slug
exports.getJob = catchAsyncErrors( async (req,res,next) => {
    let jobId = req.params.id
    let slug = req.params.slug    
    //console.log(jobId,slug);
    const job = await Job.find({ $and : [{_id:jobId} ,{slug:slug}] })
    if(!job || job.length === 0){    
        return next(new ErrorHandler('Job not found',404))
    }
    res.status(200).json({
        success:true,
        data:job
    })
})


//Update a job => api/v1/job/:id
exports.updateJob = catchAsyncError( async (req,res,next)=>{
    let jobId = req.params.id
    const user = req.user
    console.log(`From req, job id : ${jobId}`)
    let job = await Job.findById(jobId)
    if(!job){
        return res.status(404).json({
            success:false,
            message:'Job not found'
        })
    }        
    //Check  if the user is owner
    if(job.user.toString() !== user.id   && user.role !== 'admin' ){
        return next(new ErrorHandler(`User(${user.id}) is not allowed to update this job `))
    }
    job = await Job.findByIdAndUpdate(jobId,req.body,{
        new:true,
        runValidators:true,        
    })
    res.status(200).json({
        success:true,
        message:'Job is updated',
        data:job
    })
})
//Delete job => /api/v1/job/:id
exports.deleteJob = catchAsyncError( async (req,res,next)=>{
    let jobId = req.params.id
    let job = Job.findById(jobId)
    const user = req.user
    if(!job){
        res.status(404).json({
            success:false,
            message:'Job not found'
        })
    }
  
    /*for(let i= 0; i< job.applicantsApplied.length;i++){
        let filepath = `${__dirname}/public/resume/${job.applicantsApplied[i].resume}`.replace('/controllers','')
            
        console.log(filepath);
        
        if(fs.existsSync(filepath)){
            fs.unlink(filepath, err =>{
                if(err){
                   return console.log(err);
                }                     
            })
        }
      
    }*/
    console.log(job.user);
    
   /* if(job.user.toString() !== user.id   && user.role !== 'admin' ){
        return next(new ErrorHandler(`User(${user.id}) is not allowed to delete this job `))
    } */
    job = await Job.findByIdAndDelete(jobId)
       //Check  if the user is owner

    

    res.status(200).json({
        success:true,
        message:'Job is deleted',
        data:job
    })

})
// /api/v1/jobs:zipcode/:distance
exports.getJobInRadius = catchAsyncError( async (req,res,next)=>{
    const {zipcode ,distance } = req.params
    
    //getting lattitude and longitude from geocoder with zipcode
    const loc = await geoCoder.geocode(zipcode)
    const lattitude = loc[0].latitude
    const longitude = loc[0].longitude

    const radius = distance / 3963
    const job = await Job.find({
        location:{
            $geoWithin:{$centerSphere:[[longitude,lattitude],radius]}
        }
    })
    res.status(200).json({
        success:true,
        results:job.length,
        data:job
    })
})

//Get stats about topic(job)  => /api/v1/stats/:topics
exports.getStats = catchAsyncError( async (req,res,next) =>{
    let topics = req.params.topics
    console.log(topics);
    const  stats = await Job.aggregate(
        [
            {
                '$search': {
                  'index': 'text',
                  'text': {
                    'query': topics,
                    'path': {
                      'wildcard': '*'
                    }
                  }
                }
              },
            {
                $group:{
                    _id:{$toUpper:'$title'},
                    totalJobs: {$sum:1},                    
                    avgSalary:{ $avg: '$salary'} ,
                    minSalary: {$min: '$salary'},
                    maxSalary: {$max:'$salary'},                                                      
                }       
            },
            {
                $sort:{title:-1}
            }
    ]);
    
    console.log(stats);
    if(stats.length === 0){        
        next( new ErrorHandler(`No stats found for - ${topics}`,200))
    }   else {
        return res.status(200).json({
            success:true,
            results:stats.length,
            data:stats
        })
    } 
})

// Get job about title  by avgSalary

exports.getAllJobsAvg = catchAsyncError( async (req,res,next)=>{
    const jobs = await Job.aggregate(
        [
            {
                $group:{
                    _id:'$title',
                    avgSalary:{ $avg: '$salary'}                                                                          
                }       
            }
        ])
        if(jobs.length === 0){
            next(new ErrorHandler('No jobs',404))            
        }else {
            res.status(200).json({
                success:true,
                result:jobs.length,
                data: jobs
            })
        }    
})
//Apply to job using Resume => /api/v1/job/:id/apply
exports.applyJob = catchAsyncError( async (req,res,next)=>{
    const jobId = req.params.id
    let job = await Job.findById(jobId).select('+applicantsApplied')

    if(!job){
        return next(new ErrorHandler('Job not found',404))
    }
    //Check that if job last date has been passed or not 
    if(job.lastDate < new Date(Date.now())){
        return next(new ErrorHandler('You cannot apply to this job. Date is over',404))
    }
    
    //Check if user has applied before
    for(let i =0; i < job.applicantsApplied.length;i++){
        if(job.applicantsApplied[i].id ===req.user.id ){
            return next(new ErrorHandler('You have already applied to this job',400))
        }
    }

    //Check the files
    if(!req.files){
        return next(new ErrorHandler('Please upload file',400))
    }

    const file = req.files.file

    //Check file type
    const supportedFiles = /.docx|.pdf/
    if(!supportedFiles.test(path.extname(file.name))){
        return next(new ErrorHandler('Please upload on document file',400))
    }
    //Check documnet size
   /* if(file.size > process.env.MAX_FILE_SIZE){
        return next(new ErrorHandler('Please upload file less than 2MB.',400))
    }*/

    //Renaming resume 
    file.name = `${req.user.name.replace(' ','_')}_${job._id}${path.parse(file.name).ext}`

    file.mv(`${process.env.UPLOAD_PATH}/${file.name}`,async (err)=>{
        if(err){
            console.log(err)
            return next(new ErrorHandler('Resume upload failed',500))        
        }

        await Job.findByIdAndUpdate(jobId,{
            $push:{
                applicantsApplied:{
                    id:req.user.id,
                    resume:file.name,
                    
                }
            }
        },{
            new:true,
            runValidators:true,
            useFindAndModify:false
        })

        res.status(200).json({
            success:true,
            message:'Applied to job successfully',
            data:file.name
        })
    })
})