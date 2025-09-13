import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export class S3Service {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || 'ai-style-editor-images';
  }

  async uploadImage(file: Buffer, originalName: string, folder: string = 'uploads'): Promise<string> {
    const fileExtension = originalName.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file,
      ContentType: `image/${fileExtension}`,
      ACL: 'public-read',
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload image to S3');
    }
  }

  async uploadGeneratedImage(file: Buffer, templateId: string): Promise<string> {
    const fileName = `generated/${templateId}/${uuidv4()}.png`;

    const params = {
      Bucket: this.bucketName,
      Key: fileName,
      Body: file,
      ContentType: 'image/png',
      ACL: 'public-read',
    };

    try {
      const result = await s3.upload(params).promise();
      return result.Location;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error('Failed to upload generated image to S3');
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const key = this.extractKeyFromUrl(imageUrl);
    
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    try {
      await s3.deleteObject(params).promise();
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error('Failed to delete image from S3');
    }
  }

  private extractKeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // Get the last two parts (folder/filename)
  }
}
