import express from "express";
import Category from "../models/category.js";
 
const router = express.Router();
 
router.post("/", async (req, res) => {
  try {
    const { name, slug } = req.body;
    const category = new Category({ name, slug });
    await category.save();
    return res.status(201).send({ message: "Categoría creada", category });
  } catch (error) {
    return res.status(500).send({ message: "Hubo un error", error });
  }
});
 
router.get("/", async (_req, res) => {
  try {
    const categories = await Category.find().select("_id name slug");
    return res.status(200).send({ message: "Todas las categorías", categories });
  } catch (error) {
    return res.status(500).send({ message: "Hubo un error", error });
  }
});

router.get("/:key/products", async (req, res) => {
  const { key } = req.params;
  try {
    const isId = key.match(/^[0-9a-fA-F]{24}$/);
    const category = isId
      ? await Category.findById(key)
      : await Category.findOne({ slug: key });
 
    if (!category) return res.status(404).send({ message: "Categoría no encontrada" });
 
    const products = await (await import("../models/products.js")).default
      .find({ categories: category._id })
      .select("_id name categories")
      .populate("categories", "name slug");
 
    return res.status(200).send({
      message: "Productos por categoría",
      category: { _id: category._id, name: category.name, slug: category.slug },
      products
    });
  } catch (error) {
    return res.status(500).send({ message: "Hubo un error", error });
  }
});
 //probando otra vez
export default router;
