import Router from "express"
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { getAllDebtNotes, createDebtNotes, deleteDebtNotes, updateDebtNotes, getDebtNotesById, calculateTotalDue } from "../controllers/debtNotes.controllers.js"
import parser from "../middleware/upload.middleware.js";

const router = Router()

// Apply Clerk authentication to all routes in this router
router.use(ClerkExpressRequireAuth())

router.get("/", getAllDebtNotes)
router.post("/", parser.single("debtorProfilePic"), createDebtNotes);
router.get("/:id", getDebtNotesById)
router.delete("/:id", deleteDebtNotes)
router.put("/:id", parser.single("debtorProfilePic"), updateDebtNotes);
router.get('/:id/calculate', calculateTotalDue);

export default router