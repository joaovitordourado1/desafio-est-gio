import { Router } from "express";
import type { AccountController } from "../controllers/account-controller.js";
import { validate } from "../middlewares/validate.js";
import { createAccountSchema, withdrawalSchema } from "../schemas/account-schemas.js";

export function createAccountRouter(controller: AccountController): Router {
  const router = Router();

  router.post("/", validate(createAccountSchema), controller.create);
  router.get("/", controller.list);
  router.post("/:id/withdrawals", validate(withdrawalSchema), controller.withdraw);

  return router;
}
