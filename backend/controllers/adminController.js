import Donor from "../models/donorModel.js";
import Facility from "../models/facilityModel.js";
import BloodCamp from "../models/bloodCampModel.js";

// 🧩 Get Dashboard Overview Stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalFacilities = await Facility.countDocuments();
    const pendingFacilities = await Facility.countDocuments({ status: "pending" });
    const approvedFacilities = await Facility.countDocuments({ status: "approved" });

    // Count total donations across all donors
    const donors = await Donor.find({}, "donationHistory");
    const totalDonations = donors.reduce(
      (sum, donor) => sum + (donor.donationHistory?.length || 0),
      0
    );

    const activeDonors = await Donor.countDocuments({ isEligible: true });

    res.status(200).json({
      totalDonors,
      totalFacilities,
      approvedFacilities,
      pendingFacilities,
      totalDonations,
      activeDonors,
      upcomingCamps: 3, // Placeholder
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// 🧍 Get All Donors
export const getAllDonors = async (req, res) => {
  try {
    // Note: This function was present in your code block but not used in the router
    const donors = await Donor.find().select("-password");
    res.status(200).json({ donors });
  } catch (err) {
    res.status(500).json({ message: "Error fetching donors" });
  }
};

// 🏥 Get All Facilities (Pending + Approved)
export const getAllFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.status(200).json({ facilities });
  } catch (err) {
    res.status(500).json({ message: "Error fetching facilities" });
  }
};

// ✅ Approve a Facility
export const approveFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    facility.status = "approved";

    // HISTORY LOGIC DELETED

    await facility.save();

    res.status(200).json({ message: "Facility approved", facility });
  } catch (err) {
    console.error("Facility Approval Error:", err);
    res.status(500).json({ message: "Error approving facility" });
  }
};

// 🏕️ Get All Blood Camps
export const getAllCamps = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const camps = await BloodCamp.find()
      .populate("hospital", "name email status")
      .sort({ date: -1 });

    res.status(200).json({ camps });
  } catch (err) {
    console.error("Admin Camps Error:", err);
    res.status(500).json({ message: "Error fetching camps" });
  }
};

// 🧾 Get All Donation Records
export const getAllDonations = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const donations = await Donor.aggregate([
      { $unwind: "$donationHistory" },
      {
        $lookup: {
          from: "facilities",
          localField: "donationHistory.facility",
          foreignField: "_id",
          as: "facility",
        },
      },
      {
        $project: {
          _id: 0,
          donorName: "$fullName",
          donorEmail: "$email",
          bloodGroup: "$donationHistory.bloodGroup",
          quantity: "$donationHistory.quantity",
          donationDate: "$donationHistory.donationDate",
          verified: "$donationHistory.verified",
          remarks: "$donationHistory.remarks",
          facility: { $arrayElemAt: ["$facility.name", 0] },
          facilityCity: { $arrayElemAt: ["$facility.address.city", 0] },
          facilityState: { $arrayElemAt: ["$facility.address.state", 0] },
        },
      },
      { $sort: { donationDate: -1 } },
    ]);

    res.status(200).json({ donations });
  } catch (err) {
    console.error("Admin Donations Error:", err);
    res.status(500).json({ message: "Error fetching donations" });
  }
};

// ❌ Reject / Update Facility Status to Rejected
export const rejectFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: "Facility not found" });

    const { rejectionReason } = req.body;
    if (!rejectionReason) return res.status(400).json({ message: "Rejection reason is required." });

    facility.status = "rejected";
    facility.rejectionReason = rejectionReason;

    // HISTORY LOGIC DELETED

    await facility.save();

    res.status(200).json({ message: "Facility rejected and status updated", facility });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting facility" });
  }
};