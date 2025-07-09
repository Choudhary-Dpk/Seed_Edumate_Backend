import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { healthRoutes, hubspotRoutes } from './routes/hubspot.routes';
import { swaggerRouter } from './config/swagger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Documentation - Make sure this comes before other routes
app.use('/', swaggerRouter);

// API Routes
app.use('/api/v1/hubspot', hubspotRoutes);
app.use('/api/v1/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Edumate Integration API',
        documentation: '/',
        version: '1.0.0'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

const PORT = process.env.PORT || 3031;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // console.log(`API Documentation available at http://localhost:${PORT}/`);
});

export default app;