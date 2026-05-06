# Donor Features Implementation Guide

## Overview
This guide explains the four new features added to the Donor Dashboard: Download Certificate, Share Achievement, Schedule Donation, and Invite Friend.

---

## 🎯 Features Implemented

### 1. Download Certificate
**Purpose**: Generate and download a professional PDF certificate of the donor's achievements.

**How It Works**:
- Donor clicks "Download Certificate" button on the dashboard
- A modal displays a preview of the certificate showing:
  - Donor's name
  - Total donations made
  - Lives impacted (calculated as donations × 3)
  - Achievement level (Bronze, Silver, Gold)
  - Issue date
- User can download the certificate as a PDF file

**Frontend Files**:
- `frontend/src/components/DonorActions.jsx` - Component that handles the certificate generation
- Uses `jsPDF` and `html2canvas` for PDF generation

**Dependencies Added**:
```bash
npm install jspdf html2canvas
```

---

### 2. Share Achievement
**Purpose**: Allow donors to share their accomplishments on social media platforms.

**How It Works**:
- Donor clicks "Share Achievement" button
- Modal displays their stats:
  - Number of donations
  - Lives impacted
  - Achievement level
- Options to share on:
  - Facebook
  - Twitter
  - WhatsApp
  - LinkedIn
- Pre-formatted message includes donation count and impact numbers
- Opens social media platform in a new window

**Supported Platforms**:
- Facebook
- Twitter (X)
- WhatsApp
- LinkedIn

**Frontend Files**:
- `frontend/src/components/DonorActions.jsx`

---

### 3. Schedule Donation
**Purpose**: Allow donors to book future donation appointments.

**How It Works**:
- Donor clicks "Schedule Donation" button
- Modal opens with:
  - Date picker (can only select future dates)
  - Time picker for appointment
  - Optional reason/notes field
  - Submit button
- Backend validates:
  - Date and time are not in the past
  - Donor is eligible to donate
  - Checks 90-day cooldown period
- Scheduled donation is saved to donor's profile

**API Endpoint**:
```
POST /api/donor/schedule-donation
Headers: Authorization: Bearer {token}
Body: {
  preferredDate: "2024-06-15",
  preferredTime: "10:30",
  facilityId: "optional-facility-id",
  reason: "Regular donation"
}
```

**Backend Files**:
- `backend/routes/donorRoutes.js` - New route `/schedule-donation`
- `backend/controllers/donorController.js` - `scheduleDonation` function
- `backend/models/donorModel.js` - New `scheduledDonations` field

---

### 4. Invite Friend
**Purpose**: Allow donors to invite friends to become blood donors through referral links.

**How It Works**:
- Donor clicks "Invite Friend" button
- Modal opens with:
  - Friend's email address input
  - Optional personal message
  - Referral code display (auto-generated)
  - Copy button for referral code
- Donor fills in friend's email and optional message
- System sends invitation notification
- Tracks referrals in donor's profile
- Shows unique referral code

**Features**:
- Auto-generates unique referral codes
- Prevents duplicate invitations to same email
- Tracks invitation status (pending, accepted, rejected)
- Personal message field for customization

**API Endpoint**:
```
POST /api/donor/invite-friend
Headers: Authorization: Bearer {token}
Body: {
  friendEmail: "friend@example.com",
  friendMessage: "Join me in saving lives!",
  referralCode: "auto-generated-code"
}
```

**Backend Files**:
- `backend/routes/donorRoutes.js` - New route `/invite-friend`
- `backend/controllers/donorController.js` - `inviteFriend` function
- `backend/models/donorModel.js` - New `referrals` field

---

## 📋 Database Schema Updates

### Donor Model New Fields

#### scheduledDonations Array
```javascript
{
  scheduledDate: Date,        // When the donation is scheduled
  scheduledTime: String,      // Time of the appointment
  facility: ObjectId,         // Reference to facility
  reason: String,             // Why donating
  status: String,             // scheduled, completed, cancelled, missed
  createdAt: Date             // When scheduled was created
}
```

#### referrals Array
```javascript
{
  email: String,              // Friend's email
  message: String,            // Invitation message
  referralCode: String,       // Unique referral code
  invitedAt: Date,            // When invited
  status: String              // pending, accepted, rejected
}
```

---

## 🚀 How to Use

### For Donors

#### Download Certificate
1. Go to Donor Dashboard
2. Scroll to "Quick Actions" section
3. Click "Download Certificate" button
4. Review the certificate preview
5. Click "Download as PDF"
6. Certificate will be saved with format: `YourName_Certificate_2024.pdf`

