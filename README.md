# NEXUS Free Fire Tournament Website

A complete tournament management system for Free Fire competitions with admin dashboard.

## Features

- **Admin Dashboard**
  - Create and manage tournaments
  - View all registrations
  - Filter and export registration data
  - View detailed player/team information

- **Player Registration**
  - Register as individual, duo, or squad
  - View upcoming tournaments
  - Complete registration forms

- **Tournament Management**
  - Set prize pools, entry fees, and rules
  - Track participant counts
  - Manage tournament schedules

## Setup Instructions

1. **Firebase Configuration**
   - Create a Firebase project at [firebase.google.com](https://firebase.google.com)
   - Enable Authentication (Email/Password)
   - Enable Realtime Database
   - Enable Storage
   - Update `firebaseConfig` in `js/firebase.js` with your project details

2. **Admin Access**
   - Set up admin users in Firebase Authentication
   - Use the admin email/password to log in to the dashboard

3. **Deployment**
   - Host the files on any web server
   - For testing, you can use Firebase Hosting or GitHub Pages

## File Structure

- `css/` - Stylesheets
- `js/` - JavaScript files
- `images/` - Website images
- `index.html` - Home page
- `register.html` - Registration page
- `tournaments.html` - Tournament listings
- `contact.html` - Contact page
- `dashboard.html` - Admin dashboard

## Dependencies

- Firebase (Authentication, Realtime Database, Storage)
- Font Awesome (Icons)
- Google Fonts (Orbitron, Roboto)