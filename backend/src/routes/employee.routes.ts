import { Router, Request, Response, NextFunction } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { validate } from '../middleware/validation';
import {
  createOrderSchema,
  orderQuerySchema,
  orderIdSchema,
  dummyUpiPaymentSchema,
  vendorOrderQuerySchema,
} from '../validators/order.schemas';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireEmployee } from '../middleware/rbac';

const router = Router();

const wrap = (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res).catch(next);

router.use(authenticate, requireEmployee);

router.get('/vendors', validate(vendorOrderQuerySchema), wrap(employeeController.listVendors));
router.get('/vendors/:id', wrap(employeeController.getVendor));
router.get('/vendors/:id/menu', wrap(employeeController.getVendorMenu));

router.post('/orders', validate(createOrderSchema), wrap(employeeController.createOrder));
router.get('/orders', validate(orderQuerySchema), wrap(employeeController.listOrders));
router.get('/orders/:id', validate(orderIdSchema), wrap(employeeController.getOrder));
router.post('/orders/:id/pay', validate(dummyUpiPaymentSchema), wrap(employeeController.dummyUpiPayment));
router.get('/orders/:id/qr', validate(orderIdSchema), wrap(employeeController.getOrderQR));

export default router;