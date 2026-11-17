/**
 * @swagger
 * {
 *   "/": {
 *     "get": {
 *       "tags": [
 *         "Utilities"
 *       ],
 *       "summary": "API welcome message",
 *       "description": "Returns links to documentation and application health.",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "message": {
 *                     "type": "string"
 *                   },
 *                   "documentation": {
 *                     "type": "string",
 *                     "example": "/api-docs"
 *                   },
 *                   "health": {
 *                     "type": "string",
 *                     "example": "/health"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       }
 *     }
 *   },
 *   "/health": {
 *     "get": {
 *       "tags": [
 *         "Utilities"
 *       ],
 *       "summary": "Application health",
 *       "description": "Returns application status, timestamp, and environment. Does not verify database connectivity.",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Successful operation.",
 *           "content": {
 *             "application/json": {
 *               "schema": {
 *                 "type": "object",
 *                 "properties": {
 *                   "success": {
 *                     "type": "boolean"
 *                   },
 *                   "message": {
 *                     "type": "string"
 *                   },
 *                   "timestamp": {
 *                     "type": "string",
 *                     "format": "date-time"
 *                   },
 *                   "environment": {
 *                     "type": "string",
 *                     "example": "development"
 *                   }
 *                 }
 *               }
 *             }
 *           }
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         },
 *         "500": {
 *           "$ref": "#/components/responses/Error500"
 *         }
 *       }
 *     }
 *   },
 *   "/api-docs": {
 *     "get": {
 *       "tags": [
 *         "Utilities"
 *       ],
 *       "summary": "Swagger UI",
 *       "description": "Interactive API documentation. Open this URL in a browser.",
 *       "security": [],
 *       "responses": {
 *         "200": {
 *           "description": "Swagger UI HTML page.",
 *           "content": {
 *             "text/html": {
 *               "schema": {
 *                 "type": "string"
 *               }
 *             }
 *           }
 *         },
 *         "301": {
 *           "description": "Redirect to the trailing-slash documentation URL."
 *         },
 *         "429": {
 *           "$ref": "#/components/responses/Error429"
 *         }
 *       }
 *     }
 *   }
 * }
 */
const express = require("express");
const path = require("node:path");
require("./config/env");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const cors = require("cors");
const auth = require("./routes/auth");
const workshops = require("./routes/workshops");
const registrations = require("./routes/registrations");

// A hosted API receives every visitor's request through the Next.js server,
// so its per-IP limit is effectively shared by the whole site. A deployment
// may size it explicitly; the supplied default of 100 per 10 minutes remains.
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 100);
if (!Number.isInteger(rateLimitMax) || rateLimitMax < 1) {
  throw new Error("RATE_LIMIT_MAX must be a positive integer.");
}

const app = express();

app.use(helmet());
app.use(hpp());
app.use(rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: rateLimitMax,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL
    : "http://localhost:3000",
  credentials: true,
}));

app.use("/api/v1/auth", auth);
app.use("/api/v1/workshops", workshops);
app.use("/api/v1/registrations", registrations);

const swaggerDocs = swaggerJsDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Workshop Registration API",
      version: "1.0.0",
      description: "REST API for workshop management and registrations.",
    },
    servers: [{
      url: `http://localhost:${process.env.PORT || 5000}`,
    }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [path.join(__dirname, "routes/*.js"), __filename],
});

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Workshop Registration API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Workshop Registration API",
    documentation: "/api-docs",
    health: "/health",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
});

module.exports = { app };
