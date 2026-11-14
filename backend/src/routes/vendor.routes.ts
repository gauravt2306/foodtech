import { Router, Request, Response, NextFunction } from 'express';
import * as vendorController from '../controllers/vendor.controller';
import { validate } from '../middleware/validation';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  menuItemQuerySchema,
  menuItemIdSchema,
  toggleAvailabilitySchema,
} from '../validators/menu.schemas';
import {
  vendorOrderQuerySchema,
  orderIdSchema,
  updateOrderStatusSchema,
  handoffOrderSchema,
} from '../validators/order.schemas';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { requireVendor } from '../middleware/rbac';

const router = Router();

const wrap = (fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req as AuthenticatedRequest, res).catch(next);

router.use(authenticate, requireVendor);

router.get('/profile', wrap(vendorController.getProfile));
router.patch('/profile', wrap(vendorController.updateProfile));

router.post('/menu', validate(createMenuItemSchema), wrap(vendorController.createMenuItem));
router.get('/menu', validate(menuItemQuerySchema), wrap(vendorController.listMenuItems));
router.get('/menu/:id', validate(menuItemIdSchema), wrap(vendorController.getMenuItem));
router.patch('/menu/:id', validate(updateMenuItemSchema), wrap(vendorController.updateMenuItem));
router.delete('/menu/:id', validate(menuItemIdSchema), wrap(vendorController.deleteMenuItem));
router.patch('/menu/:id/toggle', validate(toggleAvailabilitySchema), wrap(vendorController.toggleAvailability));

router.get('/orders', validate(vendorOrderQuerySchema), wrap(vendorController.listOrders));
router.get('/orders/:id', validate(orderIdSchema), wrap(vendorController.getOrder));
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), wrap(vendorController.updateOrderStatus));
router.post('/orders/:id/handoff', validate(handoffOrderSchema), wrap(vendorController.handoffOrder));

export default router;