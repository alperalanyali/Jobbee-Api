const nodeGeocoder = require('node-geocoder')

const options ={        
    provider:'mapquest',
    apiKey:'SZz5XSSWgh3xM7Tm4GytW1GELQAWgmmJ',
    formatter:null

}

const geoCoder= nodeGeocoder(options)

module.exports= geoCoder
