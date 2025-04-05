import express from "express"
import { Server } from "socket.io";
import http from "http";
import Message from "../models/MessageModel.js";
// import Message from "../models/MessageModel.js"; 



//create an express app
const app =  express();

//create an http server
const server = http.createServer(app);

//create socket server
const io =  new Server(server, {
    cors:{
        origin:["http://localhost:5175",["https://bclicscom.vercel.app"],"https://www.bclics.com"],
        methods:["GET","POST"]
    }
});

export const getRecipientSocketId = (recipientId ) => {
    return userSocketMap[recipientId]
}
//create a hash map
const userSocketMap = {}

//when the users connects, // socket is the user that just connected
io.on("connection", (socket)=> {
    console.log("User connected", socket.id);
    const userId = socket.handshake.query.userId;

    if(userId != "undefined") userSocketMap[userId] =  socket.id //userId: socketId;

    //::Handle connection , send to client for update: //send the arrays of users ids
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); //[1,2,3,4]

    socket.on("markMessagesAsSeen", async({conversationId, userId}) => {
        try{
            await Message.updateMany({conversationId:conversationId,seen:false},{$set:{seen: true}})
            // await Conversation.updateOne({_id:conversationId }, {$set:{"lastMessage.seen" : true }})

        io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId})
        }
       catch(err){
        console.log(err)
       }
    })

    //Disconnect the socket
    socket.on("disconnect", () => {
        console.log('User disconnected', socket.id);
        delete userSocketMap[userId];
        //update the usersocket map
     io.emit("getOnlineUsers", Object.keys(userSocketMap)); 

    })
})


export {
io,
server,
app
};
