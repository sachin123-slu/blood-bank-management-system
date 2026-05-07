import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import donorRoutes from "./routes/donorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import { swaggerUi, swaggerDocs } from "./openapi/index.js";

dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://bbm-system-92cpcfuq8-sachin123-slus-projects.vercel.app",
    ], // Allow both ports
    credentials: true,
  }),
);

app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

app.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 🧩 Routes

app.use("/api/auth", authRoutes);

app.use("/api/donor", donorRoutes);

app.use("/api/facility", facilityRoutes);

app.use("/api/admin", adminRoutes);

import bloodLabRoutes from "./routes/bloodLabRoutes.js";
app.use("/api/blood-lab", bloodLabRoutes);

import hospitalRoutes from "./routes/hospitalRoutes.js";
app.use("/api/hospital", hospitalRoutes);

// 🗄️ DB Connection
const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/blood_bank_db";
console.log("Connecting to MongoDB URI:", mongoUri);

mongoose
  .connect(mongoUri, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => console.log("MongoDB Connected ✅"))
  .catch((err) => {
    console.error("MongoDB Error ❌", err.message || err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
