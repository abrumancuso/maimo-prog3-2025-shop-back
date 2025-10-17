import "dotenv/config";
import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";
import ordersRoutes from "./routes/orders.js";
import { connectDb } from "./db.js";

const app = express();
connectDb();

app.set("port", process.env.PORT || 4000);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "local"
        ? [`http://${process.env.FRONT_URL}`]
        : [
            `https://${process.env.FRONT_URL}`,
            `https://www.${process.env.FRONT_URL}`,
          ],
    credentials: true,
    exposedHeaders: "Authorization",
  })
);

app.use("/", indexRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);
app.use("/orders", ordersRoutes);

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
