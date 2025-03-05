import multer from "multer";
import sharp from "sharp";
import cloudinary from "cloudinary";
import logger from "../utils/logger.js";
import dotenv from "dotenv";
import { validateFile } from "../utils/fileValidation.js";
dotenv.config();

// Configure Cloudinary for image hosting
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//set up memory storage for multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, //limit size to 2MB
  fileFilter: (req, file, cb) => {
   const validationError = validateFile(file);
   if (validationError) {
    cb(new Error(validationError));
   } else {
    cb(null, true) // File is valid
   }
  },
});
/*
  Optimizes and uploads an image to Cloudinary.
  @param {Buffer} fileBuffer - The image file as a Buffer.
  @returns {Promise<{ url: string, publicId: string }>} - The Cloudinary URL and public ID of the uploaded image.
  @throws {Error} - If the upload fails.
 */
async function imageUploadUtil(fileBuffer) {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid file buffer: The provided file is not a valid image.');
  }

  try {
    // console.log("Optimizing image with sharp...");
    const optimizedImageBuffer = await sharp(fileBuffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true }) 
      .toFormat('webp', { quality: 80 })
      .toBuffer();

    // console.log("Optimized image buffer ready, uploading to Cloudinary...");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'ecommerce-products',
        },
        (error, result) => {
          if (error) {
            // console.error('Cloudinary upload error:', error);
            reject(new Error('Failed to upload image to Cloudinary. Please try again.'));
          } else {
            // console.log('Cloudinary upload successful:', result);
            resolve({ url: result.secure_url, publicId: result.public_id });
          }
        }
      );

      uploadStream.end(optimizedImageBuffer);
    });

  } catch (error) {
    // console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image. Please ensure the file is a valid image.');
  }
}


/*
* Deletes an image from Cloudinary using its public ID.
* @param {string} publicId - The public ID of the image to delete.
* @returns {Promise<void>}
* @throws {Error} - If the deletion fails.
*/
async function deleteImageFromCloudinary(publicId) {
  // ensure publicId is not null/empty and is string
  if (!publicId || typeof publicId != "string") {
    throw new Error("Invalid public ID provided.");
  }

  try {
    const result = await cloudinary.v2.uploader.destroy(publicId);
    if (result.result != "ok") {
      throw new Error("Failed to delete image from cloudinary.");
    }
    logger.info("Image deleted successfully");
  } catch (error) {
    logger.error("Cloudinary deletion failed", error)
    throw new Error("Failed to delete image");
  }
}

export {
  upload,
  imageUploadUtil,
  deleteImageFromCloudinary
}