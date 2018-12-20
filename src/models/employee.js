let mongoose = require('mongoose')
let employeeSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    skip_limit: Number,
    elapsed_date_limit: Number
})
module.exports = mongoose.model('Employee', employeeSchema)