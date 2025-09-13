import { TabsContent } from '@radix-ui/react-tabs'
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs'
import {
  FileSpreadsheet,
  SquarePen,
  DollarSign,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Send,
  AlertTriangle,
  Download,
  FileText,
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { axiosInstance } from '../lib/axios'
import { useParams, useNavigate } from 'react-router'
import toast from 'react-hot-toast'
import moment from 'moment'
import emailjs from '@emailjs/browser'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

const DebtNotePage = () => {
  const [currentDebtNote, setCurrentDebtNote] = useState({})
  const [loading, setLoading] = useState(false)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [selectedEmailType, setSelectedEmailType] = useState('')
  const [emailCooldowns, setEmailCooldowns] = useState({
    upcoming: 0,
    overdue: 0,
    final: 0
  })
  const [sendingEmail, setSendingEmail] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const exportRef = useRef(null)

  // EmailJS Configuration - Updated with correct template parameters
  const EMAILJS_CONFIG = {
    serviceId: 'service_na7yzd2',
    templateId: 'template_6xktqx4',
    publicKey: 'B9XpLCPWtNOeZ2RpM'
  }

  // Email templates configuration
  const emailTemplates = {
    upcoming: {
      subject: 'Payment Reminder - Due Soon',
      greeting: 'We hope this message finds you well.',
      mainMessage: `This is a friendly reminder that your payment of {{amount}} is due on {{dueDate}}. We wanted to give you advance notice to help you plan accordingly.`,
      callToAction: 'Please ensure your payment is submitted by the due date to avoid any late fees.',
      urgency: 'low',
      tone: 'friendly'
    },
    overdue: {
      subject: 'Overdue Payment Notice - Immediate Action Required',
      greeting: 'We need to bring to your attention an overdue payment.',
      mainMessage: `Your payment of {{amount}} was due on {{dueDate}} and is now {{daysOverdue}} days overdue. Please address this matter promptly to avoid additional consequences.`,
      callToAction: 'Please submit your payment immediately or contact us to discuss payment arrangements.',
      urgency: 'high',
      tone: 'firm'
    },
    final: {
      subject: 'FINAL NOTICE - Immediate Payment Required',
      greeting: 'This is our final attempt to resolve this matter amicably.',
      mainMessage: `Your payment of {{amount}} is significantly overdue (due date: {{dueDate}}). This is your final notice before we may be forced to take further action.`,
      callToAction: 'You must contact us within 48 hours to resolve this matter or face potential legal action.',
      urgency: 'critical',
      tone: 'serious'
    }
  }

  const fetchDebtNotesById = async () => {
    setLoading(true)
    if (!id) {
      console.log('No ID provided')
      setLoading(false)
      return
    }
    try {
      const res = await axiosInstance.get(`/debt-notes/${id}`)
      if (res.data) {
        setCurrentDebtNote(res.data)
      } else {
        toast.error('No debt note data found')
      }
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Debt note not found')
      } else {
        toast.error('Failed to load debt note')
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
        archivedAt: currentDebtNote.archivedAt,
      }
      const res = await axiosInstance.put(`/debt-notes/${debtNoteId}`, updatePayload)
      setCurrentDebtNote(res.data)
      toast.success('Debt note updated successfully')
      setTimeout(() => {
        window.location.reload()
      }, 400)
    } catch (error) {
      toast.error('Failed to update debt note')
    } finally {
      setLoading(false)
    }
  }

  const DeleteDebtNotesById = async (debtNoteId) => {
    setLoading(true)
    try {
      await axiosInstance.delete(`/debt-notes/${debtNoteId}`)
      toast.success('Debt note deleted successfully')
      navigate('/')
      setTimeout(() => {
        window.location.reload()
      }, 400)
    } catch (error) {
      toast.error('Failed to delete debt note')
    } finally {
      setLoading(false)
    }
  }
  // PDF export using html-to-image + jsPDF
  const exportAsPDF = async () => {
    if (!exportRef.current) {
      toast.error('Export element not found')
      return
    }

    setExporting(true)
    try {
      const { toPng } = await import("html-to-image")
      const { jsPDF } = await import("jspdf")

      const element = exportRef.current

      // Generate high-quality PNG
      const imgData = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2, // higher = sharper
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const img = new Image()
      img.src = imgData
      await new Promise((resolve) => (img.onload = resolve))

      const ratio = Math.min(
        (pdfWidth - 20) / img.width,
        (pdfHeight - 20) / img.height
      )
      const finalWidth = img.width * ratio
      const finalHeight = img.height * ratio
      const x = (pdfWidth - finalWidth) / 2
      const y = 10 // margin top

      pdf.addImage(img, "PNG", x, y, finalWidth, finalHeight)

      const fileName = `${currentDebtNote.debtorName?.replace(/\s+/g, '-') || 'record'}-${moment().format('YYYY-MM-DD')}.pdf`
      pdf.save(fileName)

      toast.success("PDF exported successfully!")
    } catch (error) {
      console.error("Export error:", error)
      toast.error(`PDF export failed: ${error.message}`)
    } finally {
      setExporting(false)
    }
  }


  // Check if email type is on cooldown
  const isEmailOnCooldown = (emailType) => {
    const cooldownTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    return Date.now() - emailCooldowns[emailType] < cooldownTime
  }

  // Get remaining cooldown time in minutes
  const getCooldownTimeRemaining = (emailType) => {
    const cooldownTime = 5 * 60 * 1000
    const remaining = cooldownTime - (Date.now() - emailCooldowns[emailType])
    return Math.ceil(remaining / (60 * 1000))
  }

  // Handle email type selection
  const handleEmailTypeSelect = (emailType) => {
    if (isEmailOnCooldown(emailType)) {
      const remainingMinutes = getCooldownTimeRemaining(emailType)
      toast.error(`Please wait ${remainingMinutes} minutes before sending another ${emailType} reminder`)
      return
    }

    if (!currentDebtNote.debtorEmail) {
      toast.error('No email address found for this debtor')
      return
    }

    setSelectedEmailType(emailType)
    setEmailDialogOpen(false)
    setConfirmDialogOpen(true)
  }

  // Send email using EmailJS - Updated to match template variables
  const sendEmailReminder = async () => {
    setSendingEmail(true)

    try {
      const template = emailTemplates[selectedEmailType]
      const dueDate = moment(currentDebtNote.dueDate)
      const today = moment()
      const daysOverdue = today.diff(dueDate, 'days')

      // Template parameters matching EmailJS template variables
      const templateParams = {
        amount: currentDebtNote.amount,
        due_date: dueDate.format('MMMM D, YYYY'),
        status: currentDebtNote.status,
        to_name: currentDebtNote.debtorName,
        email: currentDebtNote.debtorEmail,
        email_subject: template.subject,
        email_greeting: template.greeting,
        main_message: template.mainMessage
          .replace('{{amount}}', formatCurrency(currentDebtNote.amount))
          .replace('{{dueDate}}', dueDate.format('MMMM D, YYYY'))
          .replace('{{daysOverdue}}', daysOverdue),
        call_to_action: template.callToAction,
      }

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      )

      // Update cooldown for this email type
      setEmailCooldowns(prev => ({
        ...prev,
        [selectedEmailType]: Date.now()
      }))

      toast.success(`${selectedEmailType.charAt(0).toUpperCase() + selectedEmailType.slice(1)} reminder sent successfully!`)
      setConfirmDialogOpen(false)

    } catch (error) {
      console.error('Failed to send email:', error)
      toast.error('Failed to send email reminder. Please try again.')
    } finally {
      setSendingEmail(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0)
  }

  const getEmailButtonVariant = (emailType) => {
    switch (emailType) {
      case 'upcoming':
        return 'default'
      case 'overdue':
        return 'destructive'
      case 'final':
        return 'default'
      default:
        return 'default'
    }
  }

  const getEmailButtonClass = (emailType) => {
    switch (emailType) {
      case 'final':
        return 'bg-purple-600 hover:bg-purple-700 text-white'
      default:
        return ''
    }
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
        <div className="flex justify-center mt-6">
          <TabsList className="flex justify-center">
            <TabsTrigger value="read">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span>View Details</span>
            </TabsTrigger>
            <TabsTrigger value="edit">
              <SquarePen className="w-4 h-4 mr-2" />
              <span>Edit</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Read Tab */}
        <TabsContent value="read">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl mx-auto mt-6 space-y-6 relative">
            {/* Export Section - This is what gets captured */}
            <div ref={exportRef} className="space-y-6 relative">
              <div className="absolute top-6 right-6 text-xs text-gray-400 text-right">
                <div>{moment(currentDebtNote.createdAt).format('MMM D, YYYY')}</div>
                <div>{moment(currentDebtNote.createdAt).format('h:mm A')}</div>
              </div>

              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">Debt Record</h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    currentDebtNote.status
                  )}`}
                >
                  {currentDebtNote.status?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Amount Owed</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(currentDebtNote.amount)}
                </div>
              </div>

              {/* Debtor Info & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Debtor Information
                  </h3>
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
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Payment Timeline
                  </h3>
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Due Date</div>
                      <div className="font-medium">
                        {moment(currentDebtNote.dueDate).format('MMM D, YYYY')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons - Outside the export area */}
            <div className="flex justify-end space-x-3">
              {/* PDF Export Button */}
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                disabled={exporting}
                onClick={exportAsPDF} // direct download now
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export PDF</span>
                  </>
                )}
              </Button>

              {/* Email Dialog */}
              <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={!currentDebtNote.debtorEmail}
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Email Reminder</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Send Email Reminder</DialogTitle>
                    <DialogDescription>
                      Choose a reminder type to send to{' '}
                      <strong>{currentDebtNote.debtorEmail}</strong>
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 mt-4">
                    <Button
                      className="w-full justify-start"
                      variant={getEmailButtonVariant('upcoming')}
                      onClick={() => handleEmailTypeSelect('upcoming')}
                      disabled={isEmailOnCooldown('upcoming')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Upcoming Payment Reminder</span>
                      {isEmailOnCooldown('upcoming') && (
                        <span className="ml-auto text-xs">
                          ({getCooldownTimeRemaining('upcoming')}m)
                        </span>
                      )}
                    </Button>

                    <Button
                      variant={getEmailButtonVariant('overdue')}
                      className="w-full justify-start"
                      onClick={() => handleEmailTypeSelect('overdue')}
                      disabled={isEmailOnCooldown('overdue')}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Overdue Notice</span>
                      {isEmailOnCooldown('overdue') && (
                        <span className="ml-auto text-xs">
                          ({getCooldownTimeRemaining('overdue')}m)
                        </span>
                      )}
                    </Button>

                    <Button
                      className={`w-full justify-start ${getEmailButtonClass('final')}`}
                      onClick={() => handleEmailTypeSelect('final')}
                      disabled={isEmailOnCooldown('final')}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <span>Final Notice</span>
                      {isEmailOnCooldown('final') && (
                        <span className="ml-auto text-xs">
                          ({getCooldownTimeRemaining('final')}m)
                        </span>
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Clock className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-yellow-800">
                        <strong>Rate Limit:</strong> You can send each type of reminder once every 5 minutes to prevent spam.
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Confirmation Dialog */}
              <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Email Reminder</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to send a <strong>{selectedEmailType}</strong> reminder to{' '}
                      <strong>{currentDebtNote.debtorName}</strong> at{' '}
                      <strong>{currentDebtNote.debtorEmail}</strong>?
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                    <div><strong>Amount:</strong> {formatCurrency(currentDebtNote.amount)}</div>
                    <div><strong>Due Date:</strong> {moment(currentDebtNote.dueDate).format('MMMM D, YYYY')}</div>
                    <div><strong>Email Type:</strong> {selectedEmailType.charAt(0).toUpperCase() + selectedEmailType.slice(1)} Notice</div>
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={sendEmailReminder}
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        'Send Email'
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
            value={currentDebtNote.debtorName || ""}
            onChange={(e) =>
              setCurrentDebtNote({ ...currentDebtNote, debtorName: e.target.value })
            }
            placeholder="Enter debtor name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={currentDebtNote.debtorEmail || ""}
            onChange={(e) =>
              setCurrentDebtNote({ ...currentDebtNote, debtorEmail: e.target.value })
            }
            placeholder="Enter email address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={currentDebtNote.debtorPhone || ""}
            onChange={(e) =>
              setCurrentDebtNote({ ...currentDebtNote, debtorPhone: e.target.value })
            }
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
            value={currentDebtNote.amount || ""}
            onChange={(e) =>
              setCurrentDebtNote({
                ...currentDebtNote,
                amount: parseFloat(e.target.value),
              })
            }
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
          <input
            type="date"
            value={
              currentDebtNote.dueDate
                ? moment(currentDebtNote.dueDate).format("YYYY-MM-DD")
                : ""
            }
            onChange={(e) =>
              setCurrentDebtNote({ ...currentDebtNote, dueDate: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          {currentDebtNote.dueDate ? (
            <select
              value={currentDebtNote.status || "pending"}
              onChange={(e) =>
                setCurrentDebtNote({ ...currentDebtNote, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {/* Pending allowed if today or future */}
              <option
                value="pending"
                disabled={
                  new Date(currentDebtNote.dueDate).setHours(0, 0, 0, 0) <
                  new Date().setHours(0, 0, 0, 0)
                }
              >
                Pending
              </option>

              <option value="paid">Paid</option>

              {/* Overdue only if past */}
              <option
                value="overdue"
                disabled={
                  new Date(currentDebtNote.dueDate).setHours(0, 0, 0, 0) >=
                  new Date().setHours(0, 0, 0, 0)
                }
              >
                Overdue
              </option>

              <option value="cancelled">Cancelled</option>
            </select>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Please select a due date before setting a status.
            </p>
          )}
        </div>
      </div>
    </div>

    <div className="flex justify-end space-x-3 pt-6 border-t">
      {/* Delete Button */}
      <button
        onClick={() => DeleteDebtNotesById(id)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 
               bg-gray-100 text-gray-700 font-medium rounded-md
               border border-gray-300
               hover:bg-gray-200 hover:text-gray-900
               focus:outline-none focus:ring-2 focus:ring-gray-300/50
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {loading ? "Deleting…" : "Delete"}
      </button>

      {/* Save Button */}
      <button
        onClick={() => EditDebtNotesById(id)}
        disabled={loading}
        className="inline-flex items-center px-4 py-2 
               bg-blue-500 text-white font-medium rounded-md
               hover:bg-blue-600
               focus:outline-none focus:ring-2 focus:ring-blue-400/50
               disabled:opacity-50 disabled:cursor-not-allowed
               transition-all"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </div>
  </div>
</TabsContent>

      </Tabs>
    </div>
  )
}

export default DebtNotePage
