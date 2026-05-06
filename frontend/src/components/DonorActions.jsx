import React, { useState } from "react";
import {
  Download,
  Share2,
  Calendar,
  Users,
  X,
  Copy,
  Check,
  Mail,
  MessageCircle,
  Facebook,
  Linkedin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const API_URL = `${import.meta.env.VITE_API_URL || ""}/api/donor`;

const DonorActions = ({ donor, stats }) => {
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [schedulingData, setSchedulingData] = useState({
    preferredDate: "",
    preferredTime: "",
    facilityId: "",
    reason: "",
  });

  // ========== DOWNLOAD CERTIFICATE ==========
  const downloadCertificate = async () => {
    try {
      setLoading(true);
      const certificateContent = document.getElementById("certificate");

      // Use html2canvas to convert the certificate HTML to an image
      const canvas = await html2canvas(certificateContent, {
        backgroundColor: "#ffffff",
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(
        `${donor?.fullName || "Donor"}_Certificate_${new Date().getFullYear()}.pdf`
      );

      toast.success("Certificate downloaded successfully!");
      setShowModal(null);
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate");
    } finally {
      setLoading(false);
    }
  };

  // ========== SHARE ACHIEVEMENT ==========
  const shareOnSocial = (platform) => {
    const achievementText = `🩸 I've made ${stats?.totalDonations || 0} blood donations and saved approximately ${stats?.livesImpacted || 0} lives! Join me in the blood donation movement. #BloodDonation #HealthcareHero`;
    const encodedText = encodeURIComponent(achievementText);
    const currentUrl = window.location.origin;

    const platforms = {
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedText}&u=${currentUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      whatsapp: `https://wa.me/?text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`,
    };

    if (platforms[platform]) {
      window.open(platforms[platform], "_blank", "width=600,height=400");
      toast.success(`Shared on ${platform}!`);
    }
  };

  // ========== SCHEDULE DONATION ==========
  const handleScheduleDonation = async () => {
    if (!schedulingData.preferredDate || !schedulingData.preferredTime) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/schedule-donation`,
        {
          preferredDate: schedulingData.preferredDate,
          preferredTime: schedulingData.preferredTime,
          facilityId: schedulingData.facilityId,
          reason: schedulingData.reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Donation scheduled successfully!");
      setShowModal(null);
      setSchedulingData({
        preferredDate: "",
        preferredTime: "",
        facilityId: "",
        reason: "",
      });
    } catch (error) {
      console.error("Error scheduling donation:", error);
      const message =
        error.response?.data?.message || "Failed to schedule donation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ========== INVITE FRIEND ==========
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const handleInviteFriend = async () => {
    if (!inviteEmail) {
      toast.error("Please enter email address");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const referralCode = `${donor?._id?.slice(-8)}${Math.random().toString(36).substr(2, 9)}`;

      const response = await axios.post(
        `${API_URL}/invite-friend`,
        {
          friendEmail: inviteEmail,
          friendMessage: inviteMessage,
          referralCode: referralCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setInviteMessage("");
      setShowModal(null);
    } catch (error) {
      console.error("Error sending invitation:", error);
      const message =
        error.response?.data?.message || "Failed to send invitation";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    const referralCode = `${donor?._id?.slice(-8)}${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Referral code copied!");
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setShowModal("certificate")}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all border border-blue-200"
        >
          <Download className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-800">
            Download Certificate
          </span>
        </button>

        <button
          onClick={() => setShowModal("share")}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all border border-green-200"
        >
          <Share2 className="w-5 h-5 text-green-600" />
          <span className="text-xs font-semibold text-green-800">
            Share Achievement
          </span>
        </button>

        <button
          onClick={() => setShowModal("schedule")}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all border border-purple-200"
        >
          <Calendar className="w-5 h-5 text-purple-600" />
          <span className="text-xs font-semibold text-purple-800">
            Schedule Donation
          </span>
        </button>

        <button
          onClick={() => setShowModal("invite")}
          className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all border border-orange-200"
        >
          <Users className="w-5 h-5 text-orange-600" />
          <span className="text-xs font-semibold text-orange-800">
            Invite Friend
          </span>
        </button>
      </div>

      {/* CERTIFICATE MODAL */}
      {showModal === "certificate" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Download className="w-6 h-6 text-blue-600" />
                Download Certificate
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Certificate Preview */}
            <div className="p-6">
              <div
                id="certificate"
                className="bg-gradient-to-br from-yellow-50 via-white to-red-50 p-12 rounded-lg border-4 border-red-600 text-center mb-6"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, rgba(255,0,0,0.05) 0%, rgba(255,0,0,0.02) 100%)
                  `,
                }}
              >
                {/* Certificate Content */}
                <div className="mb-6">
                  <h3 className="text-4xl font-bold text-red-600 mb-2">
                    Certificate of Appreciation
                  </h3>
                  <p className="text-gray-600">Blood Donation Program</p>
                </div>

                <div className="border-t-2 border-b-2 border-red-600 py-6 my-6">
                  <p className="text-gray-700 mb-2">This is proudly presented to</p>
                  <p className="text-3xl font-bold text-gray-800 mb-2">
                    {donor?.fullName || "Blood Donor"}
                  </p>
                  <p className="text-gray-700">
                    For your generous contribution to humanity
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 my-6 text-center">
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      {stats?.totalDonations || 0}
                    </p>
                    <p className="text-sm text-gray-600">Donations Made</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">
                      {stats?.livesImpacted || 0}
                    </p>
                    <p className="text-sm text-gray-600">Lives Impacted</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {stats?.achievementLevel || "Bronze"}
                    </p>
                    <p className="text-sm text-gray-600">Achievement Level</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-300">
                  <p className="text-gray-600 text-sm">
                    Issued on {new Date().toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    Blood Bank Management System
                  </p>
                </div>
              </div>

              <button
                onClick={downloadCertificate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Generating..." : "Download as PDF"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHARE ACHIEVEMENT MODAL */}
      {showModal === "share" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-green-600" />
                Share Achievement
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Achievement Summary */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 m-4 rounded-lg">
              <p className="text-center text-gray-800 font-semibold mb-2">
                Your Achievement
              </p>
              <p className="text-center text-gray-700">
                🩸 {stats?.totalDonations || 0} blood donations
              </p>
              <p className="text-center text-gray-700">
                ❤️ {stats?.livesImpacted || 0} lives impacted
              </p>
              <p className="text-center text-gray-700">
                ⭐ {stats?.achievementLevel || "Bronze"} Level
              </p>
            </div>

            {/* Social Media Buttons */}
            <div className="p-6 space-y-3">
              <button
                onClick={() => shareOnSocial("facebook")}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <Facebook className="w-5 h-5" />
                Share on Facebook
              </button>

              <button
                onClick={() => shareOnSocial("twitter")}
                className="w-full flex items-center justify-center gap-2 bg-sky-500 text-white py-3 rounded-lg font-semibold hover:bg-sky-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 10-7.5 10-7.5" />
                </svg>
                Share on Twitter
              </button>

              <button
                onClick={() => shareOnSocial("whatsapp")}
                className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Share on WhatsApp
              </button>

              <button
                onClick={() => shareOnSocial("linkedin")}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
                Share on LinkedIn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE DONATION MODAL */}
      {showModal === "schedule" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Schedule Donation
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={schedulingData.preferredDate}
                  onChange={(e) =>
                    setSchedulingData({
                      ...schedulingData,
                      preferredDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Time
                </label>
                <input
                  type="time"
                  value={schedulingData.preferredTime}
                  onChange={(e) =>
                    setSchedulingData({
                      ...schedulingData,
                      preferredTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  value={schedulingData.reason}
                  onChange={(e) =>
                    setSchedulingData({
                      ...schedulingData,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Why are you donating? (e.g., Regular donation, Help a friend, etc.)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 resize-none"
                  rows="3"
                />
              </div>

              <button
                onClick={handleScheduleDonation}
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Scheduling..." : "Schedule Donation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE FRIEND MODAL */}
      {showModal === "invite" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-600" />
                Invite Friend
              </h2>
              <button
                onClick={() => setShowModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Friend's Email
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Share why you believe in blood donation..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 resize-none"
                  rows="3"
                />
              </div>

              {/* Referral Code */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Your Referral Code:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${donor?._id?.slice(-8)}`}
                    className="flex-1 px-3 py-2 bg-white border border-orange-200 rounded text-sm"
                  />
                  <button
                    onClick={copyReferralCode}
                    className="bg-orange-600 text-white px-3 py-2 rounded hover:bg-orange-700 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleInviteFriend}
                disabled={loading}
                className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DonorActions;
