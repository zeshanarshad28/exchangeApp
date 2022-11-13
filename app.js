const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");

const userRoutes = require("./routes/userRoutes");
const coinRoutes = require("./routes/coinsRoutes");
const walletRoutes = require("./routes/walletRoutes");
const coinCirculation = require("./controllers/coinCirculation");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorControllers");

const app = express();

// ===== Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// ======== Data sanitization against XSS (protection from malicious html) use pkg name exactly "xss-clean"
app.use(xssClean());
//  Set Security HTTP Headers======
app.use(helmet());

app.use(bodyParser.json());
app.use(morgan("dev"));

app.use(express.json());
// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/coin", coinRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/coinCirculation", coinCirculation);

// // Handling unhandled routes:
app.all("*", (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

// Error handler middlware
app.use(globalErrorHandler);

module.exports = app;
