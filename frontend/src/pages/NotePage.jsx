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
  Camera,
  MapPin,
  UserCheck,
  Shield,
  Plus,
  X,
  ArrowLeft,
  FileCheck,
  Percent,
  TrendingUp,
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
  const [currentDebtNote, setCurrentDebtNote] = useState({
    hasGuarantor: false,
    guarantor: null,
    hasContract: false,
    contract: null,
  })
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [calculatedAmounts, setCalculatedAmounts] = useState(null)
  const [calculatingAmounts, setCalculatingAmounts] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const exportRef = useRef(null)
  const fileInputRef = useRef(null)

  const EMAILJS_CONFIG = {
    serviceId: 'service_na7yzd2',
    templateId: 'template_6xktqx4',
    publicKey: 'B9XpLCPWtNOeZ2RpM'
  }

  const [showProfileModal, setShowProfileModal] = useState(false);

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
        setCurrentDebtNote({
          ...res.data,
          hasGuarantor: res.data.guarantor ? true : false,
          hasContract: res.data.contract ? true : false,
        })
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

  const fetchCalculatedAmounts = async () => {
    setCalculatingAmounts(true)
    try {
      const res = await axiosInstance.get(`/debt-notes/${id}/calculate`)
      setCalculatedAmounts(res.data)
    } catch (error) {
      console.error('Failed to calculate amounts:', error)
      toast.error('Failed to calculate amounts')
    } finally {
      setCalculatingAmounts(false)
    }
  }

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF)')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('debtorProfilePic', file)
      formData.append('debtorName', currentDebtNote.debtorName || '')
      formData.append('debtorEmail', currentDebtNote.debtorEmail || '')
      formData.append('debtorPhone', currentDebtNote.debtorPhone || '')
      formData.append('debtorAddress', currentDebtNote.debtorAddress || '')
      formData.append('amount', currentDebtNote.amount || 0)
      formData.append('dueDate', currentDebtNote.dueDate || '')
      formData.append('status', currentDebtNote.status || 'pending')

      if (currentDebtNote.hasGuarantor && currentDebtNote.guarantor) {
        formData.append('guarantorName', currentDebtNote.guarantor.name || '')
        formData.append('guarantorPhone', currentDebtNote.guarantor.phone || '')
      }

      // Add contract data to formData if exists
      if (currentDebtNote.hasContract) {
        formData.append('interestEnabled', currentDebtNote.contract?.interest?.enabled || false)
        formData.append('interestEveryDays', currentDebtNote.contract?.interest?.everyDays || 0)
        formData.append('interestChargeAmount', currentDebtNote.contract?.interest?.chargeAmount || 0)
        formData.append('lateFeeEnabled', currentDebtNote.contract?.lateFee?.enabled || false)
        formData.append('lateFeeEveryDays', currentDebtNote.contract?.lateFee?.everyDays || 0)
        formData.append('lateFeeChargeAmount', currentDebtNote.contract?.lateFee?.chargeAmount || 0)
      }

      const response = await axiosInstance.put(`/debt-notes/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setCurrentDebtNote(prev => ({
        ...prev,
        ...response.data,
        hasGuarantor: response.data.guarantor ? true : false,
        hasContract: response.data.contract ? true : false,
      }))

      toast.success('Profile image updated successfully')

    } catch (error) {
      console.error('Upload error details:', error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || 'Failed to upload profile image'
      toast.error(errorMessage)
    } finally {
      setUploadingImage(false)
    }
  }

  const EditDebtNotesById = async (debtNoteId) => {
    setLoading(true)
    try {
      // Prepare the main update payload
      const updatePayload = {
        debtorName: currentDebtNote.debtorName,
        debtorEmail: currentDebtNote.debtorEmail,
        debtorPhone: currentDebtNote.debtorPhone,
        debtorAddress: currentDebtNote.debtorAddress,
        amount: currentDebtNote.amount,
        dueDate: currentDebtNote.dueDate,
        status: currentDebtNote.status,
        archivedAt: currentDebtNote.archivedAt,
        guarantorName: currentDebtNote.hasGuarantor && currentDebtNote.guarantor ? currentDebtNote.guarantor.name || '' : '',
        guarantorPhone: currentDebtNote.hasGuarantor && currentDebtNote.guarantor ? currentDebtNote.guarantor.phone || '' : '',
      }

      // Add contract data if hasContract is true
      if (currentDebtNote.hasContract) {
        updatePayload.interestEnabled = currentDebtNote.contract?.interest?.enabled || false
        updatePayload.interestEveryDays = currentDebtNote.contract?.interest?.everyDays || 0
        updatePayload.interestChargeAmount = currentDebtNote.contract?.interest?.chargeAmount || 0
        updatePayload.lateFeeEnabled = currentDebtNote.contract?.lateFee?.enabled || false
        updatePayload.lateFeeEveryDays = currentDebtNote.contract?.lateFee?.everyDays || 0
        updatePayload.lateFeeChargeAmount = currentDebtNote.contract?.lateFee?.chargeAmount || 0
      }

      // Make the single API call
      const res = await axiosInstance.put(`/debt-notes/${debtNoteId}`, updatePayload)

      // Update the local state
      setCurrentDebtNote({
        ...res.data,
        hasGuarantor: res.data.guarantor ? true : false,
        hasContract: res.data.contract ? true : false,
      })

      toast.success('Debt note updated successfully')

      // Optional: reload after a short delay to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 400)
    } catch (error) {
      console.error('Update error:', error)
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

      const imgData = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
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
      const y = 10

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

  const isEmailOnCooldown = (emailType) => {
    const cooldownTime = 5 * 60 * 1000
    return Date.now() - emailCooldowns[emailType] < cooldownTime
  }

  const getCooldownTimeRemaining = (emailType) => {
    const cooldownTime = 5 * 60 * 1000
    const remaining = cooldownTime - (Date.now() - emailCooldowns[emailType])
    return Math.ceil(remaining / (60 * 1000))
  }

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

  const sendEmailReminder = async () => {
    setSendingEmail(true)

    try {
      const template = emailTemplates[selectedEmailType]
      const dueDate = moment(currentDebtNote.dueDate)
      const today = moment()
      const daysOverdue = today.diff(dueDate, 'days')

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
      <div className="p-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <Tabs defaultValue="read">
        <div className="flex justify-center mt-6">
          <TabsList className="flex justify-center">
            <TabsTrigger value="read">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              <span>View Details</span>
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="contract">
              <FileCheck className="w-4 h-4 mr-2" />
              <span>Contract</span>
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

                  {currentDebtNote.debtorAddress && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">Address</div>
                        <div className="font-medium">{currentDebtNote.debtorAddress}</div>
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

              {currentDebtNote.hasGuarantor && currentDebtNote.guarantor && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Guarantor Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserCheck className="w-4 h-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">Name</div>
                          <div className="font-medium">{currentDebtNote.guarantor.name || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {currentDebtNote.guarantor.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Phone</div>
                            <div className="font-medium">{currentDebtNote.guarantor.phone}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                className="flex items-center space-x-2"
                disabled={exporting}
                onClick={exportAsPDF}
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

        {/* Profile Tab */}
        <TabsContent value="profile">
          {showProfileModal && (currentDebtNote.profileImage || currentDebtNote.debtorProfilePic) && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setShowProfileModal(false)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
                <img
                  src={currentDebtNote.profileImage || currentDebtNote.debtorProfilePic}
                  alt="Profile - Full View"
                  className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto mt-6 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-800"></div>

              <div className="px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
                  <div className="-mt-12 mb-4 md:mb-0">
                    <div className="relative">
                      {(currentDebtNote.profileImage || currentDebtNote.debtorProfilePic) ? (
                        <img
                          src={currentDebtNote.profileImage || currentDebtNote.debtorProfilePic}
                          alt="Profile"
                          className="w-24 h-24 rounded-xl object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setShowProfileModal(true)}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                          <User className="w-12 h-12 text-slate-400" />
                        </div>
                      )}
                      <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white shadow-sm ${currentDebtNote.status === 'paid' ? 'bg-emerald-500' :
                        currentDebtNote.status === 'overdue' ? 'bg-rose-500' :
                          currentDebtNote.status === 'cancelled' ? 'bg-slate-400' :
                            'bg-amber-500'
                        }`}></div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                      {currentDebtNote.debtorName || 'N/A'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wide ${getStatusColor(
                          currentDebtNote.status
                        )}`}
                      >
                        {currentDebtNote.status || 'PENDING'}
                      </span>
                      <span className="text-sm text-slate-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Created {moment(currentDebtNote.createdAt).format('MMM D, YYYY')}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3.5 text-center">
                      <div className="text-xs font-medium text-slate-600 mb-1">Outstanding Amount</div>
                      <div className="text-xl font-semibold text-slate-900">
                        {formatCurrency(currentDebtNote.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-2.5">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Mail className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-slate-500 mb-1">Email Address</div>
                      <div className="text-sm text-slate-900 break-all">
                        {currentDebtNote.debtorEmail || <span className="text-slate-400 italic">Not provided</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <Phone className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-500 mb-1">Phone Number</div>
                      <div className="text-sm text-slate-900">
                        {currentDebtNote.debtorPhone || <span className="text-slate-400 italic">Not provided</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <MapPin className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-500 mb-1">Address</div>
                      <div className="text-sm text-slate-900">
                        {currentDebtNote.debtorAddress || <span className="text-slate-400 italic">Not provided</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center mr-2.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                  </div>
                  Payment Timeline
                </h3>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-amber-700">Due Date</span>
                      {moment(currentDebtNote.dueDate).isBefore(moment(), 'day') && currentDebtNote.status !== 'paid' && (
                        <span className="px-2.5 py-1 bg-rose-600 text-white text-xs font-medium rounded-lg">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <div className="text-base font-semibold text-slate-900">
                      {moment(currentDebtNote.dueDate).format('MMMM D, YYYY')}
                    </div>
                    <div className="text-xs text-amber-700 mt-1">
                      {moment(currentDebtNote.dueDate).fromNow()}
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="text-xs font-medium text-blue-700 mb-2">Payment Status</div>
                    <div className="text-base font-semibold">
                      {currentDebtNote.status === 'paid' ? (
                        <span className="text-emerald-600">Paid ✓</span>
                      ) : moment(currentDebtNote.dueDate).isBefore(moment(), 'day') ? (
                        <span className="text-rose-600">
                          {Math.abs(moment(currentDebtNote.dueDate).diff(moment(), 'days'))} days overdue
                        </span>
                      ) : (
                        <span className="text-slate-900">
                          {moment(currentDebtNote.dueDate).diff(moment(), 'days')} days remaining
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <Clock className="w-4 h-4 text-slate-500 mb-1.5" />
                      <div className="text-xs text-slate-600">Created</div>
                      <div className="text-sm font-medium text-slate-900 mt-1">
                        {moment(currentDebtNote.createdAt).format('MMM D, YYYY')}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <DollarSign className="w-4 h-4 text-slate-500 mb-1.5" />
                      <div className="text-xs text-slate-600">Amount</div>
                      <div className="text-sm font-medium text-slate-900 mt-1">
                        {formatCurrency(currentDebtNote.amount)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {currentDebtNote.hasGuarantor && currentDebtNote.guarantor && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-base font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100 flex items-center">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center mr-2.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                  </div>
                  Guarantor Information
                </h3>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-200">
                        <UserCheck className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-indigo-700 mb-1">Guarantor Name</div>
                        <div className="text-sm font-semibold text-slate-900">
                          {currentDebtNote.guarantor.name || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {currentDebtNote.guarantor.phone && (
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-indigo-200">
                          <Phone className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-indigo-700 mb-1">Phone Number</div>
                          <div className="text-sm font-semibold text-slate-900">
                            {currentDebtNote.guarantor.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white/60 rounded-lg border border-indigo-100">
                    <p className="text-xs text-slate-700 flex items-start">
                      <Shield className="w-3 h-3 mr-1.5 flex-shrink-0 mt-0.5 text-indigo-600" />
                      This person has agreed to be responsible for the debt if the primary debtor cannot pay.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Contract Tab */}
<TabsContent value="contract">
  <div className="max-w-4xl mx-auto mt-6 space-y-8">
    {/* Contract Overview */}
    <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contract Terms</h2>
          <p className="text-gray-600 mt-1">
            {currentDebtNote.hasContract
              ? 'Review the interest and late fee terms for this debt.'
              : 'No contract terms have been set for this debt note.'}
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${currentDebtNote.hasContract ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
          {currentDebtNote.hasContract ? 'Contract Active' : 'No Contract'}
        </div>
      </div>

      {!currentDebtNote.hasContract && (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">No contract terms have been configured yet.</p>
          <p className="text-sm text-gray-400">
            Go to the Edit tab to add contract terms including interest and late fee settings.
          </p>
        </div>
      )}

      {currentDebtNote.hasContract && currentDebtNote.contract && (
        <div className="space-y-6">
          {/* Interest & Late Fee Table */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Interest Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interest Terms</h3>
              {currentDebtNote.contract.interest?.enabled ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interest Enabled</span>
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charge Frequency</span>
                    <span className="font-medium text-gray-900">
                      Every {currentDebtNote.contract.interest.everyDays} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charge Amount</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(currentDebtNote.contract.interest.chargeAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3">Interest charges are not enabled.</p>
              )}
            </div>

            {/* Late Fee Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Late Fee Terms</h3>
              {currentDebtNote.contract.lateFee?.enabled ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Fee Enabled</span>
                    <span className="font-medium text-gray-900">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charge Frequency</span>
                    <span className="font-medium text-gray-900">
                      Every {currentDebtNote.contract.lateFee.everyDays} days overdue
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Charge Amount</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(currentDebtNote.contract.lateFee.chargeAmount)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-3">Late fees are not enabled.</p>
              )}
            </div>
          </div>

          {/* Contract Date */}
          <div className="text-sm text-gray-500 text-center">
            Contract created on {moment(currentDebtNote.contract.createdAt).format('MMMM D, YYYY [at] h:mm A')}
          </div>
        </div>
      )}
    </div>

    {/* Calculate Total Due */}
    {currentDebtNote.hasContract && (
      <div className="bg-white border border-gray-200 rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Calculate Total Amount Due</h3>
            <p className="text-gray-600 mt-1">
              See how much is owed including interest and late fees.
            </p>
          </div>
          <Button
            onClick={fetchCalculatedAmounts}
            disabled={calculatingAmounts}
            className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 font-medium"
          >
            {calculatingAmounts ? 'Calculating...' : 'Calculate Now'}
          </Button>
        </div>

        {calculatedAmounts && (
          <div className="space-y-4">
            {/* Amount Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">Original Amount</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculatedAmounts.originalAmount)}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">Interest Charges</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculatedAmounts.interestAmount)}
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
                <div className="text-xs text-gray-600 mb-1">Late Fees</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(calculatedAmounts.lateFeeAmount)}
                </div>
              </div>
            </div>

            {/* Total Due */}
            <div className="p-4 border border-gray-200 rounded-lg text-center bg-gray-50">
              <div className="text-sm text-gray-600 mb-1">Total Amount Due</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculatedAmounts.totalDue)}
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-3 border border-gray-200 rounded-lg text-center bg-white">
                <div className="text-xs text-gray-600 mb-1">Days from Creation</div>
                <div className="text-sm font-medium text-gray-900">
                  {calculatedAmounts.breakdown.daysFromCreation} days
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg text-center bg-white">
                <div className="text-xs text-gray-600 mb-1">Days Until Due</div>
                <div className="text-sm font-medium text-gray-900">
                  {calculatedAmounts.breakdown.daysUntilDue >= 0
                    ? `${calculatedAmounts.breakdown.daysUntilDue} days`
                    : 'Past due'}
                </div>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg text-center bg-white">
                <div className="text-xs text-gray-600 mb-1">Days Overdue</div>
                <div className={`text-sm font-medium ${calculatedAmounts.breakdown.daysOverdue > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {calculatedAmounts.breakdown.daysOverdue > 0
                    ? `${calculatedAmounts.breakdown.daysOverdue} days`
                    : 'Not overdue'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
</TabsContent>




        {/* Edit Tab */}
        <TabsContent value="edit">
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl mx-auto mt-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Debt Record</h2>

            {/* Profile Image Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Profile Image
              </h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {(currentDebtNote.profileImage || currentDebtNote.debtorProfilePic) ? (
                    <img
                      src={currentDebtNote.profileImage || currentDebtNote.debtorProfilePic}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute -bottom-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
                  >
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Click the camera icon to upload a profile image</p>
                  <p className="text-xs text-gray-400">Supported: JPG, PNG, GIF (max 5MB)</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                className="hidden"
              />
            </div>

            {/* Debtor Information Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Debtor Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Address
                </label>
                <textarea
                  value={currentDebtNote.debtorAddress || ""}
                  onChange={(e) =>
                    setCurrentDebtNote({ ...currentDebtNote, debtorAddress: e.target.value })
                  }
                  placeholder="Enter full address"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                />
              </div>
            </div>

            {/* Guarantor Section */}
            <div className="border-b pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Guarantor Information
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentDebtNote(prev => ({
                      ...prev,
                      hasGuarantor: !prev.hasGuarantor,
                      guarantor: prev.hasGuarantor ? null : {
                        name: '',
                        phone: ''
                      }
                    }))
                  }}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentDebtNote.hasGuarantor
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                >
                  {currentDebtNote.hasGuarantor ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Remove Guarantor
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Guarantor
                    </>
                  )}
                </button>
              </div>

              {currentDebtNote.hasGuarantor && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guarantor Name *</label>
                      <input
                        type="text"
                        value={currentDebtNote.guarantor?.name || ""}
                        onChange={(e) =>
                          setCurrentDebtNote({
                            ...currentDebtNote,
                            guarantor: {
                              ...currentDebtNote.guarantor,
                              name: e.target.value
                            }
                          })
                        }
                        placeholder="Enter guarantor name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Guarantor Phone</label>
                      <input
                        type="tel"
                        value={currentDebtNote.guarantor?.phone || ""}
                        onChange={(e) =>
                          setCurrentDebtNote({
                            ...currentDebtNote,
                            guarantor: {
                              ...currentDebtNote.guarantor,
                              phone: e.target.value
                            }
                          })
                        }
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-blue-100 rounded-md">
                    <p className="text-xs text-blue-700">
                      <Shield className="w-3 h-3 inline mr-1" />
                      A guarantor is someone who agrees to be responsible for the debt if the primary debtor cannot pay.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contract Section */}
