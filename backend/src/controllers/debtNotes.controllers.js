import Debt from "../model/debtNotes.model.js"

export const getAllDebtNotes = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    let debtNotes = await Debt.find({ clerkId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updates = debtNotes.map(async (note) => {
      const due = new Date(note.dueDate);
      due.setHours(0, 0, 0, 0);

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

export const createDebtNotes = async (req, res) => {
  try {
    const clerkId = req.auth.userId;
    const {
      debtorName,
      debtorEmail,
      debtorPhone,
      amount,
      dueDate,
      status,
      debtorAddress,
    } = req.body;

    const debtorProfilePic = req.file ? req.file.path : null;

    const debtNote = new Debt({
      clerkId,
      debtorName,
      debtorEmail,
      debtorPhone,
      debtorAddress,
      debtorProfilePic,
      amount,
      dueDate,
      status,
    });

    const savedDebtNote = await debtNote.save();
    res.status(201).json(savedDebtNote);
  } catch (error) {
    console.log("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteDebtNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const debtNote = await Debt.findOneAndDelete({ _id: id, clerkId: clerkId });

    if (!debtNote) {
      return res.status(404).json({ message: "Debt note not found" });
    }

    res.status(200).json(debtNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDebtNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    // Find the debt note
    const note = await Debt.findOne({ _id: id, clerkId });
    if (!note) {
      return res.status(404).json({ message: "Debt note not found" });
    }

    // Check if this is a contract update
    const isContractUpdate = req.body.interestEnabled !== undefined || 
                            req.body.lateFeeEnabled !== undefined;

    if (isContractUpdate) {
      // Handle contract update
      const {
        interestEnabled,
        interestEveryDays,
        interestChargeAmount,
        lateFeeEnabled,
        lateFeeEveryDays,
        lateFeeChargeAmount,
      } = req.body;

      // Update contract terms
      note.contract = {
        interest: {
          enabled: interestEnabled || false,
          everyDays: interestEnabled ? interestEveryDays : null,
          chargeAmount: interestEnabled ? interestChargeAmount : null,
        },
        lateFee: {
          enabled: lateFeeEnabled || false,
          everyDays: lateFeeEnabled ? lateFeeEveryDays : null,
          chargeAmount: lateFeeEnabled ? lateFeeChargeAmount : null,
        },
        createdAt: note.contract?.createdAt || new Date(),
      };
    } else {
      // Handle regular debt note update
      const {
        debtorName,
        debtorEmail,
        debtorPhone,
        amount,
        dueDate,
        status,
        archivedAt,
        debtorAddress,
        guarantorName,
        guarantorPhone,
      } = req.body;

      // Update profile picture if provided
      if (req.file) {
        note.debtorProfilePic = req.file.path;
      }

      // Update basic fields
      note.set({
        debtorName,
        debtorEmail,
        debtorPhone,
        debtorAddress,
        amount,
        dueDate,
        status,
        archivedAt,
      });

      // Update guarantor information
      if (guarantorName || guarantorPhone) {
        note.guarantor = {
          name: guarantorName || "",
          phone: guarantorPhone || "",
        };
      } else {
        note.guarantor = null;
      }
    }

    const updatedNote = await note.save();
    res.status(200).json(updatedNote);
  } catch (error) {
    console.log("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getDebtNotesById = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const debtNote = await Debt.findOne({ _id: id, clerkId: clerkId });

    if (!debtNote) {
      return res.status(404).json({ message: "Debt note not found" });
    }

    res.status(200).json(debtNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const calculateTotalDue = async (req, res) => {
  try {
    const { id } = req.params;
    const clerkId = req.auth.userId;

    const note = await Debt.findOne({ _id: id, clerkId });
    if (!note) {
      return res.status(404).json({ message: "Debt note not found" });
    }

    const today = new Date();
    const endDate = note.status === "paid" && note.paidAt ? new Date(note.paidAt) : today;
    const createdDate = new Date(note.createdAt);
    const dueDate = new Date(note.dueDate);

    let totalDue = note.amount;
    let interestAmount = 0;
    let lateFeeAmount = 0;

    // -----------------------------
    // Calculate Interest (from creation until today/paid)
    // -----------------------------
    if (note.contract?.interest?.enabled) {
      const daysSinceCreation = Math.floor((endDate - createdDate) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 0) {
        const periods = Math.floor(daysSinceCreation / note.contract.interest.everyDays);
        interestAmount = periods * note.contract.interest.chargeAmount;
      }
    }

    // -----------------------------
    // Calculate Late Fee (only if past due)
    // -----------------------------
    if (note.contract?.lateFee?.enabled && endDate > dueDate) {
      const daysLate = Math.floor((endDate - dueDate) / (1000 * 60 * 60 * 24));
      if (daysLate > 0) {
        const periods = Math.floor(daysLate / note.contract.lateFee.everyDays);
        lateFeeAmount = periods * note.contract.lateFee.chargeAmount;
      }
    }

    totalDue = note.amount + interestAmount + lateFeeAmount;

    res.status(200).json({
      originalAmount: note.amount,
      interestAmount,
      lateFeeAmount,
      totalDue,
      breakdown: {
        daysSinceCreation: Math.floor((endDate - createdDate) / (1000 * 60 * 60 * 24)),
        daysUntilDue: Math.floor((dueDate - endDate) / (1000 * 60 * 60 * 24)),
        daysOverdue: endDate > dueDate ? Math.floor((endDate - dueDate) / (1000 * 60 * 60 * 24)) : 0,
      },
    });
  } catch (error) {
    console.log("Full error:", error);
    res.status(500).json({ message: error.message });
  }
};
