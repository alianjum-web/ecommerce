import multer from "multer";
import sharp from "sharp";
import cloudinary from "cloudinary";
import multer from 'multer';
import logger from "./logger";

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
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
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) { //filrBuffer is an instanc of buffer classs in node.Buffer:used to handle binary data(image).
    throw new Error("Invalid file buffer")
  }

  try {
    // Resize and convert image using sharp
    const optimizedImageBuffer = await sharp(fileBuffer)
      .resize(800, 800, { fit: "inside", withoutEnlargement: true })  // Resize without enlarging
      .toFormat("webp", { quality: 80 })  // Convert to WEBP with 80% quality
      .toBuffer();
  
    // Upload optimized image to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        { resource_type: "image", folder: "ecommerce-products" },
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload error", error);
          reject(new Error("Cloudinary failed to upload image to cloudinary."));
        } else {
          logger.info("Image uploaded successfully:", result.public_id);
          resolve({
            url: result.secure_url,
            publicId: result.public_id  // Store this in database
          })
        }
      })
  
      uploadStream.end(optimizedImageBuffer); // Send the image to Cloudinary
  
    })
  } catch (error) {
    logger.error("Image optimized error:", error);
    throw new Error("Failed to optimize image.");
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