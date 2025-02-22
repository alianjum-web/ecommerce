import { imageUploadUtil, deleteImageFromCloudinary } from "../../helpers/cloudinary.js";
import {Product} from "../../models/Product.js";
import { validateFile } from "../../utils/fileValidation.js"; // Utility for file validation
import { validationResult } from "express-validator";
import logger from "../../utils/logger.js";

const handleImageUpload = async (req, res) => {
  try {
    //check file exists
    if (!req.file) {
      logger.warn("file does not exists");
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    //Validate file type and size
    const validationError = validateFile(req.file); // validateFile if return null means falsy.
    if (!validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:${req.file.minetype};base64,${b64}`;
    const result = await imageUploadUtil(url);

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    logger.error("Error uploading image.", error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      imageUrl,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;


    if (!title || !category || !price || !brand || !totalStock) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and price are required fields.',
      });
    }

    const newlyCreatedProduct = new Product({
      imageUrl,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();
    logger.info(`Product created successfully: ${newlyCreatedProduct._id}`);

    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    logger.error("Error adding product:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfAllPriducts = await Product.find({});

    if (!listOfAllPriducts) {
      logger.warn("No product found");
      return res.status(404).json({
        success: false,
        message: "Unable to find any product",
      });
    }

    res.status(200).json({
      success: true,
      message: listOfAllPriducts,
    });
  } catch (error) {
    logger.error("Erros occured while fetchinthe products", error);
    res.status(500).json({
      success: false,
      message: "Error occured while fetching products",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; // fields as object:  updates

    if (!id) {
      logger.warn("ID is not provided");
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      logger.warn("Product with this id is not present in db");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // HANDLE specific fields update with default values
    if (updates.price === "") updates.price = 0;
    if (updates.salePrice === "") updates.salePrice = 0;

    // Update only the fields provided in request
    Object.keys(updates).forEach((key) => {
      product[key] = updates[key];
    });
    // save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    logger.error("Error editing product:", error);
    res.status(500).json({
      success: false,
      message: "An error occured while editing product",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      logger.warn("id is required");
      return res.status(400).json({
        success: false,
        message: "Image is required",
      })
    }

    const product = await Product.findById(id);

    if (!product) {
      logger.warn("No product found");
      return res.status(403).json({
        success: false,
        message: "Product not foundin db",
      })
    }

    // delete image from cloudinary
    if (product.imagePublicId) {
      await deleteImageFromCloudinary(product.imagePublicId);
      logger.info(`image deleted from cloudinary with publicId:${imagePublicId} successfully`)
    }
    // Delete product from db
    await Product.findByIdAndDelete(id);

    //send return response
    logger.info(`Image deleted successfully: ${id}`)
    res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    })
  } catch (error) {
    logger.error('Error encountered while deleting image');
    res.status(500).json({
      success: false,
      message: "Error encountered while deleting image",
    })
  }
}

export {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};


/*  Another method to update product

//If title is provided (not undefined, null, or ""), it is used.
Otherwise, the existing product.title is kept.

const updates = {
  title: title || product.title,
  description: description || product.description,
  category: category || product.category,
  brand: brand || product.brand,
  price: price === "" ? 0 : price || product.price,
  salePrice: salePrice === "" ? 0 : salePrice || product.salePrice,
  totalStock: totalStock || product.totalStock,
  image: image || product.image,
  averageReview: averageReview || product.averageReview,
};

// Apply updates to the product
Object.assign(product, updates);

// Object.assign() is used to copy the properties from one or more source objects (updates) to a target object (product)

*/

// const editProduct = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       image,
//       title,
//       description,
//       category,
//       brand,
//       price,
//       salePrice,
//       totalStock,
//       averageReview,
//     } = req.body;

//     let findProduct = await Product.findById(id);
//     if (!findProduct)
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });

//     findProduct.title = title || findProduct.title;
//     findProduct.description = description || findProduct.description;
//     findProduct.category = category || findProduct.category;
//     findProduct.brand = brand || findProduct.brand;
//     findProduct.price = price === "" ? 0 : price || findProduct.price;
//     findProduct.salePrice =
//       salePrice === "" ? 0 : salePrice || findProduct.salePrice;
//     findProduct.totalStock = totalStock || findProduct.totalStock;
//     findProduct.image = image || findProduct.image;
//     findProduct.averageReview = averageReview || findProduct.averageReview;

//     await findProduct.save();
//     res.status(200).json({
//       success: true,
//       data: findProduct,
//     });
//   } catch (e) {
//     console.log(e);
//     res.status(500).json({
//       success: false,
//       message: "Error occured",
//     });
//   }
// };
