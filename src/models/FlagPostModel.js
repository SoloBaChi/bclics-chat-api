import mongoose from "mongoose";

const  { Schema, model } = mongoose;

const flagSchema = new Schema({
  postTitle:{
  type:String,
   trim:true,
   required:true
  },
  flagReason:{
   type:String,
   trim:true,
   required:true
  },
  author: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "User", 
  required: true 
   },
  postId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: "Post", 
  required: true 
  },
  createdAt: { 
  type: Date, 
  default: Date.now 
},
},
{ timestamps: true });



const FlagPost = model("Flag", flagSchema);
export default FlagPost;
