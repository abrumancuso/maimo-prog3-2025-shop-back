import express from "express";
import Product from "../models/products.js";
import Category from "../models/category.js";

const router = express.Router();

function calculateFinalPrice(p) {
  let final = Number(p?.price) || 0;
  if (p?.condition === "used") final = final * 0.8;
  if (p?.packaging === "vinyl_with_box") final = final + 6000;
  else if (p?.packaging === "box_only") final = final * 0.25;
  if (p?.protection) final += 1200;
  if (p?.giftWrap) final += 1000;
  return Math.round(final / 100) * 100;
}

const FIELDS = "_id name categories price condition packaging protection giftWrap createdAt";

const findAllProducts = async (req, res) => {
  try {
    const { ids, category } = req.query;
    const query = {};
    if (ids) {
      const list = ids.split(",").map(s => s.trim()).filter(Boolean);
      query._id = { $in: list };
    }
    if (category) {
      let cat = await Category.findOne({ slug: category });
      if (!cat) cat = await Category.findById(category);
      if (!cat) return res.status(404).send({ message: "Categoría no encontrada" });
      query.categories = cat._id;
    }
    const docs = await Product.find(query)
      .select(FIELDS)
      .sort({ createdAt: -1 })
      .populate("categories", "name slug");
    const products = docs.map(d => {
      const p = d.toObject();
      return { ...p, finalPrice: calculateFinalPrice(p) };
    });
    return res.status(200).send({ message: "todos los productos", products });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener todos los productos", error });
  }
};

const findOneProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const d = await Product.findOne({ _id: id })
      .select(FIELDS)
      .populate("categories", "name slug");
    if (!d) return res.status(404).send({ message: "Producto no encontrado", id });
    const product = d.toObject();
    return res.status(200).send({
      message: "Producto encontrado",
      product: { ...product, finalPrice: calculateFinalPrice(product) }
    });
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
    const created = await Product.findById(product._id)
      .select(FIELDS)
      .populate("categories", "name slug");
    const p = created.toObject();
    return res.status(200).send({
      message: "Producto creado",
      product: { ...p, finalPrice: calculateFinalPrice(p) }
    });
  } catch (error) {
    res.status(501).json({ message: "Error al crear producto", error });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const productToDelete = await Product.findOne({ _id: id }).select(FIELDS);
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
    if (typeof name !== "undefined") productToUpdate.name = name;
    if (typeof price !== "undefined") productToUpdate.price = price;
    if (typeof condition !== "undefined") productToUpdate.condition = condition;
    if (typeof packaging !== "undefined") productToUpdate.packaging = packaging;
    if (typeof protection !== "undefined") productToUpdate.protection = protection;
    if (typeof giftWrap !== "undefined") productToUpdate.giftWrap = giftWrap;
    if (typeof categories !== "undefined") productToUpdate.categories = categories;
    await productToUpdate.save();
    const updated = await Product.findById(id)
      .select(FIELDS)
      .populate("categories", "name slug");
    const p = updated.toObject();
    return res.status(200).send({
      message: "Producto actualizado",
      product: { ...p, finalPrice: calculateFinalPrice(p) }
    });
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

