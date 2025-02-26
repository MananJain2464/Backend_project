import {asyncHandler} from '../utils/asyncHandler.js' ; 
import {ApiError} from '../utils/ApiError.js' ;
import { User } from '../models/user.model.js' ;
import {uploadOnCloudinary} from '../utils/cloudinary.js' ;
import { ApiResponse } from '../utils/ApiResponse.js';


const generateAccessAndRefreshTokens = async(userId) =>{

    try {
       const user = await User.findById(userId);
       const accessToken = user.generateAccessToken()
       const refreshToken = user.generateRefreshToken() 

       user.refreshToken = refreshToken
       await user.save({validateBeforeSave: false})
        
        return {accessToken , refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}
const registerUser = asyncHandler(async(req ,res) =>{
   
    // get user details from frontend
    // first of all , data type verification
    // check if username already exists
    // check for images and avatar 
    // upload images onto cloudinary , avatar
    // create user object - create entry in db 
    // remove password and refresh token field from response 
    // check for user creation 
    // return response 

    const {fullName , email , username , password }= req.body
    console.log('email:', email) ;   
    
    if ([fullName, email, username, password].some((field) => field?.trim() === ""))
    {
        throw new ApiError(400, 'All Fields are required')
    }

    const existedUser =await User.findOne({
        $or: [ { username} , { email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path ; 
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
    
    if (!avatarLocalPath){
        throw new ApiError(400, "Avatar image is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath) 

    if (!avatar){
        throw new ApiError(500, "Failed to upload avatar image to cloudinary")
    }

    const user = await User.create({
        fullName , 
        avatar: avatar.url , 
        coverImage: coverImage?.url || "" , 
        email,
        username: username.toLowerCase(),
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user ")
    }

    return res.status(201).json(
        new ApiResponse(200 , createdUser, 'User Registered Successfully') 
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // first of all, data type verification
    // check if username or email exists
    // check for password
    // generate access and refresh token
    // check for user login
    //send cookie 

    const {email, username, password} = req.body 
    
    if (!email || !username){
        throw new ApiError(400, "Email or username is required")
    }
    
    const user = await User.findOne({
        $or: [{username: username.toLowerCase()}, {email}]
    })
    
    if (!user) {
        throw new ApiError(401, "User doesn't exist")
    }
    
    const isPasswordCorrect = await user.isPasswordCorrect(password)
    
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true , 
        secure: true 
    }
    return res
    .status(200)
    .cookie("accessToken" , accessToken, options)
    .cookie("refreshToken" , refreshToken, options)
    .json(
        new ApiResponse(
            200 , 
            {
                user:loggedInUser, accessToken , 
                refreshToken
            }, 
            "User logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set:
            {
                refreshToken: undefined
            }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie('accessToken' , options)
    .clearCookie('refreshToken', options)
    .json(
        new ApiResponse(
            200,
            {},
            "User logged Out Successfully"))
})

export {registerUser , loginUser , logoutUser} 