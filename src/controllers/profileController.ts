import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from 'express';
import { S3Client } from "@aws-sdk/client-s3";
import { UserMapper } from "../mappers/user/userMapper";

export const createProfileController = (userMapper:UserMapper, s3:S3Client) => {
  return {
    returnUploadUrl: async (req: Request, res: Response):Promise<void> => {
      try {
        if(!req.body) {
          res.status(400).json({ error: "Missing request body" });
          return ;
        }
        const { fileName, fileType } = req.body;
    
        if (!fileName || !fileType) {
          res.status(400).json({ error: "Missing fileName or fileType" });
          return ;
        }
    
        // Construct the S3 object key (filename + optional folder prefix)
        const key = `avatars/${uuidv4()}${fileName}`;
    
        // Create the PutObjectCommand to specify bucket, key, and content type
        const command = new PutObjectCommand({
          Bucket: "fit-tracker",
          Key: key,
          ContentType: fileType,
        });
    
        // Generate a signed URL valid for 60 seconds
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
    
        // Send the URL and the object key back to frontend
        res.json({ uploadUrl, key });
      } catch (error) {
        console.error("Error generating upload URL:", error);
        res.status(500).json({ error: "Failed to generate upload URL" });
      }
    },

    saveAvatar: async (req: Request, res: Response):Promise<void> => {
      if(!req.body) {
        res.status(400).json({ error: "Missing request body" });
        return ;
      }


      const userId = req.user?.id;
      const { key } = req.body;
      if (!userId || !key) {
        res.status(400).json({ error: "Missing userId or key" });
        return ;
      }
      console.log(userId);
      try {
        const result = await userMapper.updateUser({id: userId, avatar: key});
      
        res.json({ success: result !== null });
      } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Failed to save avatar key" });
      }
    }
  }
}

