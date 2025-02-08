// import cloudinary from "cloudinary";
// import multer from "multer";
// import dotenv from "dotenv";

// dotenv.config();

// cloudinary.v2.config({
//   cloud_name: "dfjytm8hy",
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const storage = new multer.memoryStorage();

// async function imageUploadUtil(file) {
//   const result = await cloudinary.uploader.upload(file, {
//     resource_type: "auto",
//   });

//   return result;
// }

// const upload = multer({ storage });

// export { 
//   upload, 
//   imageUploadUtil 
// };
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import dotenv from "dotenv";
import cloudinary from "cloudinary";
import { multer } from 'multer';

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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only JPEG, PNG, and WEBP images are allowed"));
    }
  },
});

async function imageUploadUtil(fileBuffer) {
  const fileName = `temp-${uuidv4()}.webp`;

  // Resize and convert image using sharp
  const optimizedImageBuffer = await sharp(fileBuffer)
    .resize(800, 800, { fit: "inside" })
    .toFormat("webp")
    .toBuffer();

  // Upload optimized image to Cloudinary
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { resource_type: "image", folder: "ecommerce-products" },
    (error, result) => {
      if (error) {
        reject(new Error("Cloudinary upload failed"));
      } else {
        resolve({
          url: result.secure_url,
          publicId: result.public_id  // Store this in database
        })
      }
    })

    uploadStream.end(optimizedImageBuffer);

  })
}

async function deleteImageFromCloudinary(publicId) {
  try {
    await cloudinary.v2.uploader.destroy(publicId);
    console.log("Image deleted succesfully")
  } catch (error) {
    console.error("Failed to delete image:", error)
  }
}

export {
  upload,
  imageUploadUtil,
  deleteImageFromCloudinary
}