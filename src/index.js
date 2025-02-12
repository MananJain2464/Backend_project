// the below one is one way of including the dotenv file , but there is one more way , which we will be using 
// require('dotenv').config({path: './env'})

import dotenv from "dotenv"
import connectDB from './db/index.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.on('error', (error)=>{
        console.error(`Error starting server: ${error.message}`) ;
    })

    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port ${process.env.PORT}`)  ;  // this will print the port number where the server is running  ;  // process.env.PORT is used to get the port number from the environment variable  ;  // if no port is provided, it defaults to 8000  ;  // app.listen is a method provided by express that listens to the specified port  ;  // the callback function is executed when the server is successfully started  ;  // it will print the message "Server is running on port XYZ" where XYZ is the port number  ;  // this is useful for debugging purposes  ;  // if there is an error connecting to the database, it will be caught and logged with a message "Error in connecting to the database"  ;  // this will help in debugging and identifying the problem  ;  // the connectDB function is defined in the db/index.
    })
})
.catch((err) => {
    console.log(`Error in connecting to the database`) ;
})

