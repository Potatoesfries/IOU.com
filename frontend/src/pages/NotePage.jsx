import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import { FileSpreadsheet, SquarePen, DollarSign, User, Mail, Phone, Calendar, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { axiosInstance } from '../lib/axios'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import moment from 'moment'

const DebtNotePage = () => {
  const [currentDebtNote, setCurrentDebtNote] = useState({})
  const [loading, setLoading] = useState(false)
  const { id } = useParams()
 
  const navigate = useNavigate()

const fetchDebtNotesById = async () => {
  setLoading(true)
  
  if (!id) {
    console.log("No ID provided")
    setLoading(false)
    return
  }
  
  
  try {
    const res = await axiosInstance.get(`/debt-notes/${id}`)
    
   
    
    // Check if res.data exists and has content
    if (res.data) {
      setCurrentDebtNote(res.data)
    } else {
      console.log("No data in response")
      toast.error("No debt note data found")
    }
    
  } catch (error) {
    console.log("Error in fetching debt note by id:", error)
    
    if (error.response?.status === 404) {
      toast.error("Debt note not found")
    } else {
      toast.error("Failed to load debt note")
    }
  } finally {
    setLoading(false)
  }
}

  const EditDebtNotesById = async (debtNoteId) => {
    setLoading(true)
    try {
      const updatePayload = {
        debtorName: currentDebtNote.debtorName,
        debtorEmail: currentDebtNote.debtorEmail,
        debtorPhone: currentDebtNote.debtorPhone,
        amount: currentDebtNote.amount,
        dueDate: currentDebtNote.dueDate,
        status: currentDebtNote.status,
        archivedAt: currentDebtNote.archivedAt
      }
      
      const res = await axiosInstance.put(`/debt-notes/${debtNoteId}`, updatePayload)
      setCurrentDebtNote(res.data)
      
      toast.success("Debt note updated successfully")
      setTimeout(() => {
        window.location.reload();
      }, 400)

    } catch (error) {
      console.log("Error in updating debt note by id")
      toast.error("Failed to update debt note")
    } finally {
      setLoading(false)
    }
  }

  const DeleteDebtNotesById = async (debtNoteId) => {
    setLoading(true)
    try {
      const res = await axiosInstance.delete(`/debt-notes/${debtNoteId}`)
      
      toast.success("Debt note deleted successfully")
      
      navigate("/debt-notes")
      setTimeout(() => {
        window.location.reload();
      }, 400)
      
    } catch (error) {
      console.log("Error in deleting debt note by id")
      toast.error("Failed to delete debt note")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  useEffect(() => {
    fetchDebtNotesById(id)
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading debt note...</span>
      </div>
    )
  }

  return (
    <div>
      <Tabs defaultValue="read">
        <div className='flex justify-center mt-6'>
          <TabsList className="flex justify-center">
            <TabsTrigger value="read">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span>View Details</span>
            </TabsTrigger>
            <TabsTrigger value="edit">
              <SquarePen className="w-4 h-4 mr-2"/>  
              <span>Edit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Read Tab */}
        <TabsContent value="read">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl mx-auto mt-6 space-y-6 relative">
            <div className="absolute top-6 right-6 text-xs text-gray-400 text-right">
              <div>{moment(currentDebtNote.createdAt).format("MMM D, YYYY")}</div>
              <div>{moment(currentDebtNote.createdAt).format("h:mm A")}</div>
            </div>
            
            {/* Status Badge */}
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-800">Debt Record</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentDebtNote.status)}`}>
                {currentDebtNote.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>

            {/* Amount Section */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Amount Owed</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(currentDebtNote.amount)}
              </div>
            </div>

            {/* Debtor Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Debtor Information</h3>
                
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Name</div>
                    <div className="font-medium">{currentDebtNote.debtorName || 'N/A'}</div>
                  </div>
                </div>

                {currentDebtNote.debtorEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium">{currentDebtNote.debtorEmail}</div>
                    </div>
                  </div>
                )}

                {currentDebtNote.debtorPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Phone</div>
                      <div className="font-medium">{currentDebtNote.debtorPhone}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Timeline</h3>
                
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Due Date</div>
                    <div className="font-medium">
                      {currentDebtNote.dueDate ? moment(currentDebtNote.dueDate).format("MMM D, YYYY") : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Days Until Due</div>
                    <div className="font-medium">
                      {currentDebtNote.dueDate ? moment(currentDebtNote.dueDate).diff(moment(), 'days') : 'N/A'} days
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 right-6 text-xs text-gray-400 text-right">
              <div>Last updated:</div>
              <div>{moment(currentDebtNote.updatedAt || currentDebtNote.createdAt).format("MMM D, YYYY h:mm A")}</div>
            </div>
          </div>
        </TabsContent>
    
        {/* Edit Tab */}
        <TabsContent value="edit">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl mx-auto mt-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Debt Record</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Debtor Name *</label>
                  <input
                    type="text"
                    value={currentDebtNote.debtorName || ''}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, debtorName: e.target.value })}
                    placeholder="Enter debtor name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={currentDebtNote.debtorEmail || ''}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, debtorEmail: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={currentDebtNote.debtorPhone || ''}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, debtorPhone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentDebtNote.amount || ''}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, amount: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={currentDebtNote.dueDate ? moment(currentDebtNote.dueDate).format('YYYY-MM-DD') : ''}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={currentDebtNote.status || 'pending'}
                    onChange={(e) => setCurrentDebtNote({ ...currentDebtNote, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                onClick={() => DeleteDebtNotesById(id)}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                onClick={() => EditDebtNotesById(id)}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DebtNotePage