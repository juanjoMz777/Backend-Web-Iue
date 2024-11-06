import { registroRouter, loginRouter, transaccionRouter, prestamoRouter } from "./servicioBancoRouter.js";
import { Router } from "express";

const router = Router();

router.post("/registro", registroRouter);
router.post("/login", loginRouter);
router.post("/transaccion", transaccionRouter);
router.post("/prestamo", prestamoRouter);


export default router;