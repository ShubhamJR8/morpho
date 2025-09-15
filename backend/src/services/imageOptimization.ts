import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  compressionLevel?: number;
}

interface OptimizationResult {
  buffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  width: number;
  height: number;
}

export class ImageOptimizationService {
  private readonly DEFAULT_OPTIONS: Required<ImageOptimizationOptions> = {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 85,
    format: 'jpeg',
    compressionLevel: 8
  };

  /**
   * Optimize an image buffer for web use
   */
  async optimizeImage(
    inputBuffer: Buffer,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const opts = { ...this.DEFAULT_OPTIONS, ...options };
    
    try {
      // Get image metadata
      const metadata = await sharp(inputBuffer).metadata();
      const originalSize = inputBuffer.length;

      if (!metadata.width || !metadata.height) {
        throw new Error('Unable to determine image dimensions');
      }

      // Calculate new dimensions while maintaining aspect ratio
      const { width, height } = this.calculateDimensions(
        metadata.width,
        metadata.height,
        opts.maxWidth,
        opts.maxHeight
      );

      // Create optimization pipeline
      let pipeline = sharp(inputBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });

      // Apply format-specific optimizations
      switch (opts.format) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: opts.quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: opts.compressionLevel,
            progressive: true
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({
            quality: opts.quality,
            effort: 6
          });
          break;
        default:
          throw new Error(`Unsupported format: ${opts.format}`);
      }

      // Process the image
      const optimizedBuffer = await pipeline.toBuffer();
      const compressionRatio = ((originalSize - optimizedBuffer.length) / originalSize) * 100;

      return {
        buffer: optimizedBuffer,
        originalSize,
        optimizedSize: optimizedBuffer.length,
        compressionRatio,
        format: opts.format,
        width,
        height
      };

    } catch (error) {
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a thumbnail from an image
   */
  async createThumbnail(
    inputBuffer: Buffer,
    size: number = 300,
    format: 'jpeg' | 'png' | 'webp' = 'jpeg'
  ): Promise<Buffer> {
    try {
      const thumbnailBuffer = await sharp(inputBuffer)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .toFormat(format, {
          quality: 80
        })
        .toBuffer();

      return thumbnailBuffer;
    } catch (error) {
      throw new Error(`Thumbnail creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate and get image metadata
   */
  async getImageMetadata(inputBuffer: Buffer) {
    try {
      const metadata = await sharp(inputBuffer).metadata();
      
      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image format');
      }

      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: inputBuffer.length,
        hasAlpha: metadata.hasAlpha || false,
        channels: metadata.channels,
        density: metadata.density
      };
    } catch (error) {
      throw new Error(`Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert image to different format
   */
  async convertFormat(
    inputBuffer: Buffer,
    targetFormat: 'jpeg' | 'png' | 'webp',
    options: { quality?: number; compressionLevel?: number } = {}
  ): Promise<Buffer> {
    try {
      let pipeline = sharp(inputBuffer);

      switch (targetFormat) {
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: options.quality || 90,
            progressive: true
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: options.compressionLevel || 8,
            progressive: true
          });
          break;
        case 'webp':
          pipeline = pipeline.webp({
            quality: options.quality || 90,
            effort: 6
          });
          break;
      }

      return await pipeline.toBuffer();
    } catch (error) {
      throw new Error(`Format conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image file
   */
  async validateImage(inputBuffer: Buffer): Promise<boolean> {
    try {
      const metadata = await this.getImageMetadata(inputBuffer);
      
      // Check dimensions
      if (metadata.width < 10 || metadata.height < 10) {
        throw new Error('Image too small');
      }

      if (metadata.width > 10000 || metadata.height > 10000) {
        throw new Error('Image too large');
      }

      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (metadata.size > maxSize) {
        throw new Error('File too large');
      }

      // Check supported formats
      const supportedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
      if (!metadata.format || !supportedFormats.includes(metadata.format)) {
        throw new Error('Unsupported image format');
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate new dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;

    let width = originalWidth;
    let height = originalHeight;

    // Scale down if necessary
    if (width > maxWidth) {
      width = maxWidth;
      height = Math.round(width / aspectRatio);
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspectRatio);
    }

    return { width, height };
  }

  /**
   * Generate a unique filename with proper extension
   */
  generateFilename(originalName: string, format?: string): string {
    const extension = format || this.getFileExtension(originalName);
    const uuid = uuidv4();
    return `${uuid}.${extension}`;
  }

  /**
   * Extract file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot + 1).toLowerCase() : 'jpg';
  }

  /**
   * Get optimal format based on image characteristics
   */
  getOptimalFormat(hasAlpha: boolean, size: number): 'jpeg' | 'png' | 'webp' {
    // For large images, prefer WebP for better compression
    if (size > 1024 * 1024) { // > 1MB
      return 'webp';
    }

    // For images with transparency, use PNG
    if (hasAlpha) {
      return 'png';
    }

    // Default to JPEG for photos
    return 'jpeg';
  }
}
