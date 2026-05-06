import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getAllFacilities,
  approveFacility,
  rejectFacility,
  getDashboardStats,
  getAllDonors,
  getAllCamps,
  getAllDonations,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/facilities", protect, getAllFacilities);
router.put("/facility/approve/:id", protect, approveFacility);
router.put("/facility/reject/:id", protect, rejectFacility);
router.get("/dashboard", protect, getDashboardStats);
router.get("/donors", getAllDonors);
router.get("/camps", protect, getAllCamps);
router.get("/donations", protect, getAllDonations);


export default router;
