const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Please enter a valid email')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:8,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    avatar: {
        type: Buffer
    },
    education:[{
        _id:false,
        degree:{
            type:String,
            required:true
        },
        institue:{
            type:String,
            required:true
        },
        start_date:{
            type:Date,
            required:true
        },
        end_date:{
            type:Date,
            required:true
        }

    }],
    projects:[{
        _id:false,
        project_name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        }        
    }],
    experience:[{
        name_of_company:{
            type:String,
            required:true
        },
        start_date:{
            type:Date,
            required:true
        },
        end_date:{
            type:Date,
            required:true
        }
    }],
    tokens: [{
        token:{
            type:String,
            required: true
        }
    }]

},{
    timestamps: true
})

// prevent sending unwanted data
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//Verify Password and Username before logging in to app
userSchema.statics.findByCredentials = async(email, password) =>{
    const user = await User.findOne({email:email})
    if (!user){
        throw new Error('Unable to login')
    }
    isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}


//hash Password and save
userSchema.pre('save', async function(next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//generate auth token
userSchema.methods.getAuthToken = async function(){
    const user = this
    const new_token = jwt.sign({_id :user._id.toString()},"this_is_demo_app")
    user.tokens = user.tokens.concat({token:new_token})

    await user.save()

    return new_token
}

const User = mongoose.model('User_Data', userSchema)

module.exports = User