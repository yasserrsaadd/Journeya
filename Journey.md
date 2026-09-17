# Project Prompt: Journeya Website (Final & Updated)

Create a modern, vibrant, and simple community website for an agency called "Journeya" that organizes social events and game nights.

## Tech Stack Requirements
- Use **plain HTML5, CSS3, JavaScript (ES6+), Bootstrap (via CDN), and Font Awesome (via CDN)** only. 
- Do NOT use React, Vite, Next.js, or any heavy frontend frameworks or build tools. Keep it purely as standard web files.

## Key Requirements

### 1. No Customer Accounts / No Login for Users
* Customers must **NOT** sign up, log in, or create passwords to use the site.
* All bookings must be instant guest checkouts where users simply enter their name, phone number, email, and required details.

### 2. User-Facing Features
* **Homepage & Sections:** Homepage, Events catalog, About Us, and Contact Us.
* **Event Filtering:** Users can filter all events easily by specific dates.
* **Event Types & Tickets:**
  * **Regular Events:** Uniform ticket pricing.
  * **Professional Events:** Multi-tier ticket options (e.g., Regular, Standard) with custom form fields to collect extra data like Instagram accounts and job titles.
* **Flexible Payments:** Support/mention for major payment methods (credit cards, mobile wallets, cash collection).

### 3. Admin Portal & Advanced Management
* **Secure Admin Login:** Password-protected admin page (e.g., `admin.html`) accessible ONLY to the team.
* **Event Creation & Options:**
  * **Media Uploads:** Integrate **Cloudinary** for uploading and storing event photos or video previews.
  * **Public vs. Private toggle:** Private events are hidden from the public website but automatically generate a unique public link for direct sharing.
  * **Core Fields:** Event name, event type, category, summary, date/time, location, seat number assignment (optional), and refund policy.
  * **Professional Event Options:** Multiple ticket tiers and custom fields for user details (IG account, job, etc.).
* **Reports, Insights & Analytics:**
  * Overview tracking what is selling and what isn't.
  * Day-of-the-week sales breakdown report per selected event (showing ticket volume sold on each day of the week).
  * **Customer Breakdown Lists:** Two clear sections separating **Frequent Customers** and **Non-Frequent Customers** complete with their names and phone numbers.

### 4. Backend & Storage
* **Supabase:** Connect via CDN to store database records (events, ticket tiers, and guest bookings).
* **Cloudinary:** Use Cloudinary's upload widget or API via script tags for handling photo and video asset management.