import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import donorRoutes from "./routes/donors.js";
import requestRoutes from "./routes/requests.js";
import supportRoutes from "./routes/support.js";
import adminRoutes from "./routes/admin.js";
import campRoutes from "./routes/camps.js";

dotenv.config();
connectDB();

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://sudhanshugaurav05.github.io",
        "https://sudhanshugaurav05.github.io/Blood-Bank-Donor-Management-System",
        "capacitor://localhost",
        "http://localhost",
        "https://localhost",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Blood Bank and Donor Management System API is running.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/donors", donorRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/camps", campRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "API route not found." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
