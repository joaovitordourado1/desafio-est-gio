import { Router } from "express";
import type { AccountController } from "../controllers/account-controller.js";
import { validate } from "../middlewares/validate.js";
import { transferSchema } from "../schemas/account-schemas.js";

export function createTransferRouter(controller: AccountController): Router {
  const router = Router();

  router.post("/", validate(transferSchema), controller.transfer);

  return router;
}
