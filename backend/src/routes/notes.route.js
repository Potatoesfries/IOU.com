import Router from "express"
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { getAllDebtNotes, createDebtNotes, deleteDebtNotes, updateDebtNotes, getDebtNotesById } from "../controllers/debtNotes.controllers.js"

const router = Router()

// Apply Clerk authentication to all routes in this router
router.use(ClerkExpressRequireAuth())

router.get("/", getAllDebtNotes)
router.post("/", createDebtNotes)
router.get("/:id", getDebtNotesById)
router.delete("/:id", deleteDebtNotes)
router.put("/:id", updateDebtNotes)

export default router