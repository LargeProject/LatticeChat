import {Router} from "express";
import {validateUser} from "../middleware/authValidation.js";
import {handleGetUserInfo} from "../services/userServices.js";

const router = Router({ mergeParams: true });

router.use(validateUser)
router.get('/info', handleGetUserInfo);

export default router;