#### Share Achievement
1. Go to Donor Dashboard
2. Click "Share Achievement" button
3. Choose your preferred social media platform
4. System opens the platform with pre-filled message
5. Adjust the message if needed and share

#### Schedule Donation
1. Go to Donor Dashboard
2. Click "Schedule Donation" button
3. Select your preferred date (must be in the future)
4. Select your preferred time
5. (Optional) Add a reason for your donation
6. Click "Schedule Donation"
7. Receive confirmation message

#### Invite Friend
1. Go to Donor Dashboard
2. Click "Invite Friend" button
3. Enter your friend's email address
4. (Optional) Write a personal message
5. Your unique referral code is displayed
6. Copy the referral code if needed
7. Click "Send Invitation"
8. Your friend will receive an invitation

---

## 🔌 API Endpoints

### Schedule Donation
```
POST /api/donor/schedule-donation
Authorization: Bearer {token}

Request Body:
{
  "preferredDate": "2024-06-15",
  "preferredTime": "10:30",
  "facilityId": "optional",
  "reason": "Regular donation"
}

Response:
{
  "success": true,
  "message": "Donation scheduled successfully",
  "donation": {
    "date": "2024-06-15",
    "time": "10:30",
    "reason": "Regular donation",
    "status": "scheduled"
  }
}
```

### Invite Friend
```
POST /api/donor/invite-friend
Authorization: Bearer {token}

Request Body:
{
  "friendEmail": "friend@example.com",
  "friendMessage": "Join the blood donation movement!",
  "referralCode": "abc123xyz"
}

Response:
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitedEmail": "friend@example.com",
  "referralCode": "abc123xyz"
}
```

---

## ⚠️ Important Notes

### Certificate Generation
- Uses `html2canvas` to convert HTML to image, then `jsPDF` to create PDF
- Certificate includes all essential donation statistics
- Design is professional and print-ready
- Timestamp is current date when generated

### Schedule Donation
- Automatically checks donor eligibility (90-day cooldown)
- Only allows scheduling for future dates/times
- If donor is not eligible, shows next eligible date
- Scheduled donations are stored in database for future management

### Invite Friend
- Email addresses are validated
- Prevents duplicate invitations to same person
- Referral codes are unique per invitation
- Currently logs to console (in production, should send actual emails via nodemailer or similar)

### Social Sharing
- Each platform has slightly different message format support
- WhatsApp uses special encoding for links and spaces
- Facebook, Twitter, and LinkedIn use standard share parameters
- Opens in new window/tab

---

## 🔧 Troubleshooting

### Certificate Download Not Working
- Ensure `jsPDF` and `html2canvas` are installed: `npm install jspdf html2canvas`
- Check browser console for errors
- Verify donor has at least some donation history

### Scheduling Donation Fails
- Check that date is in the future
- Verify donor is eligible (check cooldown period)
- Ensure authentication token is valid
- Check network in browser dev tools

### Invite Friend Issues
- Verify email format is correct
- Check that friend's email hasn't been invited before
- Ensure backend API is running
- Check console logs for error messages

### Social Share Not Opening
- Disable popup blockers
- Ensure social media platforms are accessible
- Check that window.open() is not blocked

---

## 📝 Future Enhancements

1. **Email Notifications**
   - Send actual emails for invitations
   - Send reminders for scheduled donations
   - Email certificates to donors

2. **Analytics**
   - Track which platforms are used for sharing
   - Monitor referral conversion rates
   - Dashboard for donation schedules

3. **Calendar Integration**
   - Sync with Google Calendar or Outlook
   - Automatic reminders before scheduled donations

4. **Achievement Badges**
   - More granular achievement levels
   - Display badges on profile
   - Share badge achievements

5. **Notification System**
   - Push notifications for scheduled donations
   - In-app notifications for invitations accepted
   - Email confirmations

---

## 📞 Support

For issues or questions:
1. Check the logs in backend console
2. Review network requests in browser DevTools
3. Verify all packages are installed correctly
4. Ensure environment variables are set correctly
5. Check database connection for model validation

---

## 📅 Version History

- **v1.0** - Initial implementation (June 2024)
  - Added Download Certificate feature
  - Added Share Achievement feature
  - Added Schedule Donation feature
  - Added Invite Friend feature
  - Updated Donor model with new fields
  - Created comprehensive API endpoints
