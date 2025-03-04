import mongoose from "mongoose";
import {Product} from "../../models/Product.js";
import logger from "../../utils/logger.js";

// get filterd products based on category, brand and sorting order
const getFilteredProducts = async (req, res) => {
  try {
    const { category = "", brand = "", sortBy = "price-lowtohingh" } = req.query;

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

  const products = await Product.find(filters).sort(sort);

  logger.info(`Fetched ${products.length} products with filters: ${JSON.stringify(filters)}`);
res.status(200).json({
  success: true,
  data: products,
})

  } catch (error) {
    logger.error("Error fetching fitered products");
    res.status(500).json({
      success: false,
      message: "Internal sever error",
    })
  }
}

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Invalid id of product"
      })
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
