import express from "express";
const router = express.Router();

import Order from "../models/order.js";
import Product from "../models/products.js";

function computeFinalPrice(basePrice, { condition, packaging, protection, giftWrap }) {
  let final = Number(basePrice) || 0;
  if (condition === "used") final *= 0.8;
  if (packaging === "vinyl_with_box") final += 6000;
  else if (packaging === "box_only") final *= 0.25;
  if (protection) final += 1200;
  if (giftWrap) final += 1000;
  return Math.round(final / 100) * 100;
}

router.post("/", async (req, res) => {
  try {
    const { customer, items } = req.body;
    if (!customer?.name || !customer?.email) {
      return res.status(400).send({ message: "Faltan datos del comprador" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).send({ message: "No hay items en la orden" });
    }

    const orderItems = [];
    let totalItems = 0;
    let totalAmount = 0;

    for (const raw of items) {
      const qty = Math.max(1, Number(raw.qty) || 1);
      const options = {
        condition: raw?.options?.condition ?? "new",
        packaging: raw?.options?.packaging ?? "vinyl_only",
        protection: !!raw?.options?.protection,
        giftWrap: !!raw?.options?.giftWrap
      };

      const product = await Product.findById(raw.productId).select("_id name price");
      if (!product) {
        return res.status(404).send({ message: "Producto no encontrado" });
      }

      const unitPrice = computeFinalPrice(product.price, options);
      const lineTotal = unitPrice * qty;

      orderItems.push({
        product: product._id,
        name: product.name,
        basePrice: product.price,
        options,
        unitPrice,
        qty,
        lineTotal
      });

      totalItems += qty;
      totalAmount += lineTotal;
    }

    const order = new Order({
      customer,
      items: orderItems,
      totals: {
        items: totalItems,
        amount: totalAmount,
        currency: "ARS"
      },
      status: "pending"
    });

    await order.save();
    return res.status(201).send({ message: "Orden creada", order });
  } catch (error) {
    return res.status(500).send({ message: "Error al crear la orden", error });
  }
});

export default router;
