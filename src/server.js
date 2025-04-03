import express from "express"
import cors from "cors"
import morgan from "morgan";
import dotenv from "dotenv"




dotenv.config()

const app = express();



//custom middlewares
// app.use(())
app.use(express.json()); // Parse incoming JSON requests
app.use(morgan("dev"));
app.use(cors({ origin: ["https://www.bclics.com",["https://bclicscom.vercel.app"],"http://localhost:5175"], credentials: true }));
app.disable("x-powered-by"); // Hide server stack details



const PORT = process.env.PORT || 4001;

export const start = () => {
 app.listen(PORT,()=>{
  console.log(`Sever Started at ${PORT}`)
 })
}