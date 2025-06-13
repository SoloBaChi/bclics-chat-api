import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      trim:true,
    },
    userName: {
       type: String, 
       required:true,
       unique: true,
       trim:true,
      },
    email: { 
      type: String, 
      unique: true,
    },
    password: { 
      type: String, 
    },
    bio: { 
      type: String, 
      default: "",
      trim:true,
    },
    profileImage: { 
      type: String, 
      default: null 
    },
    activationToken: {
      type: String,
      index: { expires: "1h" }
    },
    authCode: {
      type: String,
      index: { expires: "5m" }
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isAdmin:{
    type:Boolean,
    default:false
    },
    isVerifiedVendor:{
      type:Boolean,
      default: false
    },
    referrals: {
      referralCount: { type: Number, default: 0, min: 0 },
      amountEarned: { type: Number, default: 0, min: 0 },
    },
    posts:[
    {
      type:mongoose.Schema.Types.ObjectId,
      ref:"Post"
      }
    ],
    followers: [
     { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ],
     following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
    ],
    savedPosts:{
      type:[mongoose.Schema.Types.ObjectId],
      ref:"Post",
      default:[]
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
