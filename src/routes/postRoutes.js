import express from "express";
import { replyToPost, toggleLike } from "../controllers/postController.js";


const router = express.Router();

router.post("/toggle-like", toggleLike);
router.post("/reply", replyToPost);


export default router;