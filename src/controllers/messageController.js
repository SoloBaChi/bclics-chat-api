import Conversation from "../models/conversationModel.js";
import Message from "../models/MessageModel.js";
import { getRecipientSocketId, io } from "../socket/sockect.js";
import { ResponseMessage } from "../utils/responseMessage.js"



export const sendMessage = async(req,res)  => {
    try{
        const { recipientId, message} = req.body;
        const senderId = req.user._id;

        /**
         * Check if the loggined user is the same as the recipient
         */
         if(senderId.toString() === recipientId){
         return res.status(400).json(new ResponseMessage("error",400,"You cannot send message to yourself"))
         }
       /**
        * create a conversation 
        Check if the convesation already exists
        */
       let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId]}
       })

       if(!conversation){
        conversation = await Conversation.create({
         participants:[senderId, recipientId],
         lastMessage: {
         text:message,
         sender:senderId
         }
        })
       }

       //When we have the conversation we could integrate the message
       const newMessage = new Message({
        conversationId: conversation._id,
        sender:senderId,
        text:message
       })
       
       //save the message to the database and update the lastMessage field to the new message
       await Promise.all([
        newMessage.save(),
        conversation.updateOne({
         lastMessage:{
         text:message,
         sender:senderId
         }
        })
       ]);

       //get the recipients messages from the socket.io
       const recipientSocketId =  getRecipientSocketId(recipientId);
       if(recipientSocketId){
        io.to(recipientSocketId).emit("newMessage", newMessage)
       }

       return res.status(200).json(new ResponseMessage("success",200,"Message Created",{
        newMessage
       }))

    }
    catch(error){
      return res.status(500).json(new ResponseMessage("error",500,`Error : ${error.message}`))  
    }
}



/**
 * Fetch messages between two users
 */
export const getMessages = async(req, res) => {
    const { otherUserId } = req.params;
  try{
    const userId = req.user._id;

    const conversation = await Conversation.findOne({
        participants:{ $all: [userId, otherUserId]}
    });

    if(!conversation){
        return res.status(404).json(new ResponseMessage("error",404,"Conversation not Found."))
    }


    const messages = await Message.find({
        conversationId: conversation._id
    })
    .populate({
    path:"sender", select:"name profileImage userName"
    })

    return res.status(200).json(new ResponseMessage("success",200,"Succesfully Retreived messages",messages))
  } 
  catch(error){
    return res.status(500).json(new ResponseMessage("error",500,`Error : ${error.message}`))
  } 
}


/**
 * Get all the conversations for a particular user
 */

export const getConversations = async(req,res) => {
try{
  const userId = req.user._id;
  const conversations = await Conversation.find({
    participants: userId //find all the conversations that includes the user Id in the participants array
  }).populate({
    path:"participants", select:"userName name profileImage"
  }).sort({ createdAt: -1 });


  //Remove the current user from the participants
  conversations.forEach((conversation) => {
    conversation.participants = conversation.participants.filter(participant => participant._id.toString() !== userId.toString())
  })

  return res.status(200).json(new ResponseMessage("success",200,"retrieved all the conversations",{
    totalConversations: conversations.length,
    conversations
  }))
}
catch(error){
 return res.status(500).json("error",500,`Internal Server Error : ${error.message}`)
}
}



//TODO
//Delete all the conversations




//Delete all the messages