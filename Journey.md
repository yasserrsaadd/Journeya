# Project Prompt: Journeya Website

Create a modern, vibrant, and simple community website for an agency called "Journeya" that organizes social events (like game nights) and weekend trips (to destinations like El Sokhna and Nuweiba).

## Tech Stack Requirements
- Use **plain HTML5, CSS3, JavaScript (ES6+), Bootstrap (via CDN), and Font Awesome (via CDN)** only. 
- Do NOT use React, Vite, Next.js, or any heavy frontend frameworks or build tools. Keep it purely as standard web files.

## Key Requirements

### 1. No Customer Accounts / No Login
* Customers must **NOT** sign up, log in, or create passwords to use the site.
* All bookings must be instant guest checkouts where users simply enter their name, phone number, and email.

### 2. Website Sections
* **Homepage:** Vibrant hero section with welcoming imagery, quick navigation buttons to Events or Trips, and upcoming activity highlights.
* **Events Section:** Clean catalog of social gatherings and game nights, showing date, time, location, and a quick guest-booking button.
* **Trips Section:** Catalog of getaways (El Sokhna, Nuweiba, etc.) with photo layouts, itineraries, inclusions, and a guest checkout form.
* **About Us Section:** Sharing Journeya's mission of building a real-world community through games and travel.
* **Contact Us Section:** Social links, WhatsApp contact, email, and a simple message inquiry form.
* **Flexible Payments:** Support/mention for major payment methods (credit cards, mobile wallets, cash collection).

### 3. Backend & Admin Portal
* **Supabase Integration:** Connect using its JavaScript client library via CDN to handle database storage (storing trips, events, and guest bookings).
* **Secure Admin Portal:** Create a password-protected admin page (e.g., `admin.html`) accessible ONLY to the team via a private login check.
* **Admin Capabilities:** The admin panel should allow the team to easily add new trips/events via simple forms, update info, and view clean guest lists (names and phone numbers) fetched from Supabase.