import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { makeAuthenticatedRequest } from "../../utils/auth";

const apiBase = import.meta.env.VITE_API_URL || "/api";

const AdminDonations = () => {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonations = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await makeAuthenticatedRequest(
          `${apiBase}/admin/donations`,
          { method: "GET" },
          navigate
        );
        const data = await response.json();
        setDonations(data.donations || []);
      } catch (err) {
        setError(err.message || "Failed to load donations.");
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-red-600 font-semibold">
              Admin / Donations
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Donation Records</h1>
            <p className="mt-2 text-slate-600">
              View donation metrics and recent donation history for the blood bank system.
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          {loading ? (
            <p className="text-slate-600">Loading donation records…</p>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {error}
            </div>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-slate-700">
              No donations found yet. Check that donors have donation history and try again.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total records</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{donations.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Donor</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Blood Group</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Quantity</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Facility</th>
                      <th className="px-4 py-3 font-medium text-slate-600">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {donations.map((donation, index) => (
                      <tr key={`${donation.donorEmail}-${index}`}>
                        <td className="px-4 py-4 text-slate-700">
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <div className="font-medium text-slate-900">{donation.donorName}</div>
                          <div className="text-xs text-slate-500">{donation.donorEmail}</div>
                        </td>
                        <td className="px-4 py-4 text-slate-700">{donation.bloodGroup || "N/A"}</td>
                        <td className="px-4 py-4 text-slate-700">{donation.quantity || "—"}</td>
                        <td className="px-4 py-4 text-slate-700">
                          {donation.facility || "Unknown"}
                          {donation.facilityCity ? ` · ${donation.facilityCity}, ${donation.facilityState}` : ""}
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${donation.verified ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"}`}>
                            {donation.verified ? "Verified" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
