import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Edit3, 
  Save, 
  X, 
  Camera,
  User,
  ArrowLeft
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch debt notes
  const fetchDebtNotes = async () => {
    try {
      const res = await axiosInstance.get("/debt-notes");
      setDebtNotes(res.data);
    } catch (error) {
      console.error("Error fetching debt notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtNotes();
  }, []);

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, GIF)');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Store the selected file and create preview URL
    setSelectedImageFile(file);
    
    // Create preview URL for display
    const previewUrl = URL.createObjectURL(file);
    setImagePreviewUrl(previewUrl);
    
    toast.success('Image selected. Click "Save Changes" to update.');
  };

  // Save profile changes (image only)
  const saveProfile = async () => {
    setSaving(true);
    try {
      if (!selectedImageFile) {
        toast.error('No image selected');
        return;
      }

      // Update your backend first
      const formData = new FormData();
      formData.append('clerkId', user.id);
      formData.append('profileImage', selectedImageFile);

      await axiosInstance.put('/auth/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Try to update Clerk user data
      try {
        await user.setProfileImage({ file: selectedImageFile });
        toast.success('Profile image updated successfully!');
      } catch (clerkError) {
        console.log('Clerk image update failed:', clerkError);
        toast.success('Profile image updated successfully! Please refresh if changes are not visible.');
        
        // Force a reload of user data from Clerk
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }

      setEditMode(false);
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
      
      // Clean up preview URL
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile image';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditMode(false);
    setSelectedImageFile(null);
    
    // Clean up preview URL
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
  };

  // Format amount
  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);

  // Status badge styles
  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3" /> Paid
          </span>
        );
      case "overdue":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            <DollarSign className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  const displayImageUrl = imagePreviewUrl || user?.imageUrl;

  return (
    <div className="min-h-screen">
      {/* Go Back Button - Fixed Top Left */}
      <div className="p-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Main Content Container */}
      <div className="px-6 pb-6 max-w-4xl mx-auto">
        {/* Profile Image Modal */}
        {showProfileModal && displayImageUrl && (
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
                src={displayImageUrl}
                alt="Profile - Full View"
                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}

        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={user?.fullName || "User"}
                className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-blue-500 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowProfileModal(true)}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-2 ring-blue-500">
                {user?.firstName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            
            {editMode && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
              >
                <Camera className="w-3 h-3" />
              </button>
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.fullName || "Anonymous"}
            </h1>
            <p className="text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || "No email"}
            </p>
            
            {selectedImageFile && editMode && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ New image selected: {selectedImageFile.name}
              </p>
            )}
          </div>

          {/* Edit/Save/Cancel buttons */}
          <div className="flex gap-2">
            {editMode ? (
              <>
                <button
                  onClick={saveProfile}
                  disabled={saving || !selectedImageFile}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? 'Saving...' : 'Save Image'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Change Photo
              </button>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <Card className="shadow-md hover:shadow-lg transition rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <FileText className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500 text-sm">Loading...</p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{debtNotes.length}</p>
                  <p className="text-sm text-gray-500">All debt notes</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Records Section */}
        <Card className="shadow-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : debtNotes.length === 0 ? (
              <p className="text-gray-500">No records found.</p>
            ) : (
              <div className="grid gap-3">
                {debtNotes.slice(0, 5).map((note, idx) => (
                  <div
                    key={note._id || idx}
                    className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {note.debtorName || note.title || `Note #${idx + 1}`}
                      </h3>
                      <span className="text-sm font-bold text-gray-800">
                        {formatCurrency(note.amount)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {getStatusBadge(note.status)}
                      <p className="text-xs text-gray-500">
                        Due {moment(note.dueDate).format("MMM D, YYYY")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 