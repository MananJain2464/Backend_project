import mongoose, {Schema} from mongoose ; 
import jwt from 'jsonwebtoken' ; 
import bcrypt from 'bcrypt' 

const userSchema = new Schema({

    username: {
        type: String,
        required: true,
        unique: true, 
        lowercase: true , 
        index: true , 
        trim: true , 
    },

    fullName: {
        type: String,
        required: true,  
        index: true , 
        trim: true ,  
    },

    avatar: {
        type: String ,  //Cloudinary Image 
        required:true 
    },

    coverImage: {
        type: String , //Cloudinary Image 
    },

    watchHistory: [
        {
            type: Schema.Types.ObjectId , 
            ref: "Video"
        }
    ],

    password: {
        type: String , 
        REQUIRED: [true, 'Password is required']
    }, 

    refreshToken: {
        type: String
    }

}, 
{
    timestamps: true  // automatically adds createdAt and updatedAt fields to the schema  // createdAt is automatically set when a new document is created and updatedAt is automatically updated when the document is modified  // timestamps is set to true by default  // timestamps: true will add createdAt and updatedAt fields to the schema  // timestamps: false will not add these fields  // timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } will change the field names to created_at and updated_at  // timestamps: { createdAt: true, updatedAt: true, expires: '1d' } will add an expires field to automatically delete the document after 1 day  // timestamps: { createdAt: 'created_at', updatedAt: 'updated_at', expires: '1d', maxAge: 24 * 60 * 60 * 1000 } will add an expires field to automatically delete the document after 1 day, but will
})

userSchema.pre('save' , async function(next) {
    if(this.isModified('password')){
        this.password = bcrypt.hash(this.password , 10)
        next()
    }

    return next();
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET ,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.REFRESH_TOKEN_SECRET ,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}


export const User = mongoose.model("User" , userSchema)