<div className="border-b pb-6">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-gray-800">
      Contract Terms
    </h3>
    <button
      type="button"
      onClick={() => {
        setCurrentDebtNote(prev => ({
          ...prev,
          hasContract: !prev.hasContract,
          contract: prev.hasContract
            ? null
            : {
                interest: { enabled: false, everyDays: 30, chargeAmount: 0 },
                lateFee: { enabled: false, everyDays: 7, chargeAmount: 0 },
              },
        }))
      }}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
    >
      {currentDebtNote.hasContract ? 'Remove Contract' : 'Add Contract'}
    </button>
  </div>

  {currentDebtNote.hasContract && (
    <div className="space-y-6">
      {/* Interest Settings */}
      <div className="p-4 rounded-lg border border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Interest Charges</h4>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentDebtNote.contract?.interest?.enabled || false}
              onChange={(e) =>
                setCurrentDebtNote({
                  ...currentDebtNote,
                  contract: {
                    ...currentDebtNote.contract,
                    interest: {
                      ...currentDebtNote.contract?.interest,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="mr-2 w-4 h-4 text-gray-700 rounded focus:ring focus:ring-gray-400"
            />
            <span className="text-sm font-medium text-gray-700">Enable Interest</span>
          </label>
        </div>

        {currentDebtNote.contract?.interest?.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Every (days)
              </label>
              <input
                type="number"
                min="1"
                value={currentDebtNote.contract?.interest?.everyDays}
                onChange={(e) =>
                  setCurrentDebtNote({
                    ...currentDebtNote,
                    contract: {
                      ...currentDebtNote.contract,
                      interest: {
                        ...currentDebtNote.contract?.interest,
                        everyDays: parseInt(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentDebtNote.contract?.interest?.chargeAmount}
                onChange={(e) =>
                  setCurrentDebtNote({
                    ...currentDebtNote,
                    contract: {
                      ...currentDebtNote.contract,
                      interest: {
                        ...currentDebtNote.contract?.interest,
                        chargeAmount: parseFloat(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Late Fee Settings */}
      <div className="p-4 rounded-lg border border-gray-300">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800">Late Fee Charges</h4>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentDebtNote.contract?.lateFee?.enabled || false}
              onChange={(e) =>
                setCurrentDebtNote({
                  ...currentDebtNote,
                  contract: {
                    ...currentDebtNote.contract,
                    lateFee: {
                      ...currentDebtNote.contract?.lateFee,
                      enabled: e.target.checked,
                    },
                  },
                })
              }
              className="mr-2 w-4 h-4 text-gray-700 rounded focus:ring focus:ring-gray-400"
            />
            <span className="text-sm font-medium text-gray-700">Enable Late Fee</span>
          </label>
        </div>

        {currentDebtNote.contract?.lateFee?.enabled && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Every (days overdue)
              </label>
              <input
                type="number"
                min="1"
                value={currentDebtNote.contract?.lateFee?.everyDays}
                onChange={(e) =>
                  setCurrentDebtNote({
                    ...currentDebtNote,
                    contract: {
                      ...currentDebtNote.contract,
                      lateFee: {
                        ...currentDebtNote.contract?.lateFee,
                        everyDays: parseInt(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentDebtNote.contract?.lateFee?.chargeAmount}
                onChange={(e) =>
                  setCurrentDebtNote({
                    ...currentDebtNote,
                    contract: {
                      ...currentDebtNote.contract,
                      lateFee: {
                        ...currentDebtNote.contract?.lateFee,
                        chargeAmount: parseFloat(e.target.value),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-gray-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 p-3 rounded-md border border-gray-300 bg-white">
        <p className="text-sm text-gray-700">
          Contract terms define how interest and late fees are calculated. Interest charges apply from creation date to due date, while late fees apply after the due date.
        </p>
      </div>
    </div>
  )}
</div>


            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
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
                  <X className="h-4 w-4 mr-2" />
                )}
                {loading ? "Deleting…" : "Delete"}
              </button>

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
                  <FileText className="h-4 w-4 mr-2" />
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