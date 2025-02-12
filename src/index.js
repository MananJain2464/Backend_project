// the below one is one way of including the dotenv file , but there is one more way , which we will be using 
// require('dotenv').config({path: './env'})

import dotenv from "dotenv"
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB()


