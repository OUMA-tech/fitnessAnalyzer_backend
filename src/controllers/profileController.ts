import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from 'express';
import { s3 } from '../utils/AWS';
import User from '../models/userModel'



export const returnUploadUrl = async (req: Request, res: Response):Promise<void> => {
  try {
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
}

export const saveAvatar = async (req: Request, res: Response):Promise<void> => {

  const userId = req.user?.id;
  const { key } = req.body;
  if (!userId || !key) {
    res.status(400).json({ error: "Missing userId or key" });
    return ;
  }
  console.log(userId);
  try {
    const result = await User.updateOne(
      { _id: userId },
      { $set: { avatar: key } }
    );
  
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to save avatar key" });
  }
}