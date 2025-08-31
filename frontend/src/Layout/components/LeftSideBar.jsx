import { useEffect, useState } from "react";
import { axiosInstance } from "../../lib/axios";
import moment from "moment";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router";

const LeftSideBar = () => {
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);

  const [newDebtNote, setNewDebtNote] = useState({
    debtorName: "",
    debtorEmail: "",
    debtorPhone: "",
    amount: "",
    dueDate: "",
    status: "pending",
  });

  const fetchDebtNotes = async () => {
    try {
      const res = await axiosInstance.get("/debt-notes");
      setDebtNotes(res.data);
    } catch (error) {
      console.log("error fetching debt notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (
        !newDebtNote.debtorName.trim() ||
        !newDebtNote.amount ||
        !newDebtNote.dueDate
      ) {
        return toast.error(
          "Please fill in required fields (Name, Amount, Due Date)"
        );
      }

      if (newDebtNote.amount <= 0) {
        return toast.error("Amount must be greater than 0");
      }

      await axiosInstance.post("/debt-notes", {
        debtorName: newDebtNote.debtorName,
        debtorEmail: newDebtNote.debtorEmail,
        debtorPhone: newDebtNote.debtorPhone,
        amount: parseFloat(newDebtNote.amount),
        dueDate: newDebtNote.dueDate,
        status: newDebtNote.status,
      });

      setNewDebtNote({
        debtorName: "",
        debtorEmail: "",
        debtorPhone: "",
        amount: "",
        dueDate: "",
        status: "pending",
      });

      toast.success("Debt record created successfully");
      setDebtDialogOpen(false);
      await fetchDebtNotes();
    } catch (error) {
      toast.error("Failed to add debt record, something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <DollarSign className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "text-emerald-700 bg-emerald-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "cancelled":
        return "text-gray-500 bg-gray-100";
      default:
        return "text-amber-700 bg-amber-100";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const getDaysUntilDue = (dueDate) => {
    const days = moment(dueDate).diff(moment(), "days");
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return "Due today";
    return `${days} days left`;
  };

  const getTotalDebt = () => {
    return debtNotes
      .filter((debt) => debt.status !== "paid" && debt.status !== "cancelled")
      .reduce((total, debt) => total + (debt.amount || 0), 0);
  };

  useEffect(() => {
    fetchDebtNotes();
  }, []);

  return (
    <div className="h-screen bg-gray-50 border-r border-gray-200 flex flex-col font-sans">
      {/* Header Section */}
      <div className="p-5 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Debt Records</h2>
            <p className="text-sm text-gray-500 mt-1">
              {debtNotes.length} {debtNotes.length === 1 ? "record" : "records"}
            </p>
            <p className="text-sm text-gray-700 font-medium mt-2">
              Total Outstanding:{" "}
              <span className="font-semibold text-gray-900">
                {formatCurrency(getTotalDebt())}
              </span>
            </p>
          </div>

          <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium border-gray-300"
              >
                <Plus className="w-4 h-4" />
                New
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg rounded-2xl">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  New Debt Record
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                  Add a new debt record to track money owed.
                </DialogDescription>
              </DialogHeader>

              {/* Form */}
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">
                      Debtor Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter name..."
                      value={newDebtNote.debtorName}
                      onChange={(e) =>
                        setNewDebtNote({
                          ...newDebtNote,
                          debtorName: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">
                      Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newDebtNote.amount}
                      onChange={(e) =>
                        setNewDebtNote({
                          ...newDebtNote,
                          amount: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">Due Date *</label>
                  <input
                    type="date"
                    value={newDebtNote.dueDate}
                    onChange={(e) =>
                      setNewDebtNote({ ...newDebtNote, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">Email</label>
                    <input
                      type="email"
                      placeholder="Enter email..."
                      value={newDebtNote.debtorEmail}
                      onChange={(e) =>
                        setNewDebtNote({
                          ...newDebtNote,
                          debtorEmail: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">Phone</label>
                    <input
                      type="tel"
                      placeholder="Enter phone..."
                      value={newDebtNote.debtorPhone}
                      onChange={(e) =>
                        setNewDebtNote({
                          ...newDebtNote,
                          debtorPhone: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm text-gray-600 block">Status</label>
                  <select
                    value={newDebtNote.status}
                    onChange={(e) =>
                      setNewDebtNote({ ...newDebtNote, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => setDebtDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !newDebtNote.debtorName.trim() ||
                    !newDebtNote.amount ||
                    !newDebtNote.dueDate
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 mb-3"></div>
                Loading debt records...
              </div>
            ) : debtNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <CreditCard className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm">No debt records yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Create your first debt record to start tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {debtNotes.map((debt, index) => (
                  <Link
                    to={`/debt-notes/${debt._id}`}
                    key={debt._id || index}
                    className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">
                        {debt.debtorName}
                      </h3>
                      <div className="text-right font-semibold text-gray-800">
                        {formatCurrency(debt.amount)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(debt.status)}
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          debt.status
                        )}`}
                      >
                        {debt.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Due {moment(debt.dueDate).format("MMM D, YYYY")} •{" "}
                      {getDaysUntilDue(debt.dueDate)}
                    </p>

                    {(debt.debtorEmail || debt.debtorPhone) && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        {debt.debtorEmail && <p>📧 {debt.debtorEmail}</p>}
                        {debt.debtorPhone && <p>📞 {debt.debtorPhone}</p>}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default LeftSideBar;
