import express from 'express';

import { searchProducts } from "../../controllers/shop/search-controller";

const router = express.Router();

router.get("/:keyword", searchProducts);

export default router;
