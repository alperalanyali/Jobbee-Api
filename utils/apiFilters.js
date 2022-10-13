

class APIFILTERS {
    constructor(query,queryStr){
        this.query = query
        this.queryStr = queryStr
    }

    filter(){

        const queryCopy = {...this.queryStr}
        //Removing fields from query
        const removeFields = ['sort','fields','q',"page","limit"]
        removeFields.forEach(el => delete queryCopy[el])

        //Advance filter using lt,lte,gt,gte
        console.log(this.queryStr);
        let queryStr2 = JSON.stringify(queryCopy)
        queryStr2 = queryStr2.replace(/\b(gt|gte|lt|lte|in)\b/g,match => `$${match}`)
        console.log(queryStr2);
        this.query = this.query.find(JSON.parse(queryStr2))
        return this
    }

    sort(){
        if(this.queryStr.sort){
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }else {
            this.query = this.query.sort('-postingDate');
        }
        return this
    }
    limitFields(){
        console.log(this.queryStr);
        if(this.queryStr.fields){
            const fields = this.queryStr.fields.split(',').join(' ')
            console.log(fields);
            this.query = this.query.select(fields)
        }else {
            this.query = this.query.select('__v')
        }

        return this
    }
    searchByQuery(){
        if(this.queryStr.q){
            const qu = this.queryStr.q.split('-').join(' ')
            this.query = this.query.find({$text: {$search: "\"" +qu+"\""}})
        }
        return this
    }
    pagination(){
        const page = parseInt(this.queryStr.page,10)  || 1
        const limit = parseInt(this.queryStr.limit) || 10
        const skipResult = (page - 1 ) * limit

        this.query = this.query.skip(skipResult).limit(limit)

        return this
    }
}

module.exports = APIFILTERS