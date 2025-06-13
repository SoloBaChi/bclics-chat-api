import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
    },
    senderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User", 
    required:true
    },
    type:{
    type:String,
    enum:["like","comment","follow","message"],
    required:true
    },
    message:String,
    isRead:{
    type:Boolean,
    default:false
    },
    createdAt:{
    type:Date,
    default:Date.now
    }
},
{timestamps: true}
);


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;