import express from "express"
import cors from "cors"
import morgan from "morgan";
import dotenv from "dotenv"
import { ResponseMessage } from "./utils/responseMessage.js";
import { server, app, io } from "./socket/sockect.js";
import connectDB from "./config/db.js";
import messageRoutes from "./routes/messageRoutes.js"




dotenv.config()

//custom middlewares
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev"));
app.use(cors({ origin: ["https://www.bclics.com",["https://bclicscom.vercel.app"],"http://localhost:5175"], credentials: true }));
app.disable("x-powered-by"); // Hide server stack details




//Defualt Route
app.get("/", (req, res) => {
 console.log(req.user)
  return res.status(200).json(new ResponseMessage("success",200,`Welcome to ${process.env.APP_NAME}`));
});


//Other Routes
app.use("/api/v1/messages", messageRoutes);


// Default error handling
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack in development
    res.status(err.status || 500).json({
      status: "error",
      statusCode: err.status || 500,
      message: err.message || "Internal Server Error",
    });
  });
  


  // NOT FOUND ROUTE
  app.use("*", (req, res) => {
    res.status(400).json({
      status: "error",
      statusCode: 400,
      message: "Wrong Route",
    });
  });


 const PORT = process.env.PORT || 4001;


export const start = async() => {
try{
await connectDB();
server.listen(PORT,()=>{
  console.log(`WebSocket server running on port ${PORT}`)
 })
}
catch(error){
 console.error("Failed to connect to MongoDB", error);
 process.exit(1); // Exit process with failure
}
}
