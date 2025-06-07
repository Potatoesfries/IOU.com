import Note from "../model/note.model.js"

export const getAllNotes =  async (req, res) => {
    try {
        const notes = await Note.find()
        res.status(200).json(notes)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    

}

export const createNotes = async(req, res) => {

    try {
        // destructure the data from the body
    const {title, content} = req.body

    // create new note by using the model and then place those data into a new note object 
    const note = new Note({title, content}) 
    // save the note using the note.save() function it will be saved to the note database
    const saveNote = await note.save()
    // send a response with a status of 201 which mean created successful 
    res.status(201).json(saveNote)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
    
    
}

export const deleteNotes = async (req, res) => {
    try {
    const {id} = req.params
    const note = await Note.findByIdAndDelete(id) 
    res.status(200).json(note)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const updateNotes = async (req, res) => {
    
    try {
    const {id} = req.params
    const {title, content} = req.body
    const note = await Note.findByIdAndUpdate(id,{title,content})
    res.status(200).json(note)
    } 
    catch (error) {
    res.status(500).json({message: error.message})  
    }
    
}

export const getNotesById = async (req, res)=>{
    try {
        const {noteId} = req.params
        
        const note = await Note.findById(noteId)

        if(!note){
            return res.status(404).json({message: "note not found"})
        }

        res.status(200).json(note)
    } catch (error) {
        next(error)
    }
}