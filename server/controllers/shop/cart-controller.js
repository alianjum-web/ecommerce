import mongoose from "mongoose";
import { Cart } from "../../models/Cart.js";
import { Product } from "../../models/Product.js";
import logger from "../../utils/logger.js";

const addToCart = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // const { userId, productId, quantity } = req.body;
    const userId = req.user.id; // get userId from JWT authnticated token
    const { productId } = req.params;
    const { quantity } = req.body;
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

    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId, items: [] } }, // create if not exist
      { new: true, upsert: true, session } // Atomic operation
    );

    // Check if the product already exist in the cart
    const productInCartExists = cart.items.findIndex(
      (item) => item.productId.toString() === productId // Converts item.productId (which is usually an ObjectId) to a string.
    );
    // findIndex:moves through items array: return 1 if found otherwise -1
    if (productInCartExists === -1) {
      // Add  product with fresh quantity
      cart.items.push({ productId, quantity: 1 }); // reset to 1
      logger.info(`Product added to cart: ${productId}`);
    } else {
      // Update quantity of existing product
      cart.items[productInCartExists].quantity += quantity;
      logger.info(`Product quantity updated in cart : ${productId}`);
    }
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Return success responses
    logger.info(`Cart updated successfully for user: ${userId}`);
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
      // Match the cart of given userId
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },

      // Unwind the items array to deal with each item separately
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
      {
        $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
      },

      // Project (select) only required fields
      {
        $project: {
          _id: 1,
          userId: 1,
          "items.productId": "$items.productId", // Corrected productId
          "items.imageUrl": "$productDetails.imageUrl",
          "items.title": "$productDetails.title",
          "items.price": "$productDetails.price",
          "items.salePrice": "$productDetails.salePrice",
          "items.quantity": "$items.quantity", // Corrected quantity
        },
      },

      // Group back to reconstruct the cart with filtered items
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: { $push: "$items" }, // Reconstruct the items array
        },
      },
    ]);

    // If cart not found
    if (!cartData.length) {
      logger.error("Cart not found!");
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Return the cart with populated items
    logger.info(`Fetched cart items successfully for user: ${userId}`);
    res.status(200).json({
      success: true,
      data: cartData[0], // Return the first (and only) grouped cart result
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
    const { quantity } = req.body;
    const { productId } = req.params;
    const userId = req.user.id;

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
    // const userObjectId = new mongoose.Types.ObjectId(userId);

    // const updatedCart = await Cart.aggregate([
    //   // Convert userId string to ObjectId and match it
    //   { $match: { userId: userObjectId } },

    //   // Deconstruct items array to handle each item separately
    //   { $unwind: "$items" },

    //   // Join products collection to get product details
    //   {
    //     $lookup: {
    //       from: "products",  // Make sure this is the correct collection name
    //       localField: "items.productId",
    //       foreignField: "_id",
    //       as: "productDetails",
    //     },
    //   },

    //   // Unwind productDetails (allow empty values to avoid errors)
    //   { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },

    //   // Restructure the output
    //   {
    //     $project: {
    //       _id: 1,
    //       userId: 1,
    //       "items.productId": 1,
    //       "items.quantity": 1,
    //       "items.productDetails": {
    //         imageUrl: "$productDetails.imageUrl",
    //         title: "$productDetails.title",
    //         price: "$productDetails.price",
    //         salePrice: "$productDetails.salePrice",
    //       },
    //     },
    //   },

    //   // Re-group items back into an array under the userId
    //   {
    //     $group: {
    //       _id: "$_id",
    //       userId: { $first: "$userId" },
    //       items: { $push: "$items" },
    //     },
    //   },
    // ]);

    // Fetch the updated cart with product details using populate()
    const updatedCart = await Cart.findOne({ userId }).populate(
      "items.productId",
      "imageUrl title price salePrice"
    );

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
    const { productId } = req.params;
    const userId = req.user.id;

    // Validate input
    if (
      !userId ||
      !productId ||
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId or productId.",
      });
    }

    //By converting the productId to an ObjectId, the $pull operation can correctly match and remove the item from the items array.
    const productObjId = new mongoose.Types.ObjectId(productId);

    // Remove product from cart
    const updatedCart = await Cart.findOneAndUpdate(
      // If u use updateOneAndDelete and in end new true than it store the document in the array that you pulled out => so, not deleted
      { userId },
      { $pull: { items: { productId: productObjId } } },
      { new: true } // Return the modified cart
    );

    // If cart not found
    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    // If cart is empty after removal, delete the entire cart
    if (updatedCart.items.length === 0) {
      await Cart.deleteOne({ _id: updatedCart._id });
      return res.status(200).json({
        success: true,
        message: "Cart was empty and has been deleted.",
        data: null, // Explicitly return null for the cart
      });
    }

    // Fetch the updated cart with product details (only if the cart was not deleted)
    const cartWithDetails = await Cart.aggregate([
      { $match: { _id: updatedCart._id } },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: {
          path: "$items",
          preserveNullAndEmptyArrays: true, // Prevents errors if items array is empty
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "items.productDetails",
        },
      },
      { $unwind: "$items.productDetails" },
      {
        $project: {
          _id: 1,
          userId: 1,
          "items.productId": 1,
          "items.quantity": 1,
          "items.productDetails.imageUrl": 1,
          "items.productDetails.title": 1,
          "items.productDetails.price": 1,
          "items.productDetails.salePrice": 1,
        },
      },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          items: { $push: "$items" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: cartWithDetails.length > 0 ? cartWithDetails[0] : updatedCart,
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
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
