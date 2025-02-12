import Cart from "../../models/Cart";
import Product from "../../models/Product";
import { fetchCartItems } from "@/store/shop/cart-slice";
import logger from "../../utils/logger";
import mongoose, { mongo } from "mongoose";
import { LogOut } from "lucide-react";

// const addToCart = async (req, res) => {
//   try {
//     const { userId, productId, quantity } = req.body;

//     if (!userId || !productId || quantity <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid data provided!",
//       });
//     }

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       cart = new Cart({ userId, items: [] });
//     }

//     const findCurrentProductIndex = cart.items.findIndex(
//       (item) => item.productId.toString() === productId
//     );

//     if (findCurrentProductIndex === -1) {
//       cart.items.push({ productId, quantity });
//     } else {
//       cart.items[findCurrentProductIndex].quantity += quantity;
//     }

//     await cart.save();
//     res.status(200).json({
//       success: true,
//       data: cart,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({
//       success: false,
//       message: "Error",
//     });
//   }
// };
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

const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
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

*/
