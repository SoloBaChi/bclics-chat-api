
import { getRecipientSocketId, io } from "../socket/sockect.js";
import { ResponseMessage } from "../utils/responseMessage.js"



export const toggleLike = async(req,res)  => {
    try{

      const token = req.headers.authorization?.split(" ")[1];
      console.log(token)
      if (token !== process.env.SOCKET_API_KEY) {
        return res.status(403).json(new ResponseMessage("error", 403, "Unauthorized"));
      }

        const { recipientId, message, type, createdAt } = req.body;

        if(!message){
          return res.status(404).json(new ResponseMessage("error",404,"message is required"))
        }

       //get the recipients messages from the socket.io
       const recipientSocketId =  getRecipientSocketId(recipientId);
       if(recipientSocketId){
        io.to(recipientSocketId).emit("newNotification", {
          type,
          message,
          createdAt,
         });
       }

      return res.status(200).json(new ResponseMessage("success",200,"Message broadcasted via socket"))

    }
    catch(error){
      return res.status(500).json(new ResponseMessage("error",500,`Error : ${error.message}`))  
    }
}


export const replyToPost = async(req,res)  => {
    try{

      const token = req.headers.authorization?.split(" ")[1];
      console.log(token)
      if (token !== process.env.SOCKET_API_KEY) {
        return res.status(403).json(new ResponseMessage("error", 403, "Unauthorized"));
      }

        const { recipientId, message, type, createdAt, postId } = req.body;

        if(!message){
          return res.status(404).json(new ResponseMessage("error",404,"message is required"))
        }

       //get the recipients messages from the socket.io
       const recipientSocketId =  getRecipientSocketId(recipientId);
       if(recipientSocketId){
        io.to(recipientSocketId).emit("newNotification", {
          type,
          message,
          createdAt,
          postId
         });
       }

      return res.status(200).json(new ResponseMessage("success",200,"Message broadcasted via socket"))

    }
    catch(error){
      return res.status(500).json(new ResponseMessage("error",500,`Error : ${error.message}`))  
    }
}
