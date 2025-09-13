import Debt from "../model/debtNotes.model.js"

export const getAllDebtNotes = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let debtNotes = await Debt.find({ clerkId });

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight

    const updates = debtNotes.map(async (note) => {
      const due = new Date(note.dueDate);
      due.setHours(0, 0, 0, 0);

      // ✅ Only mark overdue if strictly before today
      if (note.status === "pending" && due < today) {
        note.status = "overdue";
        await note.save();
      }
      return note;
    });

    debtNotes = await Promise.all(updates);

    res.status(200).json(debtNotes);
  } catch (error) {
    console.log("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};



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
        console.log("Full error:", error);
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
    const { id } = req.params;
    const { debtorName, debtorEmail, debtorPhone, amount, dueDate, status, archivedAt } = req.body;
    const clerkId = req.auth.userId;

    const note = await Debt.findOne({ _id: id, clerkId });
    if (!note) return res.status(404).json({ message: "Debt note not found" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    let newStatus = status;

    // ✅ Auto-overdue only if dueDate < today
    if (status === "pending" && due < today) {
      newStatus = "overdue";
    }

    note.set({
      debtorName,
      debtorEmail,
      debtorPhone,
      amount,
      dueDate,
      status: newStatus,
      archivedAt,
    });

    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



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