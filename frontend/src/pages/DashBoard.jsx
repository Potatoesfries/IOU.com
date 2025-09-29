import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, Users, TrendingUp, AlertCircle, Calendar, CheckCircle, ArrowLeft } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
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
    fetchDebtNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalLoaned = debtNotes.reduce((sum, note) => sum + (note.amount || 0), 0);
  const totalReceived = debtNotes
    .filter(note => note.status === "paid")
    .reduce((sum, note) => sum + (note.amount || 0), 0);
  const totalOutstanding = debtNotes
    .filter(note => note.status !== "paid")
    .reduce((sum, note) => sum + (note.amount || 0), 0);
  const totalDebtors = new Set(debtNotes.map(note => note.debtorName)).size;
  const overdueCount = debtNotes.filter(note => note.status === "overdue").length;
  const pendingCount = debtNotes.filter(note => note.status === "pending").length;

  // Monthly data for line chart
  const monthlyData = [
    { month: "Jan", loaned: 0, received: 0 },
    { month: "Feb", loaned: 0, received: 0 },
    { month: "Mar", loaned: 0, received: 0 },
    { month: "Apr", loaned: 0, received: 0 },
    { month: "May", loaned: 0, received: 0 },
    { month: "Jun", loaned: 0, received: 0 },
    { month: "Jul", loaned: 0, received: 0 },
    { month: "Aug", loaned: 0, received: 0 },
    { month: "Sep", loaned: 0, received: 0 },
    { month: "Oct", loaned: 0, received: 0 },
    { month: "Nov", loaned: 0, received: 0 },
    { month: "Dec", loaned: 0, received: 0 },
  ];

  // Get current year for filtering
  const currentYear = new Date().getFullYear();

  debtNotes.forEach((note) => {
    const noteDate = new Date(note.createdAt);
    const monthIndex = noteDate.getMonth();
    const noteYear = noteDate.getFullYear();
    
    // Include all months from current year
    if (noteYear === currentYear) {
      monthlyData[monthIndex].loaned += note.amount || 0;
      if (note.status === "paid") {
        monthlyData[monthIndex].received += note.amount || 0;
      }
    }
  });

  // Status distribution for pie chart
  const statusData = [
    { name: "Paid", value: debtNotes.filter(n => n.status === "paid").length, color: "#10B981" },
    { name: "Pending", value: pendingCount, color: "#F59E0B" },
    { name: "Overdue", value: overdueCount, color: "#EF4444" },
  ];

  // Recent debt notes
  const recentNotes = [...debtNotes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Back Button - Top Left Outside Container */}
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
      <div className="px-6 pb-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Overview of your debt notes and financial summary</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Loaned */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">TOTAL</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              ${totalLoaned.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-600">Total amount loaned</p>
          </div>

          {/* Total Outstanding */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">PENDING</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              ${totalOutstanding.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-600">Outstanding amount</p>
          </div>

          {/* Total Received */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">PAID</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              ${totalReceived.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-600">Amount received</p>
          </div>

          {/* Total Debtors */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">ACTIVE</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">
              {totalDebtors}
            </h3>
            <p className="text-sm text-slate-600">Total debtors</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Trends - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Monthly Overview</h2>
              <p className="text-sm text-slate-600">Monthly loan activity and payments for {currentYear}</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="loaned" stroke="#3B82F6" strokeWidth={2} name="Loaned" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} name="Received" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution - Takes 1 column */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Status Overview</h2>
              <p className="text-sm text-slate-600">Distribution by status</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Debt Notes Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-1">Recent Applications</h2>
            <p className="text-sm text-slate-600">Latest debt notes created</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentNotes.length > 0 ? (
                  recentNotes.map((note, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{note.debtorName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">${note.amount.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{new Date(note.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-600">{new Date(note.dueDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          note.status === "paid" 
                            ? "bg-emerald-100 text-emerald-800"
                            : note.status === "overdue"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-sm text-slate-500">
                      No debt notes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;