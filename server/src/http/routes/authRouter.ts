import {Router} from "express";
import {handleEmailVerify, handleLogin, handleLogout, handleSignUp} from "../services/authServices.js";
import {validateSignUp} from "../middleware/authValidation.js";

const router = Router();

router.post('/signup', validateSignUp, handleSignUp);
router.post('/login', handleLogin);
router.post('/logout', handleLogout);
router.get('/verify-email', handleEmailVerify);

export default router;