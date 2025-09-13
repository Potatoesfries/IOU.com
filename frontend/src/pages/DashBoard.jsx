import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
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
} from "recharts";
import moment from "moment";

const Dashboard = () => {
  const [debtNotes, setDebtNotes] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <p className="p-4 text-gray-600">Loading dashboard...</p>;
  }

  // ---- Graph 1: Monthly Loan Activity (Jan–Jun & Jul–Dec) ----
  const months = moment.monthsShort(); // ["Jan","Feb",...,"Dec"]

  // initialize with zeros
  const monthlyData = months.map((m) => ({
    month: m,
    loaned: 0,
    received: 0,
    outstanding: 0,
  }));

  debtNotes.forEach((note) => {
    const month = moment(note.createdAt).format("MMM");
    const entry = monthlyData.find((d) => d.month === month);

    if (entry) {
      entry.loaned += note.amount || 0;
      if (note.status === "paid") {
        entry.received += note.amount || 0;
      } else {
        entry.outstanding += note.amount || 0;
      }
    }
  });

  // Split into two halves
  const firstHalf = monthlyData.slice(0, 6); // Jan–Jun
  const secondHalf = monthlyData.slice(6);   // Jul–Dec

  // ---- Graph 2: Debtors Count per Month ----
  const debtorData = months.map((m) => ({
    month: m,
    debtors: 0,
  }));

  debtNotes.forEach((note) => {
    const month = moment(note.createdAt).format("MMM");
    const key = `${note.debtorEmail || ""}_${note.debtorName || ""}`; // unique debtor key

    const entry = debtorData.find((d) => d.month === month);
    if (entry) {
      if (!entry._seen) entry._seen = new Set();
      entry._seen.add(key);
      entry.debtors = entry._seen.size;
    }
  });

  const firstHalfDebtors = debtorData.slice(0, 6);
  const secondHalfDebtors = debtorData.slice(6);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Dashboard</h1>

      {/* Jan–Jun row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Loan Activity Jan–Jun */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Loan Activity (Jan–Jun)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={firstHalf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="loaned" fill="#3B82F6" name="Loaned" />
              <Bar dataKey="received" fill="#10B981" name="Received" />
              <Bar dataKey="outstanding" fill="#EF4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Debtors Jan–Jun */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Debtors (Jan–Jun)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={firstHalfDebtors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="debtors" stroke="#8B5CF6" strokeWidth={3} name="Debtors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Jul–Dec row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Loan Activity Jul–Dec */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Monthly Loan Activity (Jul–Dec)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={secondHalf}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="loaned" fill="#3B82F6" name="Loaned" />
              <Bar dataKey="received" fill="#10B981" name="Received" />
              <Bar dataKey="outstanding" fill="#EF4444" name="Outstanding" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Debtors Jul–Dec */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Debtors (Jul–Dec)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={secondHalfDebtors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="debtors" stroke="#8B5CF6" strokeWidth={3} name="Debtors" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
