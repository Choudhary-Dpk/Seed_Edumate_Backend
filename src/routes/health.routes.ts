import { Router } from 'express';
import { Request, Response } from 'express';
import { ApiResponse } from '../types';

const healthRouter = Router();

healthRouter.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }
  };

  res.json(response);
});

healthRouter.get('/ready', (req: Request, res: Response) => {
  // Add readiness checks here (database connections, external services, etc.)
  const isReady = true; // Replace with actual readiness checks
  
  if (isReady) {
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'ready',
        timestamp: new Date().toISOString()
      }
    };
    res.json(response);
  } else {
    res.status(503).json({
      success: false,
      message: 'Service not ready'
    });
  }
});

export { healthRouter as healthRoutes };