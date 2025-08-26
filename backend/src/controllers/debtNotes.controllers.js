import Debt from "../model/debtNotes.model.js"

export const getAllDebtNotes = async (req, res) => {
    try {
        const debtNotes = await Debt.find()
        res.status(200).json(debtNotes)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const createDebtNotes = async(req, res) => {
    try {
        // destructure the data from the body
        const {debtorName, debtorEmail, debtorPhone, amount, dueDate, status} = req.body

        // create new debt note by using the model and then place those data into a new debt object 
        const debtNote = new Debt({
            debtorName, 
            debtorEmail, 
            debtorPhone, 
            amount, 
            dueDate, 
            status
        }) 
        
        // save the debt note using the debtNote.save() function it will be saved to the debt database
        const savedDebtNote = await debtNote.save()
        
        // send a response with a status of 201 which mean created successful 
        res.status(201).json(savedDebtNote)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const deleteDebtNotes = async (req, res) => {
    try {
        const {id} = req.params
        const debtNote = await Debt.findByIdAndDelete(id) 
        
        if(!debtNote){
            return res.status(404).json({message: "Debt note not found"})
        }
        
        res.status(200).json(debtNote)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

export const updateDebtNotes = async (req, res) => {
    try {
        const {id} = req.params
        const { debtorName, debtorEmail, debtorPhone, amount, dueDate, status, archivedAt} = req.body
        
        const debtNote = await Debt.findByIdAndUpdate(id, {
            debtorName, 
            debtorEmail, 
            debtorPhone, 
            amount, 
            dueDate, 
            status,
            archivedAt
        }, { new: true }) // Returns the updated document
        
        if(!debtNote){
            return res.status(404).json({message: "Debt note not found"})
        }
        
        res.status(200).json(debtNote)
    } 
    catch (error) {
        res.status(500).json({message: error.message})  
    }
}

export const getDebtNotesById = async (req, res) => {
    try {
        const {id} = req.params
        
        const debtNote = await Debt.findById(id)

        if(!debtNote){
            return res.status(404).json({message: "Debt note not found"})
        }

        res.status(200).json(debtNote)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

