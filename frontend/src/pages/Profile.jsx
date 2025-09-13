import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { axiosInstance } from "../lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import moment from "moment";

const Profile = () => {
  const { user } = useUser();
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-8">
        {user?.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={user.fullName || "User"}
            className="w-20 h-20 rounded-full object-cover shadow-md ring-2 ring-blue-500"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-semibold shadow-md ring-2 ring-blue-500">
            {user?.firstName?.charAt(0).toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.fullName || "Anonymous"}
          </h1>
          <p className="text-gray-600">
            {user?.primaryEmailAddress?.emailAddress || "No email"}
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10" >
        <Card className="shadow-md hover:shadow-lg transition rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between ">
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
  );
};

export default Profile;
