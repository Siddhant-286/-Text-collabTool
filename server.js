// Importing packages
const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Importing database configuration
const connectDB = require('./config/db');

// Importing routes
const authRoutes = require('./routes/userRoute');
const documentRoutes = require('./routes/documentsRoutes');

// Load environment variables
dotenv.config();

// Connect to the database
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware for security headers
app.use(helmet());

// Configure CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware for logging HTTP requests
app.use(morgan('dev'));

// Middleware for parsing JSON
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message || err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Server port configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
