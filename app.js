import "dotenv/config";
import express from "express";
import cors from "cors";
import indexRoutes from "./routes/index.js";
import productsRoutes from "./routes/products.js";
import categoriesRoutes from "./routes/categories.js";

/* Clear the console  */
console.log("\x1Bc");

const app = express();

// DB Connection
import { connectDb } from "./db.js";
connectDb();

/* Settings */
app.set("port", process.env.PORT || 4000);

/* Middlewares */
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

/* Routes */
app.use("/", indexRoutes);
app.use("/products", productsRoutes);
app.use("/categories", categoriesRoutes);

/* Error handler  */
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({ message: err.message || "error" });
});

/* Starting server */
app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});
