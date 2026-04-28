import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/userRoutes.js";
import expenseRoute from "./routes/expenseRoutes.js";
import incomeRoute from "./routes/incomeRoutes.js";
import patientBillingRoute from "./routes/billingRoutes.js";
import rateLimit from "express-rate-limit";
import statsRoute from "./routes/statsRoutes.js";
import auditRoute from "./routes/auditRoutes.js";
import settingsRoute from "./routes/settingsRoutes.js";
dotenv.config({});

const app = express();

// Trust proxy headers securely
app.set("trust proxy", "loopback, linklocal, uniquelocal");

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: "Too many requests from this IP, please try again after 5 minutes",
});
app.use(limiter);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = ["https://santi-clinic-nursing.vercel.app", "http://localhost:5173"];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
  })
);

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) =>
  res.json({ message: "Server Running", success: true })
);

app.use("/api/user", userRoute);
app.use("/api/expense", expenseRoute);
app.use("/api/income", incomeRoute);
app.use("/api/patient", patientBillingRoute);
app.use("/api/stats", statsRoute);
app.use("/api/audit", auditRoute);
app.use("/api/settings", settingsRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
