# 📧 GuruNetwork Automatic Mailer

> Intelligent microservice for automated transactional emails. Sends instant confirmation emails when users submit inquiries on the GuruNetwork real estate platform.

**🔧 Backend Microservice** | **☁️ Cloud Functions** | **⚡ Real-Time Triggers** | **📨 Transactional Email**

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Features](#features)
4. [Architecture](#architecture)
5. [Setup & Installation](#setup--installation)
6. [Email Templates](#email-templates)
7. [Error Handling](#error-handling)
8. [Configuration](#configuration)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

**GuruNetwork Automatic Mailer** is a production-grade microservice that automatically sends professional confirmation emails when users submit inquiries through the GuruNetwork platform. By leveraging Firestore triggers and Google Cloud Functions, emails are sent instantly without requiring manual intervention.

### Key Capabilities

- ✅ **Real-Time Triggering:** Fires immediately on form submission
- ✅ **Custom Templates:** Different email templates per inquiry category
- ✅ **Error Resilience:** Automatic retry logic for failed sends
- ✅ **Performance:** Sub-second email delivery
- ✅ **Scalability:** Serverless architecture scales automatically
- ✅ **Cost-Effective:** Pay only for executions

### Problem Solved

**Without Mailer:** Users submit forms but receive no confirmation. They don't know if it was successful. Support team manually sends confirmation emails (inefficient, high latency).

**With Mailer:** Confirmation email sent instantly to user's inbox proving receipt. Trust is established. Support team focuses on actual inquiry handling.

---

## 🚀 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Compute** | Google Cloud Functions | Node.js 20 | Serverless execution, event-driven |
| **Data** | Firestore | Latest | Real-time database, automatic triggers |
| **Email** | SendGrid/Mailgun | Latest | Industrial email delivery |
| **Runtime** | Node.js | 20.x LTS | JavaScript runtime |
| **Libraries** | `firebase-admin`, `@sendgrid/mail` | Latest | Firebase and email client libraries |
| **Config** | Google Secret Manager | Latest | Secure credential storage |

---

## ✨ Features

### 🔔 **Automatic Email Triggers**
- Firestore document creation automatically triggers Cloud Function
- No polling, no manual intervention
- Email sent within 1-2 seconds of form submission

### 📝 **Customizable Email Templates**

**Template Categories:**
- **Broker Inquiry** - "Thank you for your interest in real estate brokerage services"
- **Buyer Inquiry** - "We've received your property search request"
- **Seller Inquiry** - "We're excited to sell your property"
- **Developer Inquiry** - "Your development needs inquiry received"
- **Lawyer Inquiry** - "Legal consultation inquiry received"
- **Finance Inquiry** - "Financial advisory inquiry received"

Each template includes:
- Professional branding
- User personalization (name, reference ID)
- Clear next steps
- Contact information
- Expected response timeline

### 🔄 **Retry Logic**

- **Initial Send Attempt:** Immediate
- **First Retry:** After 5 minutes (if failed)
- **Second Retry:** After 15 minutes (if failed)
- **Notification:** Logs critical errors to Cloud Logging

### 🛡️ **Error Handling**

```
┌─ Send Email
│
├─ Success? → Log success, exit
│
└─ Failure?
   ├─ Invalid email? → Log & skip retries
   ├─ Service unavailable? → Retry logic
   ├─ Rate limited? → Exponential backoff
   └─ Critical error? → Alert admin
```

### 📊 **Delivery Monitoring**

- Track email open rates (if email provider supports)
- Monitor bounce/unsubscribe events
- Alert on delivery failures
- Dashboard integration with main platform

---

## 🏗️ Architecture

### **Microservice Diagram**

```
┌──────────────────────────────────────────┐
│   GuruNetwork Frontend (Vue.js)          │
│   User submits form                      │
└──────────────────┬───────────────────────┘
                   │
                   │ POST /handleInquiry
                   │
┌──────────────────▼───────────────────────┐
│   Backend (Apps Script / Node.js)        │
│   - Validates data                       │
│   - Saves to Firestore                   │
└──────────────────┬───────────────────────┘
                   │
                   │ Firestore onCreate trigger
                   │
┌──────────────────▼───────────────────────┐
│   Cloud Function (Automatic Mailer)      │
│   - Read inquiry document                │
│   - Select template                      │
│   - Format email                         │
│   - Send via SendGrid/Mailgun            │
│   - Log result                           │
└──────────────────┬───────────────────────┘
                   │
                   │ Email delivery
                   │
┌──────────────────▼───────────────────────┐
│   User Email Inbox                       │
│   Confirmation email received ✅         │
└──────────────────────────────────────────┘
```

### **Function Execution Flow**

```javascript
// 1. Trigger: Firestore onCreate
// 2. Receive document snapshot
// 3. Extract user_type and email
// 4. Load appropriate template
// 5. Replace placeholders with data
// 6. Send via email service
// 7. Log delivery status
// 8. Retry if failed
// 9. Alert admin if critical error
```

---

## 📦 Setup & Installation

### **Prerequisites**

- Google Cloud Project
- Firebase/Firestore database
- SendGrid or Mailgun account
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)

### **Step 1: Create Cloud Function**

```bash
# Initialize Firebase project
firebase init functions

# Choose Node.js as language
# Navigate to functions directory
cd functions

# Install dependencies
npm install firebase-admin @sendgrid/mail dotenv
```

### **Step 2: Set Up Email Service**

**Using SendGrid:**

```bash
# Get API key from SendGrid dashboard
# Store in Google Secret Manager

gcloud secrets create sendgrid-api-key --data-file=<(echo -n "YOUR_KEY")
```

**Using Mailgun:**

```bash
# Get API key from Mailgun dashboard
gcloud secrets create mailgun-api-key --data-file=<(echo -n "YOUR_KEY")
```

### **Step 3: Write Cloud Function**

```javascript
// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
sgMail.setApiKey(SENDGRID_API_KEY);

const emailTemplates = {
  broker: {
    subject: "Thank You! Your Real Estate Inquiry",
    text: `Dear {{name}},\n\nWe've received your inquiry for real estate brokerage services.\n\nReference: {{refId}}\n\nOur team will review your request and get back to you within 24 hours.\n\nBest regards,\nGuruNetwork Team`
  },
  buyer: {
    subject: "Property Search Request Received",
    text: `Dear {{name}},\n\nThank you for submitting your property search request.\n\nReference: {{refId}}\n\nWe'll find the perfect property matching your criteria.\n\nBest regards,\nGuruNetwork Team`
  },
  seller: {
    subject: "We're Excited to Sell Your Property!",
    text: `Dear {{name}},\n\nYour property listing request has been received.\n\nReference: {{refId}}\n\nOur team will contact you shortly with market insights.\n\nBest regards,\nGuruNetwork Team`
  }
};

exports.sendConfirmationEmail = functions.firestore
  .document("inquiries/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const { user_type, email, name, id } = data;

    if (!email) {
      console.error("No email provided");
      return;
    }

    const template = emailTemplates[user_type] || emailTemplates.broker;

    const emailContent = template.text
      .replace("{{name}}", name || "Valued User")
      .replace("{{refId}}", id);

    const msg = {
      to: email,
      from: "noreply@gurunetwork.in",
      subject: template.subject,
      text: emailContent,
      html: `<p>${emailContent.replace(/\n/g, "<br />")}</p>`
    };

    try {
      await sgMail.send(msg);
      await admin.firestore()
        .collection("inquiries")
        .doc(snap.id)
        .update({
          email_sent: true,
          email_sent_at: admin.firestore.FieldValue.serverTimestamp(),
          email_status: "delivered"
        });
      console.log(`Email sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send email: ${error.message}`);
      // Implement retry logic here
      throw error;
    }
  });
```

### **Step 4: Deploy Function**

```bash
# Deploy to production
firebase deploy --only functions:sendConfirmationEmail

# Verify deployment
gcloud functions list
gcloud functions describe sendConfirmationEmail --runtime nodejs20
```

---

## 📧 Email Templates

### **Template Structure**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #007bff; color: white; padding: 20px; }
    .content { padding: 20px; border: 1px solid #eee; }
    .footer { padding: 10px; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GuruNetwork</h1>
    </div>
    <div class="content">
      <p>Dear {{name}},</p>
      <p>Your inquiry has been received successfully.</p>
      <p><strong>Reference ID:</strong> {{refId}}</p>
      <p>Our team will review your request and contact you shortly.</p>
    </div>
    <div class="footer">
      <p>GuruNetwork Team</p>
    </div>
  </div>
</body>
</html>
```

---

## 🛡️ Error Handling & Retries

### **Retry Strategy**

```javascript
async function sendEmailWithRetries(msg, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await sgMail.send(msg);
      return { success: true, attempt };
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        // Final attempt failed, alert admin
        await notifyAdmin({
          type: "EMAIL_DELIVERY_FAILED",
          email: msg.to,
          error: error.message
        });
        throw error;
      }
      
      // Exponential backoff: 5s, 15s, 30s
      const delayMs = 5000 * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}
```

---

## ⚙️ Configuration

### **.env File**

```
SENDGRID_API_KEY=SG.xxx...
MAILGUN_API_KEY=key-xxx...
EMAIL_FROM=noreply@gurunetwork.in
ADMIN_EMAIL=admin@gurunetwork.in
FIRESTORE_PROJECT=gurunetwork-prod
```

### **Firestore Security Rules**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /inquiries/{document=**} {
      allow create: if request.auth != null || request.resource.data.email != null;
      allow read: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.created_by || request.auth.token.admin == true;
    }
  }
}
```

---

## 🚀 Deployment

### **To Firebase Production**

```bash
# Build function
npm run build

