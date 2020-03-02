const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/CV-app",{
    useNewUrlParser:true,
    useFindAndModify:false,
    useCreateIndex:true,
    useUnifiedTopology:true
})