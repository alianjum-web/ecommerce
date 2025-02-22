import {Cart} from "../../models/Cart.js";
import {Product} from "../../models/Product.js";
import logger from "../../utils/logger.js";

const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    // validate input

    if (
      !userId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      quantity <= 0
    ) {
      logger.warn("invalid input data provided");
      return res.status(400).json({
        success: false,
        message:
          "Invalid input data. Please provide valid userId, productId, and quantity.",
      });
    }
    // Check if the product exist
    const product = await Product.findById(productId);
    if (!product) {
      logger.warn(`Product not found: ${productId}`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    let cart = await Cart.findById({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
      logger.info(`New cart created for user: ${userId}`);
    }

    // Check if the product already exist in the cart
    const productInCartExists = cart.items.findIndex(
      (item) => item.productId.toString() === productId // Converts item.productId (which is usually an ObjectId) to a string.
    );
    // findIndex:moves through items array: return 1 if found otherwise -1
    if (productInCartExists === -1) {
      // Add new product to cart
      cart.items.push({ productId, quantity });
      logger.info(`Product added to cart: ${productId}`);
    } else {
      // Update quantity of existing product
      cart.items[findCurrentProductIndex].quantity += quantity;
      logger.info(`Product quantity updated in cart : ${productId}`);
    }
    await cart.save();

    // Return success responses
    logger.info(`Cart updated successfully for user: ${userId}`);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    logger.error("Error while adding produt to cart", error);
    res.status(500).json({
      success: false,
      message: "Error while adding product to cart",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.error("Invalid user ID provided!");
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided!",
      });
    }

    const cartData = await Cart.aggregate([
      // Match teh cart of given userId
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      // Unwind the items array to deal with each items separately
      { $unwind: "$items" },
      // Look up to fetch the product details for each item in the cart
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },

      // Unwind the productDetails array to deal with each product separately
      { $unwind: "$productDetails" },
      // Project (select) only required fields
      {
        $project: {
          _id: 1,
          userId: 1,
          "items.productId": "$productDetails._id",
          "items.image": "$productDetails.image",
          "items.title": "$productDetails.title",
          "items.price": "$productDetails.price",
          "items.salePrice": "$productDetails.salePrice",
          "items.quantity": "$productDetails.quantity",
        },
      },
      // Group back to reconstruct the cart with filtered items
      {
        $grpup: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: { $push: "$items" }, // Reconstruct the items array
        },
      },
    ]);
    //If cart not found
    if (!cartData.length) {
      logger.error("Cart not found!");
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }
    // Return the cart with populte items
    logger.info(`Fetched cart items successfully for user: ${userId}`);
    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    logger.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// updates the quantity of a product in a user's cart.
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Validate input
    if (
      !userId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input data. Please provide valid userId, productId, and quantity.",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      logger.warn("cart not found");
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the index of the product in the cart
    const productIndex = cart.items.findIndex(
      // contain index if found otherwiae -1
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      logger.error("Product not found in the cart");
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    // Update the quantity of the product
    cart.items[productIndex].quantity = quantity;

    // saved the updated cart
    await cart.save();

    // Use aggregation to fetch cart with product details
    const updatedCart = await Cart.aggregate([
      // String received from request,so convert userId to ObjectId for match
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          _id: 1,
          userId: 1,
          "items.productId": 1,
          "items.quantity": 1,
          "items.productDetails": {
            imageUrl: "$productDetails.imageUrl",
            title: "$productDetails.title",
            price: "$productDetails.price",
            salePrice: "$productDetails.salePrice",
          },
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: {
            $push: {
              productId: "$items.productId",
              quantity: "$items.quantity",
              productDetails: "$items.productDetails",
            },
          },
        },
      },
    ]);
    // If cart not found after aggregation
    if (!updatedCart || updatedCart.length === 0) {
      logger.error("Cart not found");
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Return the updated cart
    logger.info("cart updated succesfully ");
    res.status(200).json({
      success: true,
      data: updatedCart[0],
    });
  } catch (error) {
    logger.error("Error updating cart item quantity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    //Validate input
    if (
      !userId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      logger.warn("Invalid input");
      return res.status(400).json({
        success: false,
        message:
          "Invalid input data. Please provide valid userId and productId.",
      });
    }

    // Remove product from cart
    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { productId } } }, // remove the product with productId
      { new: true } // return modified document
    );

    // If cart not found
    if (!updatedCart) {
      logger.warn("Cart not found");
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Use aggregation to fetch cart with product details
    const cartWithDetails = await Cart.aggregate([
      { $match: { _id: updatedCart._id } },
      {
        $lookup: {
          from: "products", // Collection name for product model:mongoDb turn the collection to lowercase plular(eg.products)
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetils" },
      {
        $project: {
          _id: 1,
          userId: 1,
          "items.productId": 1,
          "items.quantity": 1,
          "items.productDetails": {
            imageUrl: "$productDetails.imageUrl",
            title: "productDetails.title",
            price: "$productDetails.price",
            salePrice: "$productDetails.salePrice",
          },
        },
      },
      {
        $grpup: {
          _id: "$id",
          userId: { $first: "$userId" }, // first ensures only one userId is taken per cart (since it's the same for all items).
          //  push collects all items of the cart into an array so that each cart has its products grouped together.
          items: {
            $push: {
              productId: "$items.productId",
              quantity: "$items.quantity",
              productDetails: "$items.productDetails",
            },
          },
        },
      },
    ]);

    if (!cartWithDetails || cartWithDetails.length === 0) {
      logger.warn("cart not found");
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Return teh updated cart
    res.status(200).json({
      success: true,
      data: cartWithDetails[0],
    });
  } catch (error) {
    logger.error("Error deleting cart item:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { addToCart, updateCartItemQty, deleteCartItem, fetchCartItems };

/*  Not more effeicient with populate method


const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      logger.error("Invalid user ID provided!");
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided!",
      });
    }
    // Find the cart and populate product details
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "imageUrl title price salePrice", // Select only required fields
    });

    if (!cart) {
      logger.error("Cart not found!");
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filter out invalid items that no longer exists
    const validItems = cart.items.filter((item) => item.productId);

    //Update cart if invalid items are found
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
      logger.info("Cart updated successfully!");
    }

    // Map items to include onky necessary fields
    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.imageUrl, //Use image from ProductSchema
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

     // Return the cart with populte items
    logger.info(`Fetched cart items successfully for user: ${userId}`);
    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,  // Spreads the original cart document's fields (_id, userId, createdAt, etc.).Mongoose stores actual document data inside cart._doc
        items: populateCartItems,
      },
    });
  } catch (error) {
    logger.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

*/
