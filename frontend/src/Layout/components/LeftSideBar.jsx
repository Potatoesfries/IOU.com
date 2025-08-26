import { useEffect } from "react";
import { axiosInstance } from "../../lib/axios";
import { useState } from "react";
import moment from "moment";
import {Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter} from "@/components/ui/dialog";
import { CreditCard, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";	
import {ScrollArea} from "@/components/ui/scroll-area"
import {Link } from "react-router";

const DebtLeftSideBar = () => {
    const [debtNotes, setDebtNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [debtDialogOpen, setDebtDialogOpen] = useState(false);

    const [newDebtNote, setNewDebtNote] = useState({
        debtorName: "",
        debtorEmail: "",
        debtorPhone: "",
        amount: "",
        dueDate: "",
        status: "pending"
    });

  const fetchDebtNotes = async()=>{
        try {
          const res = await axiosInstance.get("/debt-notes")
          setDebtNotes(res.data)
        } catch (error) {
          console.log("error fetching debt notes")
        }finally{
          setLoading(false)
        }
      }
    
    const handleSubmit = async ()=>{
      setLoading(true)
      try {
        if(!newDebtNote.debtorName.trim() || !newDebtNote.amount || !newDebtNote.dueDate){
          return toast.error("Please fill in required fields (Name, Amount, Due Date)")
        }

        if(newDebtNote.amount <= 0){
          return toast.error("Amount must be greater than 0")
        }

        await axiosInstance.post("/debt-notes", {
          debtorName: newDebtNote.debtorName,
          debtorEmail: newDebtNote.debtorEmail,
          debtorPhone: newDebtNote.debtorPhone,
          amount: parseFloat(newDebtNote.amount),
          dueDate: newDebtNote.dueDate,
          status: newDebtNote.status
        })
        
        setNewDebtNote({
          debtorName: "",
          debtorEmail: "",
          debtorPhone: "",
          amount: "",
          dueDate: "",
          status: "pending"
        })

        toast.success("Debt record created successfully")
        setDebtDialogOpen(false)
        await fetchDebtNotes()
      } catch (error) {
        toast.error("Failed to add debt record, something went wrong")
      } finally{
        setLoading(false)
      }
    }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'cancelled': return <AlertCircle className="w-4 h-4 text-gray-600" />
      default: return <DollarSign className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-50'
      case 'overdue': return 'text-red-600 bg-red-50'
      case 'cancelled': return 'text-gray-600 bg-gray-50'
      default: return 'text-yellow-600 bg-yellow-50'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const getDaysUntilDue = (dueDate) => {
    const days = moment(dueDate).diff(moment(), 'days')
    if (days < 0) return `${Math.abs(days)} days overdue`
    if (days === 0) return 'Due today'
    return `${days} days left`
  }

  const getTotalDebt = () => {
    return debtNotes
      .filter(debt => debt.status !== 'paid' && debt.status !== 'cancelled')
      .reduce((total, debt) => total + (debt.amount || 0), 0)
  }

  useEffect(()=>{
    fetchDebtNotes()
  },[])

  return (
    <div className="h-screen bg-gradient-to-br from-red-50 to-orange-100 border-r border-gray-200 flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Debt Records</h2>
            <p className="text-sm text-gray-500 mt-1">
              {debtNotes.length} {debtNotes.length === 1 ? 'record' : 'records'}
            </p>
            <p className="text-xs text-red-600 font-medium mt-1">
              Total Outstanding: {formatCurrency(getTotalDebt())}
            </p>
          </div>
          
          <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
            <DialogTrigger asChild>
              <button className="group relative inline-flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 active:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md active:shadow-lg transform hover:scale-105 active:scale-95">
                <CreditCard 
                  className="w-5 h-5 text-gray-600 group-hover:text-red-600 group-active:text-red-700 transition-colors duration-200" 
                />
                <div className="absolute inset-0 rounded-xl bg-red-400 opacity-0 group-active:opacity-20 transition-opacity duration-150"></div>
              </button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Create New Debt Record
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Add a new debt record to track money owed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Debtor Name *
                    </label>
                    <input 
                      type="text"
                      placeholder="Enter name..."
                      value={newDebtNote.debtorName}
                      onChange={(e) => setNewDebtNote({...newDebtNote, debtorName: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Amount *
                    </label>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={newDebtNote.amount}
                      onChange={(e) => setNewDebtNote({...newDebtNote, amount: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Due Date *
                  </label>
                  <input 
                    type="date"
                    value={newDebtNote.dueDate}
                    onChange={(e) => setNewDebtNote({...newDebtNote, dueDate: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Email
                    </label>
                    <input 
                      type="email"
                      placeholder="Enter email..."
                      value={newDebtNote.debtorEmail}
                      onChange={(e) => setNewDebtNote({...newDebtNote, debtorEmail: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 block">
                      Phone
                    </label>
                    <input 
                      type="tel"
                      placeholder="Enter phone..."
                      value={newDebtNote.debtorPhone}
                      onChange={(e) => setNewDebtNote({...newDebtNote, debtorPhone: e.target.value})}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Status
                  </label>
                  <select
                    value={newDebtNote.status}
                    onChange={(e) => setNewDebtNote({...newDebtNote, status: e.target.value})}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <DialogFooter className="flex gap-3 pt-4 border-t border-gray-100">
                <Button 
                  variant="outline" 
                  onClick={() => setDebtDialogOpen(false)} 
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !newDebtNote.debtorName.trim() || !newDebtNote.amount || !newDebtNote.dueDate}
                  className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    "Create Debt Record"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content Section with ScrollArea */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-4"></div>
                <p className="text-gray-500 text-sm">Loading debt records...</p>
              </div>
            ) : debtNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No debt records yet</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Create your first debt record to start tracking money owed to you.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {debtNotes.map((debt, index) => (
                  <Link
                    to={`/debt-notes/${debt._id}`}
                    key={debt._id || index}
                    className="group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 block"
                  >
                    {/* Debt Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-red-700 transition-colors">
                          {debt.debtorName}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getStatusIcon(debt.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(debt.status)}`}>
                            {debt.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">
                          {formatCurrency(debt.amount)}
                        </div>
                      </div>
                    </div>

                    {/* Due Date Info */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        Due: {moment(debt.dueDate).format("MMM D, YYYY")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getDaysUntilDue(debt.dueDate)}
                      </p>
                    </div>

                    {/* Contact Info */}
                    {(debt.debtorEmail || debt.debtorPhone) && (
                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        {debt.debtorEmail && <p>📧 {debt.debtorEmail}</p>}
                        {debt.debtorPhone && <p>📞 {debt.debtorPhone}</p>}
                      </div>
                    )}

                    {/* Debt Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-medium">
                        Created {moment(debt.createdAt).format("MMM D, YYYY")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {moment(debt.createdAt).format("h:mm A")}
                      </span>
                    </div>

                    {/* Hover Accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

export default DebtLeftSideBar