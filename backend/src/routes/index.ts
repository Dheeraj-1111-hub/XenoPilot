import { Router } from 'express';
import customerRoutes from './customers';
import campaignRoutes from './campaigns';
import segmentRoutes from './segments';
import aiRoutes from './ai';
import callbackRoutes from './callbacks';
import analyticsRoutes from './analytics';
import orderRoutes from './orders';
import dashboardRoutes from './dashboard';

const router = Router();

router.use('/customers', customerRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/segments', segmentRoutes);
router.use('/ai', aiRoutes);
router.use('/callbacks', callbackRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/orders', orderRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
