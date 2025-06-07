import Router from "express"
import { getAllNotes, createNotes, deleteNotes, updateNotes, getNotesById } from "../controllers/notes.controllers.js"

const router = Router()

router.get("/", getAllNotes)
router.post("/", createNotes)
router.get("/:noteId", getNotesById)
router.delete("/:id", deleteNotes)
router.put("/:id", updateNotes)

export default router