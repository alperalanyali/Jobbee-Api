const mongoose = require('mongoose')
const validator = require('validator')
const slugify = require('slugify')
const geoCoder = require('../Utils/geocoder')
const enumIndustry = [
    'Business',
    'Information Technology',
    'Banking',
    'Education/Training',
    'Telecommunication',
    'Others'
]


const jobSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true,'Please enter Job Title'],
        trim:true,
        maxlength:[100,'Job title cannot exceed 100 characters']
    },
    slug:String,
    description:{
        type:String,
        required:[true,'Please enter Job Description'],
        maxlength: [1000,'Job description cannot exceeed 1000 characters']
    },
    email:{
        type:String,
        validate:[validator.isEmail,'Please enter valid email address']
    },
    address:{
        type:String,
        required:[true,'Please add an address']
    },
    location:{
            type:{
                type:String,
                enum: ['Point']
            },
            coordinates:{
                type:[Number],
                index:'2dsphere'
            },
            formattedAddress:String,
            city:String,
            state:String,
            zipCode:String,
            country:String
    },
    company:{
        type:String,
        required:[true,'Please add company name']
    },
    industry:{
        type:[String],
        required:true,
        enum:{
            values:enumIndustry,
            message:'Please select right option for industry'
        }
    },
    jobType:{
        type:String,
        required:true,
        enum:{
            values:['Permanent','Temporary','Intership'],
            message:'Please select correct option for job type'
        }
    },
    minEducation:{
        type:String,
        required:true,
        enum:{
            values:['Bachelor',
                    'Masters',
                    'PhD'],
            message:'Please select correct option for Education'
        }
    },
    position:{
        type:Number,
        default:1
    },
    experience:{
        type:String,
        required:true,
        enum:{
            values:['No Experience',
                    '1 Year - 2 Year',
                    '2 Years - 5 Years',
                    '5 Years +'],
            message:'Please select correct option for experince'
        }
    },
    salary: {
            type:Number,
            required:[true,'Please enter expected salary for this job']
    },
    postingDate:{
        type:Date,
        default: Date.now
    },
    lastDate:{
        type:Date,
        default: new Date().setDate(new Date().getDate() + 7)
    },
    applicantsApplied:{
        type:[Object],
        select:false,
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true,'Please select user for this job']
    }

})
//Creating Slug before saving
jobSchema.pre('save',function(next){
    //Creating slug before saving to db
    this.slug = slugify(this.title,{lower:true})
    next()
})

//Setting up location
jobSchema.pre('save', async function(next){
    const loc = await geoCoder.geocode(this.address)
    this.location = {
        type:'Point',
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        city: loc[0].city,
        state:loc[0].stateCode,
        zipCode: loc[0].zipcode,
        country: loc[0].countryCode
    }
    
})
module.exports = mongoose.model('Job',jobSchema)