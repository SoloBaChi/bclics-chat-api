import express from "express";
import { toggleFollow } from "../controllers/userController.js";



const router = express.Router();

router.post("/toggle-follow", toggleFollow);


export default router;