import express from 'express';
import { getDoctorRevenue, getFinancialStats } from '../controllers/statsController.js';
import { authenticate, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, allowRoles('admin', 'accountant'), getFinancialStats);
router.get('/doctor-revenue', authenticate, allowRoles('admin', 'accountant'), getDoctorRevenue);

export default router;
