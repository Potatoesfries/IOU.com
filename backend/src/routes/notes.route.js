import Router from "express"
import { getAllDebtNotes, createDebtNotes, deleteDebtNotes, updateDebtNotes, getDebtNotesById } from "../controllers/debtNotes.controllers.js"

const router = Router()

router.get("/", getAllDebtNotes)
router.post("/", createDebtNotes)
router.get("/:id", getDebtNotesById)
router.delete("/:id", deleteDebtNotes)
router.put("/:", updateDebtNotes)

export default router