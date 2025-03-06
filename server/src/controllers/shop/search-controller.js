import { Product } from "../../models/Product.js";
import logger from "../../utils/logger.js";


// Utility function to escape special regex characters
const escapeRegex = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;
    let { page = 1, limit = 10 } = req.query;

    // Validate keyword
    if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be a non-empty string",
      });
    }

    // Convert page and limit to numbers; parseInt; convert string to int
    page = Math.max(1, parseInt(page)); // Ensure page is at least 1
    limit = Math.min(50, Math.max(1, parseInt(limit))); // Limit between 1-50..  Math.min(50, ...) → Limits the maximum number of results to 50

    // Trim and escape special characters
    const sanitizedKeyword = escapeRegex(keyword.trim());

    // Ensure keyword is not too long
    if (sanitizedKeyword.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Keyword is too long. Please use a shorter search term.",
      });
    }

    let searchQuery = {};
    let searchResults = [];

    // Check if the environment is production
    const isProduction = process.env.NODE_ENV === "production";

    if (isProduction) {
      // MongoDB full-text search operator that searches for keyword
      searchQuery = { $text: { $search: sanitizedKeyword } };

      // Search and return paginated results with relevance score
      searchResults = await Product.find(searchQuery, { score: { $meta: "textScore" } }) // return score based on relevence by Mongo Full text 
        .sort({ score: { $meta: "textScore" } }) // Sort by relevance
        .skip((page - 1) * limit) // Pagination
        .limit(limit);
    } else {
      // **Development/Small Projects: Use Regex Search**
      searchQuery = {
        $or: [
          { title: { $regex: sanitizedKeyword, $options: "i" } },
          { description: { $regex: sanitizedKeyword, $options: "i" } },
          { category: { $regex: sanitizedKeyword, $options: "i" } },
          { brand: { $regex: sanitizedKeyword, $options: "i" } },
        ],
      };

      searchResults = await Product.find(searchQuery)
        .skip((page - 1) * limit)
        .limit(limit);
    }

    // Count total results for pagination
    const totalResults = await Product.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalResults / limit);

    // Log the search event
    logger.info(
      `Found ${searchResults.length} products for keyword: "${sanitizedKeyword}" (Page: ${page})`
    );

    // Return paginated response
    res.status(200).json({
      success: true,
      data: searchResults,
      pagination: {
        totalResults,
        totalPages,
        currentPage: page,
        pageSize: limit,
      },
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
