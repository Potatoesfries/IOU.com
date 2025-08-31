import Debt from "../model/debtNotes.model.js"

export const getAllDebtNotes = async (req, res) => {
    try {
        const clerkId = req.auth.userId; // Changed from req.user.userId to req.auth.userId
        const debtNotes = await Debt.find({ clerkId: clerkId }) // Only get notes for this user
        res.status(200).json(debtNotes)
    } catch (error) {
        console.log("Full error:", error); 
        res.status(500).json({message: error.message})
    }
}

export const createDebtNotes = async(req, res) => {
    try {
        // destructure the data from the body
        const {debtorName, debtorEmail, debtorPhone, amount, dueDate, status} = req.body
        const clerkId = req.auth.userId; // Changed from req.user.userId to req.auth.userId

        // create new debt note by using the model and then place those data into a new debt object 
        const debtNote = new Debt({
            debtorName, 
            debtorEmail, 
            debtorPhone, 
            amount, 
            dueDate, 
            status,
            clerkId: clerkId // Link note to user
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
        const clerkId = req.auth.userId; // Changed from req.user.clerkId to req.auth.userId
        
        // Only delete if note belongs to this user
        const debtNote = await Debt.findOneAndDelete({ _id: id, clerkId: clerkId }) 
        
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
        const clerkId = req.auth.userId; // Changed from req.user.clerkId to req.auth.userId
        
        // Only update if note belongs to this user
        const debtNote = await Debt.findOneAndUpdate(
            { _id: id, clerkId: clerkId }, // Find by ID AND clerkId
            {
                debtorName, 
                debtorEmail, 
                debtorPhone, 
                amount, 
                dueDate, 
                status,
                archivedAt
            }, 
            { new: true } // Returns the updated document
        )
        
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
        const clerkId = req.auth.userId; // Changed from req.user.clerkId to req.auth.userId
        
        // Only get note if it belongs to this user
        const debtNote = await Debt.findOne({ _id: id, clerkId: clerkId })

        if(!debtNote){
            return res.status(404).json({message: "Debt note not found"})
        }

        res.status(200).json(debtNote)
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}