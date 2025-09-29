import { Router } from 'express';
import { authCallBack, updateProfile } from '../controllers/auth.controllers.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import parser from "../middleware/upload.middleware.js";

const router = Router();

router.post('/callback', authCallBack);
router.put('/update-profile', ClerkExpressRequireAuth(), parser.single("profileImage"), updateProfile);

export default router;