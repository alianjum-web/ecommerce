import {Product} from "../../models/Product.js";
import logger from "../../utils/logger.js";

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    // validate keyword
    if (!keyword || typeof keyword != "string" || keyword.trim() === "") {
      return res.status(404).json({
        success: false,
        message: "Keyword is required and must not be an empty string",
      });
    }

    // sentize the keyword
    const sanitizedKeyword = keyword.replace(/[^\w\s]/gi, ""); // remove special character by space

    const regEx = new RegExp(sanitizedKeyword);

    //build search query
    const searchQuery = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { brand: regEx },
      ],
    };

    const searchResults = await Product.find(searchQuery);
    //  return success repsonse
    logger.info(
      `Found ${searchResults.length} products for keyword: ${sanitizedKeyword}`
    );
    res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    logger.error(`Error searching products:`, error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default searchProducts;
