import { useEffect, useState, useMemo, useRef } from "react";
import { axiosInstance } from "../../lib/axios";
import moment from "moment";
import { User, LayoutDashboard, Download, Upload, X } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useUser } from "@clerk/clerk-react";
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
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router";
import { useSearch } from "../../context/SearchContext.jsx";

// Validation functions (keeping existing ones)
const validateEmail = (email) => {
  if (!email.trim()) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  if (!phone.trim()) return true;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 9 && digitsOnly.length <= 15;
};

const formatPhoneNumber = (phone) => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 9 || digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  if (digitsOnly.length > 10) {
    return `+${digitsOnly.slice(0, -10)} (${digitsOnly.slice(-10, -7)}) ${digitsOnly.slice(-7, -4)}-${digitsOnly.slice(-4)}`;
  }

  return digitsOnly;
};

const LeftSideBar = () => {
  const { user } = useUser();
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debtDialogOpen, setDebtDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { searchTerm } = useSearch();
  const exportRef = useRef(null);
  const fileInputRef = useRef(null);

  const [newDebtNote, setNewDebtNote] = useState({
    debtorName: "",
    debtorEmail: "",
    debtorPhone: "",
    debtorAddress: "",
    amount: "",
    dueDate: "",
    status: "pending",
  });

  // New state for profile picture
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Helper functions - defined inside component
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

  // Helper function for status styling in PDF
  const getStatusStyleForPDF = (status) => {
    switch (status) {
      case 'paid':
        return { color: '#065f46', backgroundColor: '#d1fae5', borderColor: '#a7f3d0' }
      case 'overdue':
        return { color: '#dc2626', backgroundColor: '#fee2e2', borderColor: '#fecaca' }
      case 'cancelled':
        return { color: '#6b7280', backgroundColor: '#f3f4f6', borderColor: '#d1d5db' }
      default:
        return { color: '#d97706', backgroundColor: '#fef3c7', borderColor: '#fde68a' }
    }
  };

  // File handling functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Summary PDF creation and download
  const exportSummaryPDF = async () => {
    if (filteredDebtNotes.length === 0) {
      toast.error('No debt records to export');
      return;
    }

    if (!exportRef.current) {
      toast.error('Export element not found');
      return;
    }

    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      toast.loading('Creating summary PDF...', { id: 'export-progress' });

      const element = exportRef.current;

      // Generate high-quality PNG
      const imgData = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const img = new Image();
      img.src = imgData;
      await new Promise((resolve) => (img.onload = resolve));

      // Get actual image dimensions from the loaded image
      const imgWidth = img.width;
      const imgHeight = img.height;

      // Calculate scaling to fit PDF page with margins
      const maxWidth = pdfWidth - 20;
      const maxHeight = pdfHeight - 20;
      const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const x = (pdfWidth - finalWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);

      // Create filename
      const searchSuffix = searchTerm ? `-filtered-${searchTerm.replace(/[^a-zA-Z0-9]/g, '-')}` : '';
      const fileName = `debt-records-summary${searchSuffix}-${moment().format('YYYY-MM-DD')}.pdf`;

      // Download the PDF
      pdf.save(fileName);

      toast.dismiss('export-progress');
      toast.success(`Successfully exported ${filteredDebtNotes.length} debt records as PDF!`);

    } catch (error) {
      console.error("Summary PDF creation error:", error);
      toast.dismiss('export-progress');
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Enhanced search function
  const filteredDebtNotes = useMemo(() => {
    if (!searchTerm.trim()) return debtNotes;

    const search = searchTerm.toLowerCase().trim();

    return debtNotes.filter(debt => {
      // Search in debtor name
      if (debt.debtorName?.toLowerCase().includes(search)) return true;

      // Search in amount (both raw number and formatted currency)
      const amount = debt.amount?.toString();
      const formattedAmount = formatCurrency(debt.amount).toLowerCase();
      if (amount?.includes(search) || formattedAmount.includes(search)) return true;

      // Search in email
      if (debt.debtorEmail?.toLowerCase().includes(search)) return true;

      // Search in phone number (both formatted and raw)
      if (debt.debtorPhone?.toLowerCase().includes(search)) return true;

      // Search in address
      if (debt.debtorAddress?.toLowerCase().includes(search)) return true;

      // Search in status
      if (debt.status?.toLowerCase().includes(search)) return true;

      // Search in due date (multiple formats)
      if (debt.dueDate) {
        const dueDate = moment(debt.dueDate);
        const dateFormats = [
          dueDate.format('YYYY-MM-DD').toLowerCase(),
          dueDate.format('MMM D, YYYY').toLowerCase(),
          dueDate.format('MMMM D, YYYY').toLowerCase(),
          dueDate.format('MM/DD/YYYY').toLowerCase(),
          dueDate.format('DD/MM/YYYY').toLowerCase(),
          dueDate.format('YYYY').toLowerCase(),
          dueDate.format('MMM').toLowerCase(),
          dueDate.format('MMMM').toLowerCase(),
        ];

        if (dateFormats.some(format => format.includes(search))) return true;
      }

      // Search in days until due
      const daysText = getDaysUntilDue(debt.dueDate).toLowerCase();
      if (daysText.includes(search)) return true;

      return false;
    });
  }, [debtNotes, searchTerm]);

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

      if (newDebtNote.debtorEmail && !validateEmail(newDebtNote.debtorEmail)) {
        return toast.error("Please enter a valid email address");
      }

      if (newDebtNote.debtorPhone && !validatePhone(newDebtNote.debtorPhone)) {
        return toast.error("Please enter a valid phone number");
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('debtorName', newDebtNote.debtorName);
      formData.append('debtorEmail', newDebtNote.debtorEmail);
      formData.append('debtorPhone', newDebtNote.debtorPhone);
      formData.append('debtorAddress', newDebtNote.debtorAddress);
      formData.append('amount', parseFloat(newDebtNote.amount));
      formData.append('dueDate', newDebtNote.dueDate);
      formData.append('status', newDebtNote.status);

      // Add file if selected
      if (selectedFile) {
        formData.append('debtorProfilePic', selectedFile);
      }

      await axiosInstance.post("/debt-notes", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setNewDebtNote({
        debtorName: "",
        debtorEmail: "",
        debtorPhone: "",
        debtorAddress: "",
        amount: "",
        dueDate: "",
        status: "pending",
      });
      
      removeSelectedFile();

      toast.success("Debt record created successfully");
      setDebtDialogOpen(false);
      await fetchDebtNotes();
    } catch (error) {
      console.error("Create debt note error:", error);
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

  const getTotalDebt = () => {
    return filteredDebtNotes
      .filter((debt) => debt.status !== "paid" && debt.status !== "cancelled")
      .reduce((total, debt) => total + (debt.amount || 0), 0);
  };

  useEffect(() => {
    fetchDebtNotes();
  }, []);

  return (
    <div className="h-screen bg-gray-50 border-r border-gray-200 flex flex-col font-sans">
      {/* Hidden export content - this gets captured for the summary PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={exportRef}
          style={{
            width: '800px',
            padding: '40px',
            backgroundColor: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Timestamp in top-right */}
          <div style={{ position: 'absolute', top: '24px', right: '24px', fontSize: '12px', color: '#9ca3af', textAlign: 'right' }}>
            <div>{moment().format('MMM D, YYYY')}</div>
            <div>{moment().format('h:mm A')}</div>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Debt Records Summary</h2>
            <span style={{
              padding: '8px 12px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #3b82f6',
              color: '#1e40af',
              backgroundColor: '#dbeafe'
            }}>
              [{filteredDebtNotes.length} RECORDS]
            </span>
          </div>

          {/* Total Overview */}
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '20px', height: '20px', color: '#059669' }}>$</div>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563' }}>Total Overview</span>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
              {formatCurrency(filteredDebtNotes.reduce((sum, debt) => sum + (debt.amount || 0), 0))}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
              Outstanding: {formatCurrency(getTotalDebt())}
            </div>
            {searchTerm && (
              <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '4px' }}>
                Filtered by: "{searchTerm}"
              </div>
            )}
          </div>

          {/* Records List */}
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              Debt Records
            </h3>

            {filteredDebtNotes.map((debt, index) => {
              const statusStyle = getStatusStyleForPDF(debt.status);
              return (
                <div key={debt._id || index} style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: index < filteredDebtNotes.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#1f2937' }}>{index + 1}. {debt.debtorName}</div>
                    <div style={{ fontWeight: 'bold', color: '#059669' }}>{formatCurrency(debt.amount)}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      color: statusStyle.color,
                      backgroundColor: statusStyle.backgroundColor,
                      borderColor: statusStyle.borderColor,
                      border: '1px solid'
                    }}>
                      {debt.status || 'pending'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Due: {moment(debt.dueDate).format('MMM D, YYYY')} • {getDaysUntilDue(debt.dueDate)}
                  </div>

                  {(debt.debtorEmail || debt.debtorPhone || debt.debtorAddress) && (
                    <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
                      {debt.debtorEmail && <div>Email: {debt.debtorEmail}</div>}
                      {debt.debtorPhone && <div>Phone: {debt.debtorPhone}</div>}
                      {debt.debtorAddress && <div>Address: {debt.debtorAddress}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Header Section - Improved Layout */}
      <div className="px-4 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between gap-3 overflow-hidden">

          {/* Left: Profile Section */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                    className="w-11 h-11 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                    {user?.firstName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </PopoverTrigger>

              <PopoverContent
                className="w-48 rounded-lg shadow-lg border border-gray-200 p-2 bg-white"
                sideOffset={12}
                align="start"
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition"
                >
                  <User size={16} className="text-gray-600" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition"
                >
                  <LayoutDashboard size={16} className="text-gray-600" />
                  <span>Dashboard</span>
                </Link>
              </PopoverContent>
            </Popover>

            {/* User Info */}
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 leading-tight">
                {user?.fullName || "Anonymous"}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-gray-600">
                  {searchTerm ? (
                    <>
                      {filteredDebtNotes.length} of {debtNotes.length} records
                    </>
                  ) : (
                    <>
                      {debtNotes.length}{" "}
                      {debtNotes.length === 1 ? "record" : "records"}
                    </>
                  )}
                </p>
                {searchTerm && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-medium">
                    "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
<div className="flex flex-col md:flex-row gap-2 md:gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[11px] font-medium hover:bg-gray-50 md:h-9 md:px-4 md:text-sm"
              onClick={exportSummaryPDF}
              disabled={exporting || filteredDebtNotes.length === 0}
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              Export
            </Button>

            <Dialog open={debtDialogOpen} onOpenChange={setDebtDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="h-7 px-2 text-[11px] bg-blue-600 hover:bg-blue-700 font-medium md:h-9 md:px-4 md:text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Record
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-lg font-semibold text-gray-900">
                    New Debt Record
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Add a new debt record to track money owed.
                  </DialogDescription>
                </DialogHeader>

                {/* Form with Enhanced Validation */}
                <div className="space-y-4 py-4">
                  {/* Profile Picture Upload */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600 block">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      {previewUrl ? (
                        <div className="relative">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={removeSelectedFile}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <User className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {selectedFile ? 'Change Photo' : 'Upload Photo'}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          Max 5MB (JPEG, PNG, WebP)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">Debtor Name *</label>
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
                      <label className="text-sm text-gray-600 block">Amount *</label>
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
                        className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                          newDebtNote.debtorEmail && !validateEmail(newDebtNote.debtorEmail)
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {newDebtNote.debtorEmail &&
                        !validateEmail(newDebtNote.debtorEmail) && (
                          <p className="text-xs text-red-600 mt-1">
                            Please enter a valid email address
                          </p>
                        )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-600 block">Phone</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number..."
                        value={newDebtNote.debtorPhone}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const sanitizedValue = inputValue.replace(/[^0-9\s\(\)\-\+]/g, "");
                          setNewDebtNote({
                            ...newDebtNote,
                            debtorPhone: sanitizedValue,
                          });
                        }}
                        onBlur={(e) => {
                          if (e.target.value) {
                            setNewDebtNote({
                              ...newDebtNote,
                              debtorPhone: formatPhoneNumber(e.target.value),
                            });
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm ${
                          newDebtNote.debtorPhone && !validatePhone(newDebtNote.debtorPhone)
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300"
                        }`}
                      />
                      {newDebtNote.debtorPhone &&
                        !validatePhone(newDebtNote.debtorPhone) && (
                          <p className="text-xs text-red-600 mt-1">
                            Please enter a valid phone number (10-15 digits)
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Address Field */}
                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">Address</label>
                    <textarea
                      placeholder="Enter address..."
                      value={newDebtNote.debtorAddress}
                      onChange={(e) =>
                        setNewDebtNote({
                          ...newDebtNote,
                          debtorAddress: e.target.value,
                        })
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-600 block">Status</label>
                    {newDebtNote.dueDate ? (
                      <select
                        value={newDebtNote.status}
                        onChange={(e) =>
                          setNewDebtNote({ ...newDebtNote, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        <option
                          value="pending"
                          disabled={
                            new Date(newDebtNote.dueDate).setHours(0, 0, 0, 0) <
                            new Date().setHours(0, 0, 0, 0)
                          }
                        >
                          Pending
                        </option>

                        <option value="paid">Paid</option>

                        <option
                          value="overdue"
                          disabled={
                            new Date(newDebtNote.dueDate).setHours(0, 0, 0, 0) >=
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

                <DialogFooter className="flex justify-between gap-3 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNewDebtNote({
                        debtorName: "",
                        debtorEmail: "",
                        debtorPhone: "",
                        debtorAddress: "",
                        amount: "",
                        dueDate: "",
                        status: "pending",
                      });
                      removeSelectedFile();
                    }}
                    disabled={loading}
                  >
                    Clear
                  </Button>

                  <div className="flex gap-3">
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
                        !newDebtNote.dueDate ||
                        (newDebtNote.debtorEmail && !validateEmail(newDebtNote.debtorEmail)) ||
                        (newDebtNote.debtorPhone && !validatePhone(newDebtNote.debtorPhone))
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
            ) : filteredDebtNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                <CreditCard className="w-10 h-10 mb-3 text-gray-400" />
                {searchTerm ? (
                  <>
                    <p className="text-sm">No records match your search</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try adjusting your search terms
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm">No debt records yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Create your first debt record to start tracking.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDebtNotes.map((debt, index) => (
                  <Link
                    to={`/debt-notes/${debt._id}`}
                    key={debt._id || index}
                    className="block bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {/* Profile Picture */}
                      <div className="flex-shrink-0">
                        {debt.debtorProfilePic ? (
                          <img
                            src={debt.debtorProfilePic}
                            alt={debt.debtorName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate">
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

                        {/* Enhanced contact info display */}
                        {(debt.debtorEmail || debt.debtorPhone || debt.debtorAddress) && (
                          <div className="mt-2 text-xs text-gray-500 space-y-1">
                            {debt.debtorEmail && <p>Email: {debt.debtorEmail}</p>}
                            {debt.debtorPhone && <p>Phone: {debt.debtorPhone}</p>}
                            {debt.debtorAddress && (
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2">{debt.debtorAddress}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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