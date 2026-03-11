import {Router} from "express";
import {handleLogin, handleLogout, handleRegister} from "../services/authServices.js";

const router = Router();

router.post('/register', handleRegister);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);

export default router;