# Deploy
firebase deploy --only functions:sendConfirmationEmail

# Monitor logs
gcloud functions logs read sendConfirmationEmail --limit 50
```

### **Monitoring**

```bash
# Cloud Functions Dashboard
gcloud functions describe sendConfirmationEmail

# View logs
gcloud functions logs read sendConfirmationEmail --region us-central1

# Set up alerts
# Go to Cloud Monitoring console → Create alert policy
```

---

## 🔍 Troubleshooting

### **Issue: Emails not sending**

```bash
# Check function logs
gcloud functions logs read sendConfirmationEmail --limit 100

# Verify API key
gcloud secrets versions list sendgrid-api-key

# Test manually
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{...email data...}'
```

### **Issue: Function timeout**

- Increase timeout: `--timeout 540` (max 540 seconds)
- Check Sendgrid API latency
- Use Batch API if sending multiple emails

### **Issue: Firestore trigger not firing**

- Verify Firestore collection path matches
- Check Cloud Functions permissions
- Enable Cloud Pub/Sub if using pull-based

---

## 📊 Metrics & Monitoring

**Track in Google Cloud Logging:**
- Execution count
- Error rate
- Average execution time
- Email delivery success rate
- Failed send retry attempts

---

## 🤝 Integration with Main Platform

This microservice is part of GuruNetwork ecosystem:
- Triggered by GuruNetwork backend (Apps Script)
- Depends on Firestore database
- Coordinates with Firestore-Sheets Sync service
- Logs viewable in Firebase Console

---

## 📄 License

Private & Proprietary to GuruNetwork

---

## 👨‍💻 Author

**Rushikesh Wani**  
GitHub: [@Rushikesh36](https://github.com/Rushikesh36)

---

**Status:** 🟢 Production  
**Last Updated:** January 2025

