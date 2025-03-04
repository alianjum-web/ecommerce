import mongoose from "mongoose";
import { Product } from "../../models/Product.js";
import logger from "../../utils/logger.js";

// get filterd products based on category, brand and sorting order
const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohingh",
      page = 1,
      limit = 10,
    } = req.query;
// const { page, limit } = req.query;  get it from frontend and paresint() to convert string->num as query return string
    let filters = {};

    if (category) {
      filters.category = { $in: category.split(",") }; // split comma-separated values into an array
    }

    // Filter by brand (if provided)
    if (brand) {
      filters.brand = { $in: brand.split(",") }; // Split comma-separated values into an array
    }
    // build  sort object

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1; // Sort by price in ascending order
        break;
      case "price-hightolow":
        sort.price = -1; // by price descending order
        break;
      case "title-atoz":
        sort.title = 1; // by price descending order
        break;
      case "title-ztoa":
        sort.title = -1; // by price descending order
        break;
      default:
        sort.price = 1; // Default to sorting by price in ascending order
        break;
    }

    // Pagination logic  if page = 3 , llimit = 10
    const pageNumber = parseInt(page, 10) || 1; // 3
    const pageSize = parseInt(limit, 10) || 10; // 10
    const skip = (pageNumber - 1) * pageSize; // (3 -1) * 10 = 20, skip them

    // Fetch optimized query with case-insensitive sorting
    const products = await Product.find(filters)
      .collation({ locale: "en", strength: 2 }) // Case-insensitive sorting
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(); // Convert too plain JSON for better performance

    // Count total products matching filters
    const totalProducts = await Product.countDocuments(filters);

    logger.info(
      `Fetched ${totalProducts} products with filters: ${JSON.stringify(
        filters
      )}`
    );
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    logger.error("Error fetching fitered products");
    res.status(500).json({
      success: false,
      message: "Internal sever error when fetching filtered products",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid id of product",
      });
    }

    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

export { getFilteredProducts, getProductDetails };

/*
parseInt(string, radix);
The first argument (string) → The value we want to convert (e.g., "3", "10", etc.).
The second argument (radix) → The base in which to parse the number (usually 10 for decimal numbers).

*/