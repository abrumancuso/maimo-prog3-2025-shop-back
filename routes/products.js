import express from "express";
const router = express.Router();
import Product from "../models/products.js";

const findAllProducts = async (req, res) => {
  try {
    const products = await Product.find().select("_id name categories").sort({ createdAt: -1 });
    return res.status(200).send({ message: "todos los productos", products });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todos los productos", error });
  }
};

const findOneProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findOne({ _id: id }).select("_id name categories");
    if (!product) return res.status(404).send({ message: "Producto no encontrado", id });
    return res.status(200).send({ message: "Producto encontrado", product });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error });
  }
};

const addProduct = async (req, res) => {
  const {
    name,
    price,
    condition = "new",
    packaging = "vinyl_only",
    protection = false,
    giftWrap = false,
    categories
  } = req.body;

  try {
    const product = new Product({
      name,
      price,
      condition,
      packaging,
      protection,
      giftWrap,
      categories
    });
    await product.save();

    const created = await Product.findById(product._id).select("_id name categories");
    return res.status(200).send({ message: "Producto creado", product: created });
  } catch (error) {
    res.status(501).json({ message: "Error al crear producto", error });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productToDelete = await Product.findOne({ _id: id }).select("_id name categories");
    if (!productToDelete) {
      return res.status(404).send({ message: "Producto no encontrado", id });
    }

    await Product.deleteOne({ _id: id });
    return res.status(200).send({ message: "Producto eliminado", product: productToDelete });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    price,
    condition,
    packaging,
    protection,
    giftWrap,
    categories
  } = req.body;

  try {
    const productToUpdate = await Product.findOne({ _id: id });
    if (!productToUpdate) {
      return res.status(404).send({ message: "Producto no encontrado", id });
    }

    if (typeof name !== "undefined")        productToUpdate.name = name;
    if (typeof price !== "undefined")       productToUpdate.price = price;
    if (typeof condition !== "undefined")   productToUpdate.condition = condition;
    if (typeof packaging !== "undefined")   productToUpdate.packaging = packaging;
    if (typeof protection !== "undefined")  productToUpdate.protection = protection;
    if (typeof giftWrap !== "undefined")    productToUpdate.giftWrap = giftWrap;
    if (typeof categories !== "undefined")  productToUpdate.categories = categories;

    await productToUpdate.save();

    const updated = await Product.findById(id).select("_id name categories");
    return res.status(200).send({ message: "Producto actualizado", product: updated });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto", error });
  }
};

router.get("/", findAllProducts);
router.get("/:id", findOneProduct);
router.post("/", addProduct);
router.delete("/:id", deleteProduct);
router.put("/:id", updateProduct);

export default router;
