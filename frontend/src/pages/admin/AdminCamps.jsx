import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle, Calendar, MapPin, User, Building, CheckCircle, Clock } from "lucide-react";

const AdminCamps = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCamps = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiBase}/api/admin/camps`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let data;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          data = { message: text || "Server returned non-JSON response" };
        }

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
          }
          throw new Error(data.message || "Failed to load camps.");
        }

        setCamps(data.camps || []);
      } catch (err) {
        console.error("Admin camps load error:", err);
        setError(err.message || "Unable to load camps.");
      } finally {
        setLoading(false);
      }
    };

    fetchCamps();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
              Admin / Camps
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Blood Donation Camps</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              View and monitor all blood donation camps registered in the system.
            </p>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 px-5 py-4 shadow-sm">
            <div className="text-sm text-slate-500">Total Camps</div>
            <div className="text-3xl font-semibold text-slate-900">{camps.length}</div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-slate-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              Loading camps...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Unable to load camps</span>
              </div>
              <p>{error}</p>
            </div>
          ) : camps.length === 0 ? (
            <div className="text-center py-20 text-slate-600">
              <CheckCircle className="mx-auto mb-4 w-12 h-12 text-red-600" />
              <p className="text-xl font-semibold">No camps found</p>
              <p className="mt-2 text-slate-500">There are currently no blood camps in the system.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {camps.map((camp) => (
                <div
                  key={camp._id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(camp.date).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {camp.time?.start} - {camp.time?.end}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {camp.location?.venue}, {camp.location?.city}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-semibold text-slate-900">{camp.title}</h2>
                      <p className="mt-2 text-slate-600 max-w-2xl">{camp.description || "No description provided."}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                        <span className="font-semibold">Status:</span> {camp.status}
                      </div>
                      <div className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                        <span className="font-semibold">Expected:</span> {camp.expectedDonors || 0}
                      </div>
                      <div className="rounded-3xl bg-white px-4 py-2 text-sm text-slate-700 ring-1 ring-slate-200">
                        <span className="font-semibold">Actual:</span> {camp.actualDonors || 0}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {camp.hospital?.name || camp.hospital || "Unknown facility"}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {camp.hospital?.email || "--"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCamps;
