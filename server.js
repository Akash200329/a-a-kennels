const express = require("express");
const mysql = require("mysql2"); // Changed to mysql2
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const session = require("express-session");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const app = express();

require("dotenv").config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});



// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);


// Multer Setup for Cloudinary Uploads
const upload = multer({ storage: multer.memoryStorage() });

// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "stud_db",
    ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_CA) // Added SSL for Aiven
    }
});
db.connect((err) => {
    if (err) {
        console.error('Error connecting to Aiven MySQL:', err);
        return;
    }
    console.log('Connected to Aiven MySQL!');
});

// Middleware to Check Admin Role
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.redirect("/login");
  }
  next();
};

// Email Test Route (for debugging)
app.get("/test-email", (req, res) => {
  transporter.sendMail(
    {
      from: process.env.EMAIL_USER,
      to: "akashnayak200329@gmail.com",
      subject: "Test Email from A&A Kennels",
      text: "This is a test email to confirm Nodemailer is working.",
    },
    (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Email sending failed.");
      }
      console.log("Email sent:", info.response);
      res.send("Test email sent successfully.");
    }
  );
});

// Root Route (View Male Studs)
app.get("/", (req, res) => {
  const sql = "SELECT id, name, lineage, color, temperament, age, location, image FROM male_studs";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send("Internal Server Error");
    }

    let pageContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Our Male Studs - A&A Kennels</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <link rel="stylesheet" href="/style.css">
          <style>
              /* Reset and Base Styles */
              * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                  scroll-behavior: smooth;
              }

              body {
                  background: linear-gradient(135deg, #0f172a, #1e2a38);
                  font-family: 'Montserrat', sans-serif;
                  color: #e2e8f0;
                  margin: 0;
                  padding: 0;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  position: relative;
                  overflow-x: hidden;
              }

              /* Enhanced Particle Background */
              body::before {
                  content: '';
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="10" cy="10" r="2" fill="rgba(52, 152, 219, 0.3)" opacity="0.6"><animate attributeName="cx" from="10" to="100%" dur="8s" repeatCount="indefinite" /><animate attributeName="cy" from="10" to="100%" dur="12s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="4s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.3)" opacity="0.6"><animate attributeName="cx" from="50%" to="0" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="100%" dur="6s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="5s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(52, 152, 219, 0.3)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="9s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="3s" repeatCount="indefinite" /></circle></svg>');
                  z-index: -1;
                  pointer-events: none;
                  animation: subtleMove 20s infinite linear;
              }

              @keyframes subtleMove {
                  0% { transform: translate(0, 0) scale(1); }
                  50% { transform: translate(20px, -20px) scale(1.05); }
                  100% { transform: translate(0, 0) scale(1); }
              }

              /* Header with Enhanced Glassmorphism and Neon Glow */
              header {
                  background: rgba(15, 23, 42, 0.4);
                  backdrop-filter: blur(15px);
                  -webkit-backdrop-filter: blur(15px);
                  padding: 25px 20px;
                  text-align: center;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 20px;
                  border-radius: 20px;
                  margin: 20px auto;
                  max-width: 1300px;
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  animation: slideDown 1.2s ease-out;
                  position: relative;
                  overflow: hidden;
                  z-index: 2;
              }

              header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(52, 152, 219, 0.3) 0%, transparent 70%);
                  animation: rotateGlow 10s infinite linear;
              }

              @keyframes rotateGlow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }

              header img {
                  width: 100px;
                  height: auto;
                  border-radius: 50%;
                  transition: transform 0.4s ease, box-shadow 0.4s ease;
                  box-shadow: 0 0 20px rgba(230, 126, 34, 0.8), 0 0 30px rgba(52, 152, 219, 0.6);
                  animation: pulse 2.5s infinite ease-in-out;
              }

              header img:hover {
                  transform: scale(1.15) rotate(10deg);
                  box-shadow: 0 0 30px rgba(230, 126, 34, 1), 0 0 40px rgba(52, 152, 219, 0.9);
              }

              @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.08); }
              }

              header h1 {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 3em;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 5px;
                  background: linear-gradient(45deg, #f97316, #3b82f6);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                  transition: transform 0.4s ease, text-shadow 0.4s ease;
              }

              header h1:hover {
                  transform: translateY(-5px);
                  text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
              }

              /* Stud Container with Enhanced Grid Layout */
              .stud-container {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
                  gap: 35px;
                  max-width: 1400px;
                  margin: 50px auto;
                  padding: 0 20px;
                  position: relative;
                  z-index: 1;
              }

              /* Stud Card with Advanced Glassmorphism and 3D Effects */
              .stud-card {
                  background: rgba(15, 23, 42, 0.3);
                  backdrop-filter: blur(12px);
                  -webkit-backdrop-filter: blur(12px);
                  border-radius: 20px;
                  overflow: hidden;
                  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  transition: transform 0.5s ease, box-shadow 0.5s ease, background 0.5s ease;
                  position: relative;
                  animation: fadeIn 0.8s ease-out;
                  z-index: 1;
                  transform-style: preserve-3d;
                  perspective: 1000px;
              }

              .stud-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                  opacity: 0;
                  transition: opacity 0.5s ease;
                  z-index: -1;
              }

              .stud-card:hover::before {
                  opacity: 1;
              }

              .stud-card:hover {
                  transform: translateY(-10px) scale(1.03) rotateX(5deg) rotateY(5deg);
                  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                  background: rgba(15, 23, 42, 0.5);
              }

              .stud-card img {
                  width: 100%;
                  height: 270px;
                  object-fit: cover;
                  border-bottom: 3px solid transparent;
                  transition: transform 0.5s ease, border-color 0.5s ease, filter 0.5s ease;
                  position: relative;
                  z-index: 1;
              }

              .stud-card:hover img {
                  transform: scale(1.1);
                  border-bottom: 3px solid #3b82f6;
                  filter: brightness(1.1);
              }

              /* Stud Info with Enhanced Typography and Glow */
              .stud-info {
                  padding: 25px;
                  position: relative;
                  z-index: 1;
                  background: linear-gradient(180deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.9));
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
              }

              .stud-info h2 {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 1.9em;
                  color: #3b82f6;
                  margin: 0 0 15px 0;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  text-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
                  transition: color 0.4s ease, text-shadow 0.4s ease;
              }

              .stud-info h2:hover {
                  color: #f97316;
                  text-shadow: 0 0 20px rgba(249, 115, 22, 0.9);
              }

              .stud-info p {
                  font-size: 1em;
                  margin: 10px 0;
                  color: #cbd5e1;
                  font-weight: 300;
                  transition: color 0.4s ease, transform 0.4s ease;
              }

              .stud-info p strong {
                  color: #f97316;
                  font-weight: 600;
                  text-shadow: 0 0 8px rgba(249, 115, 22, 0.5);
                  transition: color 0.4s ease, text-shadow 0.4s ease;
              }

              .stud-info p:hover {
                  color: #ffffff;
                  transform: translateX(5px);
              }

              .stud-info p:hover strong {
                  color: #3b82f6;
                  text-shadow: 0 0 12px rgba(59, 130, 246, 0.7);
              }

              /* Action Buttons with Enhanced Neumorphism and Glow */
              .action-buttons {
                  display: ${req.session.user && req.session.user.role === "admin" ? "flex" : "none"};
                  gap: 12px;
                  justify-content: center;
                  padding: 15px;
                  background: rgba(59, 130, 246, 0.15);
                  border-top: 1px solid rgba(255, 255, 255, 0.1);
                  position: relative;
                  z-index: 1;
              }

              .action-buttons button {
                  padding: 10px 20px;
                  border: none;
                  border-radius: 10px;
                  font-size: 0.95em;
                  font-weight: 600;
                  cursor: pointer;
                  transition: all 0.4s ease;
                  text-transform: uppercase;
                  letter-spacing: 1.5px;
                  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
                  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4), -3px -3px 10px rgba(255, 255, 255, 0.05);
                  position: relative;
                  overflow: hidden;
                  z-index: 1;
              }

              .action-buttons button::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                  transition: left 0.6s ease;
              }

              .action-buttons button:hover::before {
                  left: 100%;
              }

              .action-buttons button:first-child {
                  background: #3b82f6;
                  color: #ffffff;
              }

              .action-buttons button:first-child:hover {
                  background: #2563eb;
                  transform: translateY(-3px);
                  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.6);
              }

              .action-buttons button.delete-btn {
                  background: #ef4444;
                  color: #ffffff;
              }

              .action-buttons button.delete-btn:hover {
                  background: #dc2626;
                  transform: translateY(-3px);
                  box-shadow: 0 6px 15px rgba(239, 68, 68, 0.6);
              }

              /* Footer with Enhanced Glassmorphism */
              footer {
                  background: rgba(15, 23, 42, 0.4);
                  backdrop-filter: blur(15px);
                  -webkit-backdrop-filter: blur(15px);
                  padding: 25px;
                  text-align: center;
                  margin-top: auto;
                  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                  border-top: 1px solid rgba(255, 255, 255, 0.15);
              }

              footer .contact-section {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                  gap: 20px;
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 15px 0;
              }

              footer p {
                  margin: 5px 0;
                  font-size: 1.1em;
                  color: #e2e8f0;
                  font-weight: 400;
              }

              footer a {
                  color: #3b82f6;
                  text-decoration: none;
                  transition: color 0.4s ease, transform 0.4s ease;
                  display: inline-flex;
                  align-items: center;
                  gap: 10px;
                  font-size: 1.2em;
                  font-weight: 500;
              }

              footer a:hover {
                  color: #f97316;
                  transform: translateX(8px);
              }

              footer i {
                  font-size: 1.8em;
                  transition: transform 0.4s ease;
              }

              footer a:hover i {
                  transform: scale(1.3) rotate(5deg);
              }

              /* Links Section with Enhanced Neumorphism */
              .links {
                  margin: 30px auto;
                  text-align: center;
                  display: flex;
                  justify-content: center;
                  gap: 20px;
                  flex-wrap: wrap;
              }

              .links a {
                  display: inline-block;
                  padding: 12px 25px;
                  background: rgba(15, 23, 42, 0.6);
                  color: #e2e8f0;
                  text-decoration: none;
                  border-radius: 10px;
                  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4), -3px -3px 10px rgba(255, 255, 255, 0.05);
                  transition: all 0.4s ease;
                  font-size: 1em;
                  font-weight: 500;
                  position: relative;
                  overflow: hidden;
              }

              .links a::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                  transition: left 0.6s ease;
              }

              .links a:hover::before {
                  left: 100%;
              }

              .links a:hover {
                  background: rgba(59, 130, 246, 0.4);
                  transform: translateY(-3px);
                  box-shadow: 0 6px 15px rgba(59, 130, 246, 0.5);
                  color: #ffffff;
              }

              /* No Studs Message with Enhanced Animation */
              .no-studs {
                  text-align: center;
                  font-size: 1.3em;
                  color: #94a3b8;
                  padding: 50px;
                  animation: fadeIn 1.2s ease-out;
                  background: rgba(15, 23, 42, 0.5);
                  border-radius: 15px;
                  max-width: 600px;
                  margin: 50px auto;
                  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
              }

              /* Animations */
              @keyframes slideDown {
                  from {
                      opacity: 0;
                      transform: translateY(-60px);
                  }
                  to {
                      opacity: 1;
                      transform: translateY(0);
                  }
              }

              @keyframes fadeIn {
                  from {
                      opacity: 0;
                      transform: translateY(30px);
                  }
                  to {
                      opacity: 1;
                      transform: translateY(0);
                  }
              }

              /* Responsive Design */
              @media (max-width: 768px) {
                  header {
                      flex-direction: column;
                      margin: 15px;
                      padding: 15px;
                  }

                  header img {
                      width: 80px;
                  }

                  header h1 {
                      font-size: 2em;
                  }

                  .stud-container {
                      grid-template-columns: 1fr;
                      gap: 25px;
                  }

                  .stud-card img {
                      height: 220px;
                  }

                  .stud-info h2 {
                      font-size: 1.6em;
                  }

                  .links {
                      flex-direction: column;
                      gap: 15px;
                  }

                  footer .contact-section {
                      grid-template-columns: 1fr;
                  }
              }

              @media (max-width: 480px) {
                  header img {
                      width: 70px;
                  }

                  header h1 {
                      font-size: 1.6em;
                  }

                  .stud-card img {
                      height: 200px;
                  }

                  .stud-info h2 {
                      font-size: 1.4em;
                  }

                  .stud-info p {
                      font-size: 0.95em;
                  }

                  .action-buttons button {
                      padding: 8px 15px;
                      font-size: 0.85em;
                  }

                  .links a {
                      padding: 10px 20px;
                      font-size: 0.9em;
                  }
              }
          </style>
      </head>
      <body>
          <header>
              <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
              <h1>A&A Kennels - Our Male Studs</h1>
          </header>
          <div class="stud-container">`;

    if (results.length === 0) {
      pageContent += `
          <div class="no-studs">
              <p>No male studs available at the moment. Check back later!</p>
          </div>`;
    } else {
      results.forEach((stud) => {
        pageContent += `
            <div class="stud-card">
                ${stud.image ? `<img src="${stud.image}" alt="${stud.name}">` : '<div style="height: 270px; background: #1e293b; display: flex; align-items: center; justify-content: center; color: #e2e8f0;">No Image</div>'}
                <div class="stud-info">
                    <h2>${stud.name || "Unnamed Stud"}</h2>
                    <p><strong>Lineage:</strong> ${stud.lineage || "N/A"}</p>
                    <p><strong>Color:</strong> ${stud.color || "N/A"}</p>
                    <p><strong>Temperament:</strong> ${stud.temperament || "N/A"}</p>
                    <p><strong>Age:</strong> ${stud.age || "N/A"} years</p>
                    <p><strong>Location:</strong> ${stud.location || "N/A"}</p>
                </div>
                ${req.session.user && req.session.user.role === "admin" ? `
                    <div class="action-buttons">
                        <button onclick="location.href='/update-male-stud/${stud.id}'">Update</button>
                        <button class="delete-btn" onclick="deleteStud(${stud.id})">Delete</button>
                    </div>
                ` : ""}
            </div>`;
      });
    }

    pageContent += `
          </div>
          <div class="links">
              ${req.session.user && req.session.user.role === "admin" ? '<a href="/admin-dashboard">Admin Dashboard</a>' : '<a href="/login">Admin</a>'}
              ${req.session.user ? '<a href="/logout">Logout</a>' : ""}
          </div>
          <footer>
              <p>Contact Us:</p>
              <div class="contact-section">
                  <p>
                      <a href="https://wa.me/917338040633" target="_blank">
                          <i class="fab fa-whatsapp"></i> 7338040633
                      </a>
                  </p>
                  <p>
                      <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                          <i class="fab fa-facebook-f"></i> A&A Kennels
                      </a>
                  </p>
              </div>
          </footer>
          <script>
              function deleteStud(id) {
                  if (confirm("Are you sure you want to delete this stud?")) {
                      fetch('/delete-male-stud/' + id, { method: 'DELETE' })
                          .then(response => response.json())
                          .then(data => {
                              if (data.success) {
                                  location.reload();
                              } else {
                                  alert('Failed to delete stud: ' + (data.error || 'Unknown error'));
                              }
                          })
                          .catch(error => alert('Error deleting stud: ' + error));
                  }
              }
          </script>
      </body>
      </html>`;

    res.send(pageContent);
  });
});

// Login Route
app.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/admin-dashboard");
  res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Admin Login - A&A Kennels</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta charset="UTF-8">
          <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
          <style>
              /* Reset and Base Styles */
              * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                  scroll-behavior: smooth;
              }

              body {
                  background: linear-gradient(135deg, #0f172a, #1e2a38);
                  font-family: 'Montserrat', sans-serif;
                  color: #e2e8f0;
                  min-height: 100vh;
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  overflow-x: hidden;
                  position: relative;
                  z-index: 1;
                  padding-bottom: 60px; /* Space for footer */
              }

              /* Advanced Particle Background with Dynamic Animation */
              body::before {
                  content: '';
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                  z-index: -1;
                  animation: particleFlow 20s infinite linear;
              }

              @keyframes particleFlow {
                  0% { transform: translate(0, 0) scale(1); }
                  50% { transform: translate(15px, -15px) scale(1.1); }
                  100% { transform: translate(0, 0) scale(1); }
              }

              /* Header with Glassmorphism and Neon Glow */
              header {
                  background: rgba(15, 23, 42, 0.4);
                  backdrop-filter: blur(15px);
                  -webkit-backdrop-filter: blur(15px);
                  padding: 20px;
                  text-align: center;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                  border-radius: 20px;
                  margin-bottom: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 20px;
                  border: 1px solid rgba(255, 255, 255, 0.15);
                  position: relative;
                  overflow: hidden;
                  animation: slideDown 1.2s ease-out;
              }

              header::before {
                  content: '';
                  position: absolute;
                  top: -50%;
                  left: -50%;
                  width: 200%;
                  height: 200%;
                  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                  animation: rotateGlow 12s infinite linear;
                  z-index: -1;
              }

              @keyframes rotateGlow {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
              }

              header img {
                  width: 100px;
                  height: auto;
                  border-radius: 50%;
                  transition: transform 0.4s ease, box-shadow 0.4s ease;
                  box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                  animation: pulse 2.5s infinite ease-in-out;
              }

              header img:hover {
                  transform: scale(1.15) rotate(10deg);
                  box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
              }

              @keyframes pulse {
                  0%, 100% { transform: scale(1); }
                  50% { transform: scale(1.08); }
              }

              header h1 {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 2.5em;
                  margin: 0;
                  text-transform: uppercase;
                  letter-spacing: 4px;
                  background: linear-gradient(45deg, #f97316, #3b82f6);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                  transition: transform 0.4s ease, text-shadow 0.4s ease;
              }

              header h1:hover {
                  transform: translateY(-5px);
                  text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
              }

              /* Login Container with Advanced Glassmorphism and 3D Effects */
              .login-container {
                  background: rgba(15, 23, 42, 0.3);
                  backdrop-filter: blur(15px);
                  -webkit-backdrop-filter: blur(15px);
                  padding: 40px;
                  border-radius: 20px;
                  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  width: 100%;
                  max-width: 450px;
                  text-align: center;
                  position: relative;
                  overflow: hidden;
                  animation: fadeInUp 1s ease-out;
                  transform-style: preserve-3d;
                  perspective: 1000px;
                  margin-bottom: 20px; /* Additional space above footer */
              }

              .login-container::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                  opacity: 0;
                  transition: opacity 0.5s ease;
                  z-index: -1;
              }

              .login-container:hover::before {
                  opacity: 1;
              }

              .login-container:hover {
                  transform: translateY(-10px) scale(1.02) rotateX(5deg);
                  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
              }

              h2 {
                  font-family: 'Orbitron', sans-serif;
                  font-size: 2.2em;
                  color: #3b82f6;
                  margin-bottom: 30px;
                  text-transform: uppercase;
                  letter-spacing: 3px;
                  text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                  animation: neonPulse 3s infinite alternate;
              }

              @keyframes neonPulse {
                  0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                  100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
              }

              /* Form Input Fields with 3D and Glow Effects */
              input[type="text"],
              input[type="password"] {
                  width: 100%;
                  padding: 15px;
                  margin: 10px 0;
                  border: none;
                  border-radius: 10px;
                  background: rgba(15, 23, 42, 0.6);
                  color: #e2e8f0;
                  font-size: 1em;
                  box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.3), inset -3px -3px 6px rgba(255, 255, 255, 0.1);
                  transition: all 0.4s ease;
                  outline: none;
                  position: relative;
                  z-index: 1;
              }

              input[type="text"]::placeholder,
              input[type="password"]::placeholder {
                  color: #94a3b8;
                  opacity: 0.7;
                  transition: color 0.4s ease;
              }

              input[type="text"]:focus,
              input[type="password"]:focus {
                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6), inset 2px 2px 4px rgba(0, 0, 0, 0.2);
                  background: rgba(15, 23, 42, 0.8);
                  transform: translateY(-2px);
              }

              input[type="text"]:hover,
              input[type="password"]:hover {
                  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5), inset 2px 2px 4px rgba(0, 0, 0, 0.2);
              }

              /* Submit Button with Neumorphism and Glow */
              button {
                  width: 100%;
                  padding: 15px;
                  margin-top: 20px;
                  border: none;
                  border-radius: 10px;
                  background: linear-gradient(45deg, #3b82f6, #f97316);
                  color: #ffffff;
                  font-family: 'Orbitron', sans-serif;
                  font-size: 1.1em;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 2px;
                  cursor: pointer;
                  box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4), -3px -3px 10px rgba(255, 255, 255, 0.1);
                  transition: all 0.4s ease;
                  position: relative;
                  overflow: hidden;
                  z-index: 1;
              }

              button::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: -100%;
                  width: 100%;
                  height: 100%;
                  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                  transition: left 0.6s ease;
                  z-index: -1;
              }

              button:hover::before {
                  left: 100%;
              }

              button:hover {
                  background: linear-gradient(45deg, #f97316, #3b82f6);
                  transform: translateY(-3px) scale(1.05);
                  box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
              }

              button:active {
                  transform: translateY(0) scale(0.98);
                  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
              }

              /* Back Button and Links Styling */
              .back-button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin-top: 15px;
                  background: rgba(15, 23, 42, 0.6);
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  border-radius: 10px;
                  color: #e2e8f0;
                  font-family: 'Orbitron', sans-serif;
                  font-size: 1em;
                  text-decoration: none;
                  transition: all 0.4s ease;
                  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                  text-transform: uppercase;
                  letter-spacing: 1px;
              }

              .back-button:hover {
                  background: rgba(59, 130, 246, 0.8);
                  transform: translateY(-2px);
                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
                  color: #ffffff;
              }

              .back-button:active {
                  transform: translateY(0);
                  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
              }

              .links {
                  margin-top: 15px;
                  display: flex;
                  justify-content: center;
                  gap: 20px;
              }

              .links a {
                  color: #3b82f6;
                  font-size: 0.9em;
                  text-decoration: none;
                  transition: color 0.4s ease;
              }

              .links a:hover {
                  color: #f97316;
              }

              /* Error Message Styling */
              .error-message {
                  color: #e74c3c;
                  font-size: 0.9em;
                  margin-top: 10px;
                  text-align: center;
                  animation: fadeIn 0.5s ease-in-out;
              }

              /* Footer with Enhanced Glassmorphism */
              footer {
                  background: rgba(15, 23, 42, 0.4);
                  backdrop-filter: blur(15px);
                  -webkit-backdrop-filter: blur(15px);
                  padding: 20px;
                  text-align: center;
                  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                  border-top: 1px solid rgba(255, 255, 255, 0.15);
                  width: 100%;
                  margin-top: auto;
              }

              footer .contact-section {
                  display: flex;
                  justify-content: center;
                  gap: 20px;
                  max-width: 900px;
                  margin: 0 auto;
                  padding: 10px 0;
              }

              footer p {
                  margin: 5px 0;
                  font-size: 1em;
                  color: #e2e8f0;
                  font-weight: 400;
              }

              footer a {
                  color: #3b82f6;
                  text-decoration: none;
                  transition: color 0.4s ease, transform 0.4s ease;
                  display: inline-flex;
                  align-items: center;
                  gap: 8px;
                  font-size: 1.1em;
                  font-weight: 500;
              }

              footer a:hover {
                  color: #f97316;
                  transform: translateX(5px);
              }

              footer i {
                  font-size: 1.5em;
                  transition: transform 0.4s ease;
              }

              footer a:hover i {
                  transform: scale(1.2) rotate(5deg);
              }

              /* Animations */
              @keyframes slideDown {
                  from { opacity: 0; transform: translateY(-60px); }
                  to { opacity: 1; transform: translateY(0); }
              }

              @keyframes fadeInUp {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
              }

              @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
              }

              /* Responsive Design */
              @media (max-width: 768px) {
                  header {
                      flex-direction: column;
                      padding: 15px;
                      margin-bottom: 20px;
                  }

                  header img {
                      width: 80px;
                  }

                  header h1 {
                      font-size: 2em;
                  }

                  .login-container {
                      padding: 30px;
                      max-width: 350px;
                  }

                  h2 {
                      font-size: 1.8em;
                  }

                  input[type="text"],
                  input[type="password"] {
                      padding: 12px;
                  }

                  button {
                      padding: 12px;
                      font-size: 1em;
                  }

                  .back-button {
                      padding: 8px 16px;
                      font-size: 0.9em;
                  }

                  .links a {
                      font-size: 0.85em;
                  }

                  footer .contact-section {
                      flex-direction: column;
                      gap: 10px;
                  }
              }

              @media (max-width: 480px) {
                  header img {
                      width: 60px;
                  }

                  header h1 {
                      font-size: 1.5em;
                  }

                  .login-container {
                      padding: 20px;
                      max-width: 300px;
                  }

                  h2 {
                      font-size: 1.5em;
                  }

                  input[type="text"],
                  input[type="password"] {
                      padding: 10px;
                  }

                  button {
                      padding: 10px;
                      font-size: 0.9em;
                  }

                  .back-button {
                      padding: 6px 12px;
                      font-size: 0.85em;
                  }

                  .links {
                      flex-direction: column;
                      gap: 5px;
                  }

                  .links a {
                      font-size: 0.8em;
                  }

                  footer p {
                      font-size: 0.9em;
                  }

                  footer a {
                      font-size: 1em;
                  }
              }
          </style>
      </head>
      <body>
          <header>
              <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
              <h1>A&A Kennels - Admin Login</h1>
          </header>
          <div class="login-container">
              <h2>Admin Login</h2>
              <form action="/login" method="POST">
                  <input type="text" name="username" placeholder="Username" required>
                  <input type="password" name="password" placeholder="Password" required>
                  <button type="submit">Enter</button>
              </form>
              ${req.query.error ? '<div class="error-message">Invalid credentials. <a href="/login">Try again</a></div>' : ""}
              <a href="javascript:history.back()" class="back-button">Back</a>
              <div class="links">
                  <a href="/forgot-password">Forgot Password?</a>
              </div>
          </div>
          <footer>
              <p>Contact Us:</p>
              <div class="contact-section">
                  <p>
                      <a href="https://wa.me/917338040633" target="_blank">
                          <i class="fab fa-whatsapp"></i> 7338040633
                      </a>
                  </p>
                  <p>
                      <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                          <i class="fab fa-facebook-f"></i> A&A Kennels
                      </a>
                  </p>
              </div>
          </footer>
      </body>
      </html>
  `);
});
// Login POST Route (Consolidated from duplicates)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).send("Internal Server Error");
      }
      if (!results.length || !(await bcrypt.compare(password, results[0].password))) {
        return res.redirect("/login?error=true");
      }
      req.session.user = { id: results[0].id, role: results[0].role };
      res.redirect("/admin-dashboard");
    });
  });
  
  // Forgot Password Route
  app.get("/forgot-password", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <title>Forgot Password - A&A Kennels</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                /* Reset and Base Styles */
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    scroll-behavior: smooth;
                }
  
                body {
                    background: linear-gradient(135deg, #0f172a, #1e2a38);
                    font-family: 'Montserrat', sans-serif;
                    color: #e2e8f0;
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    overflow-x: hidden;
                    position: relative;
                    z-index: 1;
                    padding-bottom: 60px;
                }
  
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                    z-index: -1;
                    animation: particleFlow 20s infinite linear;
                }
  
                @keyframes particleFlow {
                    0% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(15px, -15px) scale(1.1); }
                    100% { transform: translate(0, 0) scale(1); }
                }
  
                header {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                    border-radius: 20px;
                    margin-bottom: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    position: relative;
                    overflow: hidden;
                    animation: slideDown 1.2s ease-out;
                }
  
                header::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                    animation: rotateGlow 12s infinite linear;
                    z-index: -1;
                }
  
                @keyframes rotateGlow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
  
                header img {
                    width: 100px;
                    height: auto;
                    border-radius: 50%;
                    transition: transform 0.4s ease, box-shadow 0.4s ease;
                    box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                    animation: pulse 2.5s infinite ease-in-out;
                }
  
                header img:hover {
                    transform: scale(1.15) rotate(10deg);
                    box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
                }
  
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.08); }
                }
  
                header h1 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.5em;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 4px;
                    background: linear-gradient(45deg, #f97316, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                    transition: transform 0.4s ease, text-shadow 0.4s ease;
                }
  
                header h1:hover {
                    transform: translateY(-5px);
                    text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                }
  
                .forgot-password-container {
                    background: rgba(15, 23, 42, 0.3);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                    max-width: 450px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    animation: fadeInUp 1s ease-out;
                    transform-style: preserve-3d;
                    perspective: 1000px;
                    margin-bottom: 20px;
                }
  
                .forgot-password-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                    opacity: 0;
                    transition: opacity 0.5s ease;
                    z-index: -1;
                }
  
                .forgot-password-container:hover::before {
                    opacity: 1;
                }
  
                .forgot-password-container:hover {
                    transform: translateY(-10px) scale(1.02) rotateX(5deg);
                    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                }
  
                h2 {
                    font-family: 'Orbitron', sans-serif;
                    font-size: 2.2em;
                    color: #3b82f6;
                    margin-bottom: 30px;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                    animation: neonPulse 3s infinite alternate;
                }
  
                @keyframes neonPulse {
                    0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                    100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
                }
  
                input[type="email"],
                input[type="text"],
                input[type="password"] {
                    width: 100%;
                    padding: 12px 15px;
                    margin: 15px 0;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.05);
                    color: #e2e8f0;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 1em;
                    outline: none;
                    transition: all 0.4s ease;
                    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1);
                }
  
                input[type="email"]:focus,
                input[type="text"]:focus,
                input[type="password"]:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                    background: rgba(255, 255, 255, 0.1);
                }
  
                button {
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(45deg, #f97316, #3b82f6);
                    border: none;
                    border-radius: 10px;
                    color: #ffffff;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: all 0.4s ease;
                    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
  
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(249, 115, 22, 0.4);
                }
  
                button:active {
                    transform: translateY(0);
                    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                }
  
                .error-message,
                .message {
                    font-size: 1.1em;
                    margin: 15px 0;
                    padding: 10px;
                    border-radius: 8px;
                    transition: color 0.4s ease;
                }
  
                .error-message {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    border: 1px solid #ef4444;
                }
  
                .message {
                    background: rgba(46, 204, 113, 0.2);
                    color: #2ecc71;
                    border: 1px solid #2ecc71;
                }
  
                .back-button {
                    display: inline-block;
                    padding: 10px 20px;
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    color: #e2e8f0;
                    font-family: 'Orbitron', sans-serif;
                    font-size: 1em;
                    text-decoration: none;
                    transition: all 0.4s ease;
                    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
  
                .back-button:hover {
                    background: rgba(59, 130, 246, 0.8);
                    transform: translateY(-2px);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
                    color: #ffffff;
                }
  
                .back-button:active {
                    transform: translateY(0);
                    box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                }
  
                footer {
                    background: rgba(15, 23, 42, 0.4);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    padding: 20px;
                    text-align: center;
                    box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                    width: 100%;
                    margin-top: auto;
                }
  
                footer .contact-section {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 10px 0;
                }
  
                footer p {
                    margin: 5px 0;
                    font-size: 1em;
                    color: #e2e8f0;
                    font-weight: 400;
                }
  
                footer a {
                    color: #3b82f6;
                    text-decoration: none;
                    transition: color 0.4s ease, transform 0.4s ease;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1.1em;
                    font-weight: 500;
                }
  
                footer a:hover {
                    color: #f97316;
                    transform: translateX(5px);
                }
  
                footer i {
                    font-size: 1.5em;
                    transition: transform 0.4s ease;
                }
  
                footer a:hover i {
                    transform: scale(1.2) rotate(5deg);
                }
  
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-60px); }
                    to { opacity: 1; transform: translateY(0); }
                }
  
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
  
                @media (max-width: 768px) {
                    header {
                        flex-direction: column;
                        padding: 15px;
                        margin-bottom: 20px;
                    }
  
                    header img {
                        width: 80px;
                    }
  
                    header h1 {
                        font-size: 2em;
                    }
  
                    .forgot-password-container {
                        padding: 30px;
                        max-width: 350px;
                    }
  
                    h2 {
                        font-size: 1.8em;
                    }
  
                    .message,
                    .error-message {
                        font-size: 1em;
                    }
  
                    .back-button {
                        padding: 8px 16px;
                        font-size: 0.9em;
                    }
  
                    footer .contact-section {
                        flex-direction: column;
                        gap: 10px;
                    }
                }
  
                @media (max-width: 480px) {
                    header img {
                        width: 60px;
                    }
  
                    header h1 {
                        font-size: 1.5em;
                    }
  
                    .forgot-password-container {
                        padding: 20px;
                        max-width: 300px;
                    }
  
                    h2 {
                        font-size: 1.5em;
                    }
  
                    .message,
                    .error-message {
                        font-size: 0.9em;
                    }
  
                    .back-button {
                        padding: 6px 12px;
                        font-size: 0.85em;
                    }
  
                    footer p {
                        font-size: 0.9em;
                    }
  
                    footer a {
                        font-size: 1em;
                    }
                }
            </style>
        </head>
        <body>
            <header>
                <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                <h1>A&A Kennels - Forgot Password</h1>
            </header>
            <div class="forgot-password-container">
                <h2>Forgot Password</h2>
                <form action="/forgot-password" method="POST">
                    <input type="email" name="email" placeholder="Enter your email" required>
                    <button type="submit">Verify Email</button>
                </form>
                ${req.query.error ? '<div class="error-message">Access denied. Password reset is restricted to authorized personnel.</div>' : ""}
                <a href="/login" class="back-button">Back to Login</a>
            </div>
            <footer>
                <p>Contact Us:</p>
                <div class="contact-section">
                    <p>
                        <a href="https://wa.me/917338040633" target="_blank">
                            <i class="fab fa-whatsapp"></i> 7338040633
                        </a>
                    </p>
                    <p>
                        <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                            <i class="fab fa-facebook-f"></i> A&A Kennels
                        </a>
                    </p>
                </div>
            </footer>
        </body>
        </html>
    `);
  });
  
  // Change Password Route (Stub)
  app.get("/change-password", (req, res) => {
    res.send("<h1>Change Password Page (Under Development)</h1><p>Please enter your new password after verification.</p><a href='/login'>Back to Login</a>");
  });
  
  // Logout Route
  app.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/"));
  });
  
  // Admin Dashboard
  app.get("/admin-dashboard", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
  
  // Breeding Details Form
  app.get("/add-breeding-details", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "add-breeding-details.html"));
  });
  
  // New Enter Stud Details Form
  app.get("/enter-stud-details", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "enter-stud-details.html"));
  });
  
  // Add Stud with Cloudinary Upload
  app.post("/add-stud", isAdmin, upload.fields([{ name: "female_dog_image" }, { name: "breeding_image" }]), async (req, res) => {
    const {
      stud_name,
      owner_name,
      owner_contact,
      female_dog_color,
      female_breed,
      female_first_day_of_heat,
      breeding_dates,
      female_status,
      female_puppy_count,
    } = req.body;
  
    let femaleDogImageUrl = null;
    let breedingImageUrl = null;
  
    // Upload female_dog_image to Cloudinary
    if (req.files["female_dog_image"]) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "aanda-kennels/studs" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.files["female_dog_image"][0].buffer);
      });
      femaleDogImageUrl = result.secure_url;
    }
  
    // Upload breeding_image to Cloudinary
    if (req.files["breeding_image"]) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "aanda-kennels/studs" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.files["breeding_image"][0].buffer);
      });
      breedingImageUrl = result.secure_url;
    }
  
    const sql =
      "INSERT INTO studs (name, owner_name, owner_contact, female_dog_color, female_breed, female_first_day_of_heat, female_status, female_puppy_count, female_dog_image, breeding_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(
      sql,
      [
        stud_name,
        owner_name,
        owner_contact,
        female_dog_color,
        female_breed,
        female_first_day_of_heat,
        female_status,
        female_puppy_count || null,
        femaleDogImageUrl,
        breedingImageUrl,
      ],
      (err, result) => {
        if (err) {
          console.error("Insert error:", err);
          return res.status(500).send("Error inserting stud");
        }
        const studId = result.insertId;
  
        if (breeding_dates) {
          const datesArray = Array.isArray(breeding_dates) ? breeding_dates : [breeding_dates];
          const breedingSql = "INSERT INTO breeding_dates (stud_id, breeding_date) VALUES ?";
          const values = datesArray.map((date) => [studId, date]);
  
          db.query(breedingSql, [values], (err) => {
            if (err) {
              console.error("Breeding dates insert error:", err);
              return res.status(500).send("Error inserting breeding dates");
            }
            res.redirect("/studs");
          });
        } else {
          res.redirect("/studs");
        }
      }
    );
  });
  
  
  app.get("/studs", isAdmin, (req, res) => {
    const sql = `
        SELECT 
            s.id, 
            s.name, 
            s.owner_name, 
            s.owner_contact, 
            s.female_dog_color, 
            s.female_breed, 
            DATE_FORMAT(s.female_first_day_of_heat, '%Y-%m-%d') AS female_first_day_of_heat,
            DATE_FORMAT(DATE_ADD(s.female_first_day_of_heat, INTERVAL 6 MONTH), '%Y-%m-%d') AS next_heat_cycle,
            s.female_status, 
            s.female_puppy_count, 
            s.female_dog_image, 
            s.breeding_image,
            GROUP_CONCAT(DISTINCT DATE_FORMAT(b.breeding_date, '%Y-%m-%d') ORDER BY b.breeding_date ASC SEPARATOR ', ') AS breeding_dates,
            DATE_FORMAT(DATE_ADD(MAX(b.breeding_date), INTERVAL 63 DAY), '%Y-%m-%d') AS puppy_delivery_date
        FROM studs s
        LEFT JOIN breeding_dates b ON s.id = b.stud_id
        GROUP BY s.id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database query error:", err);
            return res.status(500).send("Internal Server Error");
        }

        let tableContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Stored Stud Details - A&A Kennels</title>
                <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap" rel="stylesheet">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css">
                <style>
                    /* Reset and Base Styles */
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        background: linear-gradient(135deg, #1e2a38, #2c3e50);
                        font-family: 'Exo 2', sans-serif;
                        color: #ecf0f1;
                        margin: 0;
                        padding: 0;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        overflow-x: hidden;
                        position: relative;
                    }

                    /* Header with Glassmorphism */
                    header {
                        background: rgba(44, 62, 80, 0.4);
                        backdrop-filter: blur(12px);
                        padding: 20px;
                        text-align: center;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        border-radius: 15px;
                        margin: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        position: relative;
                        width: calc(100% - 30px);
                    }

                    header img {
                        width: 80px;
                        height: auto;
                        border-radius: 50%;
                        transition: transform 0.3s ease;
                        box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
                    }

                    header img:hover {
                        transform: scale(1.1);
                    }

                    header h1 {
                        font-size: 1.8em;
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        background: linear-gradient(45deg, #e67e22, #3498db);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        text-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
                    }

                    h2 {
                        font-size: 2em;
                        color: #3498db;
                        text-align: center;
                        margin: 20px 15px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        text-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
                    }

                    /* Search and Filter Container */
                    .search-filter-container {
                        max-width: calc(100% - 30px);
                        margin: 15px auto;
                        display: flex;
                        flex-wrap: wrap;
                        gap: 15px;
                        justify-content: center;
                        padding: 15px;
                        background: rgba(44, 62, 80, 0.4);
                        backdrop-filter: blur(10px);
                        border-radius: 12px;
                        box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    .search-filter-container input[type="text"],
                    .search-filter-container select {
                        padding: 10px;
                        border: 1px solid #3498db;
                        border-radius: 8px;
                        background: rgba(52, 73, 94, 0.6);
                        color: #ecf0f1;
                        font-size: 0.9em;
                        outline: none;
                        width: 100%;
                        max-width: 250px;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }

                    .search-filter-container input[type="text"]::placeholder {
                        color: #bdc3c7;
                    }

                    .search-filter-container input[type="text"]:focus,
                    .search-filter-container select:focus {
                        border-color: #e67e22;
                        box-shadow: 0 0 8px rgba(230, 126, 34, 0.5);
                    }

                    /* Table Container */
                    .table-container {
                        margin: 20px 15px;
                        padding: 15px;
                        background: rgba(44, 62, 80, 0.4);
                        backdrop-filter: blur(12px);
                        border-radius: 15px;
                        box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.3);
                        overflow-x: auto;
                        width: calc(100% - 30px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    table {
                        width: 100%;
                        border-collapse: separate;
                        border-spacing: 0 10px;
                        min-width: 1200px;
                    }

                    th, td {
                        padding: 12px 10px;
                        text-align: left;
                        font-size: 0.9em;
                        color: #ecf0f1;
                        background: rgba(52, 73, 94, 0.6);
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        transition: background 0.3s ease;
                    }

                    th {
                        background: linear-gradient(90deg, #2c3e50, #34495e);
                        color: #e67e22;
                        font-weight: 700;
                        text-transform: uppercase;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                    }

                    tr:hover td {
                        background: rgba(52, 152, 219, 0.2);
                    }

                    .editable:hover {
                        background: rgba(52, 152, 219, 0.3);
                        cursor: pointer;
                    }

                    .editing {
                        background: rgba(52, 152, 219, 0.4);
                        border: 1px solid #e67e22;
                        border-radius: 4px;
                    }

                    select.status-dropdown {
                        background: rgba(52, 73, 94, 0.6);
                        color: #ecf0f1;
                        border: 1px solid #3498db;
                        padding: 6px;
                        border-radius: 4px;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    }

                    select.status-dropdown:focus {
                        border-color: #e67e22;
                        box-shadow: 0 0 8px rgba(230, 126, 34, 0.5);
                    }

                    img {
                        border-radius: 5px;
                        cursor: pointer;
                        width: 50px;
                        height: 50px;
                        object-fit: cover;
                        border: 1px solid #3498db;
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                        box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
                    }

                    img:hover {
                        transform: scale(1.1);
                        box-shadow: 0 0 10px rgba(52, 152, 219, 0.7);
                    }

                    /* Improved Image Modal */
                    .image-modal {
                        display: none;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(30, 42, 56, 0.95);
                        z-index: 1000;
                        justify-content: center;
                        align-items: center;
                        animation: fadeIn 0.3s ease-in-out;
                    }

                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }

                    .image-modal img {
                        max-width: 80vw;
                        max-height: 80vh;
                        width: auto;
                        height: auto;
                        border-radius: 10px;
                        box-shadow: 0 0 20px rgba(52, 152, 219, 0.7);
                        background: rgba(44, 62, 80, 0.4);
                        backdrop-filter: blur(10px);
                        padding: 10px;
                        transition: transform 0.3s ease;
                    }

                    .image-modal img:hover {
                        transform: scale(1.05);
                    }

                    .image-modal .close {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        color: #e67e22;
                        font-size: 2.5em;
                        cursor: pointer;
                        transition: transform 0.3s ease, color 0.3s ease;
                        background: rgba(44, 62, 80, 0.8);
                        padding: 10px;
                        border-radius: 50%;
                        box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3);
                    }

                    .image-modal .close:hover {
                        transform: rotate(90deg) scale(1.1);
                        color: #fff;
                    }

                    /* Improved Action Buttons */
                    .action-buttons {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .action-buttons button {
                        padding: 8px 14px;
                        border: none;
                        border-radius: 8px;
                        font-size: 0.8em;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.05);
                        position: relative;
                        overflow: hidden;
                    }

                    .action-buttons button::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: -100%;
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                        transition: left 0.5s ease;
                    }

                    .action-buttons button:hover::before {
                        left: 100%;
                    }

                    .action-buttons button:nth-child(1) {
                        background: #1e90ff;
                        color: #ffffff;
                    }

                    .action-buttons button:nth-child(1):hover {
                        background: #1565c0;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.4);
                    }

                    .action-buttons button:nth-child(2) {
                        background: #32cd32;
                        color: #ffffff;
                    }

                    .action-buttons button:nth-child(2):hover {
                        background: #228b22;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
                    }

                    .action-buttons button:nth-child(3) {
                        background: #ff4500;
                        color: #ffffff;
                    }

                    .action-buttons button:nth-child(3):hover {
                        background: #d32f2f;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(231, 76, 60, 0.4);
                    }

                    /* Footer */
                    footer {
                        background: rgba(44, 62, 80, 0.4);
                        backdrop-filter: blur(10px);
                        padding: 15px;
                        text-align: center;
                        margin-top: auto;
                        border-top: 1px solid rgba(255, 255, 255, 0.2);
                    }

                    footer p {
                        margin: 5px 0;
                        font-size: 1em;
                        color: #3498db;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        text-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
                    }

                    footer a {
                        color: #3498db;
                        text-decoration: none;
                        transition: color 0.3s ease, transform 0.3s ease;
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                    }

                    footer a:hover {
                        color: #e67e22;
                        transform: translateX(5px);
                    }

                    footer i {
                        font-size: 1.3em;
                        transition: transform 0.3s ease;
                    }

                    footer a:hover i {
                        transform: scale(1.2);
                    }

                    /* Back Links */
                    .back-links {
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 15px;
                        margin: 20px 15px;
                    }

                    .back-link {
                        padding: 10px 20px;
                        background: rgba(44, 62, 80, 0.6);
                        color: #ecf0f1;
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 0.9em;
                        transition: all 0.3s ease;
                        box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3);
                    }

                    .back-link:hover {
                        background: rgba(52, 152, 219, 0.3);
                        transform: translateY(-3px);
                        box-shadow: 0 0 15px rgba(52, 152, 219, 0.5);
                    }

                    /* Mobile Responsive Styles */
                    @media (max-width: 768px) {
                        body {
                            overflow-x: hidden;
                        }

                        header {
                            flex-direction: column;
                            margin: 10px;
                            width: calc(100% - 20px);
                        }

                        header img {
                            width: 60px;
                        }

                        header h1 {
                            font-size: 1.5em;
                        }

                        .search-filter-container {
                            flex-direction: column;
                            margin: 10px;
                            width: calc(100% - 20px);
                        }

                        .table-container {
                            margin: 10px;
                            padding: 10px;
                            width: calc(100% - 20px);
                            overflow-x: auto;
                            -webkit-overflow-scrolling: touch;
                        }

                        table {
                            min-width: 1000px;
                        }

                        th, td {
                            padding: 8px 6px;
                            font-size: 0.8em;
                        }

                        .action-buttons {
                            gap: 5px;
                        }

                        .action-buttons button {
                            padding: 5px 8px;
                            font-size: 0.7em;
                        }

                        img {
                            width: 40px;
                            height: 40px;
                        }

                        .image-modal img {
                            max-width: 90vw;
                            max-height: 70vh;
                        }

                        .image-modal .close {
                            top: 15px;
                            right: 15px;
                            font-size: 2em;
                            padding: 8px;
                        }
                    }

                    @media (max-width: 480px) {
                        header img {
                            width: 50px;
                        }

                        header h1 {
                            font-size: 1.2em;
                        }

                        h2 {
                            font-size: 1.5em;
                            margin: 15px 10px;
                        }

                        .search-filter-container {
                            padding: 10px;
                        }

                        .table-container {
                            padding: 8px;
                        }

                        th, td {
                            padding: 6px 4px;
                            font-size: 0.7em;
                        }

                        .action-buttons button {
                            padding: 4px 6px;
                            font-size: 0.65em;
                        }

                        .back-link {
                            padding: 8px 15px;
                            font-size: 0.8em;
                        }

                        img {
                            width: 30px;
                            height: 30px;
                        }
                    }
                </style>
            </head>
            <body>
                <header>
                    <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                    <h1>A&A Kennels - Stored Stud Details</h1>
                </header>
                <h2>Stored Stud Details</h2>
                <div class="search-filter-container">
                    <input type="text" id="search-input" placeholder="Search by Stud Name">
                    <select id="filter-status">
                        <option value="All">All Statuses</option>
                        <option value="Waiting">Waiting</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Failure">Failure</option>
                    </select>
                </div>
                <div class="table-container">
                    <table>
                        <tr>
                            <th>Stud Name</th>
                            <th>Owner Name</th>
                            <th>Contact</th>
                            <th>Female Dog Color</th>
                            <th>Female Breed</th>
                            <th>First Day of Heat</th>
                            <th>Breeding Dates</th>
                            <th>Female Status</th>
                            <th>Puppy Count</th>
                            <th>Next Heat Cycle</th>
                            <th>Female Image</th>
                            <th>Puppy Delivery Date</th>
                            <th>Breeding Image</th>
                            <th>Actions</th>
                        </tr>`;

        results.forEach((row) => {
            tableContent += `
                        <tr id="row-${row.id}">
                            <td class="editable">${row.name || ""}</td>
                            <td class="editable">${row.owner_name || ""}</td>
                            <td class="editable">${row.owner_contact || ""}</td>
                            <td class="editable">${row.female_dog_color || ""}</td>
                            <td class="editable">${row.female_breed || ""}</td>
                            <td class="editable" data-type="date">${row.female_first_day_of_heat || ""}</td>
                            <td class="editable">${row.breeding_dates || "No breeding dates yet"}</td>
                            <td class="editable">${row.female_status || "Waiting"}</td>
                            <td class="editable">${row.female_status === "Delivered" ? (row.female_puppy_count || "0") : "N/A"}</td>
                            <td>${row.next_heat_cycle || "N/A"}</td>
                            <td>${row.female_dog_image ? `<img src="${row.female_dog_image}" onclick="showImage('${row.female_dog_image}')">` : "No Image"}</td>
                            <td>${row.puppy_delivery_date || "N/A"}</td>
                            <td>${row.breeding_image ? `<img src="${row.breeding_image}" onclick="showImage('${row.breeding_image}')">` : "No Image"}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="edit-btn" data-id="${row.id}">Edit</button>
                                    <button class="save-btn" data-id="${row.id}">Save</button>
                                    <button class="delete-btn" data-id="${row.id}">Delete</button>
                                </div>
                            </td>
                        </tr>`;
        });

        tableContent += `
                    </table>
                </div>
                <div class="back-links">
                    <a href="/admin-dashboard" class="back-link">Admin Dashboard</a>
                    <a href="/" class="back-link">View Male Studs</a>
                    <a href="/logout" class="back-link">Logout</a>
                </div>
                <footer>
                    <p>Contact Us:</p>
                    <p>
                        <a href="https://wa.me/917338040633" target="_blank">
                            <i class="fab fa-whatsapp"></i> 7338040633
                        </a>
                    </p>
                    <p>
                        <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                            <i class="fab fa-facebook-f"></i> A&A Kennels
                        </a>
                    </p>
                </footer>
                <script>
                    document.addEventListener('DOMContentLoaded', () => {
                        const searchInput = document.getElementById('search-input');
                        const filterSelect = document.getElementById('filter-status');
                        const tableRows = document.querySelectorAll('table tr:not(:first-child)');

                        function filterTable() {
                            const searchText = searchInput.value.toLowerCase();
                            const filterValue = filterSelect.value;

                            tableRows.forEach(row => {
                                const studName = row.cells[0].textContent.toLowerCase();
                                const femaleStatus = row.cells[7].textContent;

                                const matchesSearch = studName.includes(searchText);
                                const matchesFilter = filterValue === 'All' || femaleStatus === filterValue;

                                row.style.display = matchesSearch && matchesFilter ? '' : 'none';
                            });
                        }

                        searchInput.addEventListener('input', filterTable);
                        filterSelect.addEventListener('change', filterTable);

                        window.showImage = function(src) {
                            const modal = document.createElement('div');
                            modal.classList.add('image-modal');
                            modal.innerHTML = \`
                                <span class="close">×</span>
                                <img src="\${src}" alt="Enlarged Image">
                            \`;
                            document.body.appendChild(modal);
                            modal.style.display = 'flex';
                            modal.querySelector('.close').onclick = () => modal.remove();
                            modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
                        };

                        window.deleteStud = function(id, row) {
                            if (confirm("Are you sure you want to delete this stud entry?")) {
                                fetch('/delete/' + id, { method: 'DELETE' })
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.success) {
                                            row.remove();
                                        } else {
                                            alert("Failed to delete entry: " + (data.error || "Unknown error"));
                                        }
                                    })
                                    .catch(error => {
                                        alert('Error deleting stud: ' + error.message);
                                    });
                            }
                        };

                        window.makeEditable = function(cells) {
                            const statusCell = cells[7];
                            const puppyCountCell = cells[8];

                            cells.forEach(cell => {
                                if (cell !== statusCell && cell !== puppyCountCell && !cell.isContentEditable) {
                                    cell.contentEditable = true;
                                    cell.classList.add('editing');
                                    if (cell.dataset.type === 'date' && cell.textContent.trim() !== '' && cell.textContent !== 'N/A') {
                                        flatpickr(cell, { 
                                            dateFormat: "Y-m-d", 
                                            allowInput: true,
                                            onReady: function(selectedDates, dateStr, instance) {
                                                if (instance && instance.calendarContainer) {
                                                    instance.calendarContainer.style.setProperty('font-size', '0.9em');
                                                }
                                            }
                                        });
                                    }
                                }
                            });

                            if (!statusCell.querySelector('select')) {
                                const currentStatus = statusCell.textContent.trim();
                                const select = document.createElement('select');
                                select.className = 'status-dropdown';
                                select.innerHTML = \`
                                    <option value="Waiting" \${currentStatus === 'Waiting' ? 'selected' : ''}>Waiting</option>
                                    <option value="Delivered" \${currentStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="Failure" \${currentStatus === 'Failure' ? 'selected' : ''}>Failure</option>
                                \`;
                                statusCell.innerHTML = '';
                                statusCell.appendChild(select);

                                select.onchange = () => {
                                    if (select.value === 'Delivered') {
                                        puppyCountCell.contentEditable = true;
                                        puppyCountCell.classList.add('editing');
                                        if (puppyCountCell.textContent === 'N/A') puppyCountCell.textContent = '0';
                                    } else {
                                        puppyCountCell.contentEditable = false;
                                        puppyCountCell.classList.remove('editing');
                                        puppyCountCell.textContent = 'N/A';
                                    }
                                };
                            }
                        };

                        window.saveEdit = function(id, row) {
                            const cells = row.querySelectorAll('td.editable');
                            const statusCell = cells[7];
                            const puppyCountCell = cells[8];

                            if (!statusCell || !puppyCountCell) {
                                alert('Error: Could not save due to missing data');
                                return;
                            }

                            const statusSelect = statusCell.querySelector('select');
                            const statusValue = statusSelect ? statusSelect.value : statusCell.textContent.trim();

                            const data = {
                                id: id,
                                name: cells[0]?.textContent || '',
                                owner_name: cells[1]?.textContent || '',
                                owner_contact: cells[2]?.textContent || '',
                                female_dog_color: cells[3]?.textContent || '',
                                female_breed: cells[4]?.textContent || '',
                                female_first_day_of_heat: cells[5]?.textContent || '',
                                breeding_dates: cells[6]?.textContent === 'No breeding dates yet' ? [] : (cells[6]?.textContent.split(', ') || []),
                                female_status: statusValue,
                                female_puppy_count: statusValue === 'Delivered' ? 
                                    (puppyCountCell.textContent === 'N/A' ? null : puppyCountCell.textContent) : null
                            };

                            fetch('/update/' + id, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data)
                            })
                            .then(response => response.json())
                            .then(result => {
                                if (result.success) {
                                    cells.forEach(cell => {
                                        if (cell !== statusCell && cell !== puppyCountCell) {
                                            cell.contentEditable = false;
                                            cell.classList.remove('editing');
                                        }
                                    });
                                    if (statusSelect) statusCell.innerHTML = statusValue;
                                    if (statusValue !== 'Delivered') {
                                        puppyCountCell.textContent = 'N/A';
                                        puppyCountCell.contentEditable = false;
                                        puppyCountCell.classList.remove('editing');
                                    }
                                } else {
                                    alert('Failed to update entry: ' + (result.error || 'Unknown error'));
                                    location.reload();
                                }
                            })
                            .catch(error => {
                                alert('Error saving changes: ' + error.message);
                                location.reload();
                            });
                        };

                        document.querySelectorAll('.edit-btn').forEach(button => {
                            button.addEventListener('click', () => {
                                const id = button.getAttribute('data-id');
                                const row = document.getElementById('row-' + id);
                                makeEditable(row.querySelectorAll('.editable'));
                            });
                        });

                        document.querySelectorAll('.save-btn').forEach(button => {
                            button.addEventListener('click', () => {
                                const id = button.getAttribute('data-id');
                                const row = document.getElementById('row-' + id);
                                saveEdit(id, row);
                            });
                        });

                        document.querySelectorAll('.delete-btn').forEach(button => {
                            button.addEventListener('click', () => {
                                const id = button.getAttribute('data-id');
                                const row = document.getElementById('row-' + id);
                                deleteStud(id, row);
                            });
                        });
                    });
                </script>
            </body>
            </html>`;

        res.send(tableContent);
    });
});
  // Update Stud Details
  app.put("/update/:id", isAdmin, (req, res) => {
    const studId = req.params.id;
    const {
      name,
      owner_name,
      owner_contact,
      female_dog_color,
      female_breed,
      female_first_day_of_heat,
      breeding_dates,
      female_status,
      female_puppy_count,
    } = req.body;
  
    const puppyCount = female_puppy_count === "N/A" || female_puppy_count === null ? null : parseInt(female_puppy_count, 10);
  
    const updateStudSql = `
          UPDATE studs 
          SET name = ?, owner_name = ?, owner_contact = ?, female_dog_color = ?, 
              female_breed = ?, female_first_day_of_heat = ?, female_status = ?, 
              female_puppy_count = ?
          WHERE id = ?`;
  
    db.query(
      updateStudSql,
      [name, owner_name, owner_contact, female_dog_color, female_breed, female_first_day_of_heat, female_status, puppyCount, studId],
      (err) => {
        if (err) {
          console.error("Update stud error:", err);
          return res.status(500).json({ success: false, error: err.message });
        }
  
        const deleteDatesSql = "DELETE FROM breeding_dates WHERE stud_id = ?";
        db.query(deleteDatesSql, [studId], (err) => {
          if (err) {
            console.error("Delete breeding dates error:", err);
            return res.status(500).json({ success: false, error: err.message });
          }
  
          if (breeding_dates && breeding_dates.length > 0 && breeding_dates[0] !== "No breeding dates yet") {
            const insertDatesSql = "INSERT INTO breeding_dates (stud_id, breeding_date) VALUES ?";
            const values = breeding_dates.map((date) => [studId, date]);
            db.query(insertDatesSql, [values], (err) => {
              if (err) {
                console.error("Insert breeding dates error:", err);
                return res.status(500).json({ success: false, error: err.message });
              }
              res.json({ success: true });
            });
          } else {
            res.json({ success: true });
          }
        });
      }
    );
  });
  
  // Delete Stud Entry
  app.delete("/delete/:id", isAdmin, (req, res) => {
    const studId = req.params.id;
  
    const deleteBreedingDates = "DELETE FROM breeding_dates WHERE stud_id = ?";
    db.query(deleteBreedingDates, [studId], (err) => {
      if (err) {
        console.error("Delete breeding dates error:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      const deleteStud = "DELETE FROM studs WHERE id = ?";
      db.query(deleteStud, [studId], (err) => {
        if (err) {
          console.error("Delete stud error:", err);
          return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true });
      });
    });
  });

// Update Male Stud (Admin Only)
// Update Male Stud Form
app.get("/update-male-stud/:id", isAdmin, (req, res) => {
    const studId = req.params.id;
    db.query("SELECT * FROM male_studs WHERE id = ?", [studId], (err, result) => {
      if (err || !result.length) {
        console.error("Error fetching stud details:", err);
        return res.status(500).send("Error fetching stud details");
      }
      const stud = result[0];
      res.send(`
              <html>
              <head>
                  <title>Update Male Stud - A&A Kennels</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap" rel="stylesheet">
                  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                  <link rel="stylesheet" href="/style.css">
                  <style>
                      body { background: linear-gradient(135deg, #1e2a38, #2c3e50); font-family: 'Exo 2', sans-serif; color: #ecf0f1; margin: 0; padding: 0; min-height: 100vh; display: flex; flex-direction: column; }
                      header { background: rgba(44, 62, 80, 0.95); padding: 20px; text-align: center; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; gap: 15px; }
                      header img { width: 80px; height: auto; }
                      header h1 { font-size: 2em; color: #e67e22; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
                      h2 { text-align: center; color: #3498db; }
                      form { max-width: 500px; margin: 20px auto; padding: 20px; background: rgba(44, 62, 80, 0.95); border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2); }
                      label { display: block; margin-bottom: 5px; color: #e67e22; }
                      input[type="text"], input[type="number"], input[type="file"] { width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #3498db; border-radius: 4px; background: #34495e; color: #ecf0f1; }
                      button { width: 100%; padding: 10px; background: linear-gradient(45deg, #3498db, #e67e22); border: none; border-radius: 4px; color: #fff; cursor: pointer; }
                      button:hover { background: linear-gradient(45deg, #e67e22, #3498db); }
                      .back-link { display: block; text-align: center; margin: 10px 0; color: #3498db; text-decoration: none; }
                      .back-link:hover { color: #e67e22; }
                      footer { background: rgba(44, 62, 80, 0.95); padding: 20px; text-align: center; margin-top: auto; box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3); }
                      footer p { margin: 5px 0; font-size: 1em; color: #ecf0f1; }
                      footer a { color: #3498db; text-decoration: none; transition: color 0.3s ease; display: inline-flex; align-items: center; gap: 5px; }
                      footer a:hover { color: #e67e22; }
                      footer i { font-size: 1.2em; }
                      @media (max-width: 768px) { header { flex-direction: column; } }
                  </style>
              </head>
              <body>
                  <header>
                      <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                      <h1>A&A Kennels</h1>
                  </header>
                  <h2>Update Male Stud</h2>
                  <form action="/update-male-stud/${stud.id}" method="POST" enctype="multipart/form-data">
                      <label>Name:</label>
                      <input type="text" name="name" value="${stud.name || ''}" required>
                      
                      <label>Lineage:</label>
                      <input type="text" name="lineage" value="${stud.lineage || ''}">
                      
                      <label>Color:</label>
                      <input type="text" name="color" value="${stud.color || ''}">
                      
                      <label>Temperament:</label>
                      <input type="text" name="temperament" value="${stud.temperament || ''}">
                      
                      <label>Age:</label>
                      <input type="number" name="age" value="${stud.age || ''}" min="0">
                      
                      <label>Location:</label>
                      <input type="text" name="location" value="${stud.location || ''}">
                      
                      <label>Image (Leave blank to keep current):</label>
                      <input type="file" name="image" accept="image/*">
                      ${stud.image ? `<p>Current Image: <img src="${stud.image}" style="width: 100px;"></p>` : ''}
                      
                      <button type="submit">Update</button>
                  </form>
                  <a href="/" class="back-link">Back to Male Studs</a>
                  <footer>
                      <p>Contact Us:</p>
                      <p>Phone: <a href="https://wa.me/917338040633" target="_blank"><i class="fab fa-whatsapp"></i> 7338040633</a></p>
                      <p>Facebook: <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank"><i class="fab fa-facebook-f"></i> A&A Kennels</a></p>
                  </footer>
              </body>
              </html>
          `);
    });
  });
  
  // Update Male Stud Submission
  app.post("/update-male-stud/:id", isAdmin, upload.single("image"), async (req, res) => {
    const studId = req.params.id;
    const { name, lineage, color, temperament, age, location } = req.body;
    let imageUrl = null;
  
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "aanda-kennels/male-studs" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
  
    let sql;
    let values;
    if (imageUrl) {
      sql = "UPDATE male_studs SET name = ?, lineage = ?, color = ?, temperament = ?, age = ?, location = ?, image = ? WHERE id = ?";
      values = [name, lineage, color, temperament, age, location, imageUrl, studId];
    } else {
      sql = "UPDATE male_studs SET name = ?, lineage = ?, color = ?, temperament = ?, age = ?, location = ? WHERE id = ?";
      values = [name, lineage, color, temperament, age, location, studId];
    }
  
    db.query(sql, values, (err) => {
      if (err) {
        console.error("Update male stud error:", err);
        return res.status(500).send("Error updating male stud");
      }
      res.redirect("/");
    });
  });
  
  // Delete Male Stud (Admin Only)
  app.delete("/delete-male-stud/:id", isAdmin, (req, res) => {
    const studId = req.params.id;
    db.query("DELETE FROM male_studs WHERE id = ?", [studId], (err) => {
      if (err) {
        console.error("Delete male stud error:", err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json({ success: true });
    });
  });
  
  // Add Male Stud Form
  app.get("/add-male-stud", isAdmin, (req, res) => {
    res.send(`
          <html>
          <head>
              <title>Add Male Stud - A&A Kennels</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&display=swap" rel="stylesheet">
              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
              <link rel="stylesheet" href="/style.css">
              <style>
                  /* Reset and Base Styles */
                  * {
                      box-sizing: border-box;
                      margin: 0;
                      padding: 0;
                  }
  
                  body {
                      background: linear-gradient(135deg, #1e2a38, #2c3e50);
                      font-family: 'Exo 2', sans-serif;
                      color: #ecf0f1;
                      margin: 0;
                      padding: 0;
                      min-height: 100vh;
                      display: flex;
                      flex-direction: column;
                      overflow-x: hidden;
                      position: relative;
                  }
  
                  /* Background Particle Effect */
                  body::before {
                      content: '';
                      position: fixed;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="10" cy="10" r="1" fill="rgba(52, 152, 219, 0.3)" opacity="0.5"><animate attributeName="cx" from="10" to="100%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="10" to="100%" dur="15s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="1" fill="rgba(230, 126, 34, 0.3)" opacity="0.5"><animate attributeName="cx" from="50%" to="0" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="100%" dur="8s" repeatCount="indefinite" /></circle></svg>');
                      z-index: -1;
                      pointer-events: none;
                      animation: subtleMove 20s infinite linear;
                  }
  
                  @keyframes subtleMove {
                      0% { transform: translate(0, 0); }
                      50% { transform: translate(20px, -20px); }
                      100% { transform: translate(0, 0); }
                  }
  
                  /* Header with Glassmorphism */
                  header {
                      background: rgba(44, 62, 80, 0.3);
                      backdrop-filter: blur(10px);
                      -webkit-backdrop-filter: blur(10px);
                      padding: 20px;
                      text-align: center;
                      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      gap: 20px;
                      border-radius: 15px;
                      margin: 20px auto;
                      max-width: 1200px;
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      animation: slideDown 1s ease-out;
                      position: relative;
                      overflow: hidden;
                  }
  
                  header::before {
                      content: '';
                      position: absolute;
                      top: -50%;
                      left: -50%;
                      width: 200%;
                      height: 200%;
                      background: radial-gradient(circle, rgba(52, 152, 219, 0.2) 0%, transparent 70%);
                      animation: rotateGlow 10s infinite linear;
                  }
  
                  @keyframes rotateGlow {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                  }
  
                  header img {
                      width: 100px;
                      height: auto;
                      border-radius: 50%;
                      transition: transform 0.3s ease;
                      box-shadow: 0 0 15px rgba(230, 126, 34, 0.7), 0 0 25px rgba(52, 152, 219, 0.5);
                      animation: pulse 2s infinite ease-in-out;
                  }
  
                  header img:hover {
                      transform: scale(1.1) rotate(5deg);
                  }
  
                  @keyframes pulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.05); }
                  }
  
                  header h1 {
                      font-size: 3em;
                      margin: 0;
                      text-transform: uppercase;
                      letter-spacing: 3px;
                      background: linear-gradient(45deg, #e67e22, #3498db);
                      -webkit-background-clip: text;
                      -webkit-text-fill-color: transparent;
                      text-shadow: 0 0 15px rgba(230, 126, 34, 0.8), 0 0 25px rgba(52, 152, 219, 0.5);
                      transition: transform 0.3s ease, text-shadow 0.3s ease;
                  }
  
                  header h1:hover {
                      transform: translateY(-5px);
                      text-shadow: 0 0 20px rgba(230, 126, 34, 1), 0 0 30px rgba(52, 152, 219, 0.8);
                  }
  
                  /* Heading Styles */
                  h2 {
                      text-align: center;
                      font-size: 2.5em;
                      color: #3498db;
                      margin: 25px 0;
                      text-transform: uppercase;
                      letter-spacing: 2px;
                      text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
                      position: relative;
                      animation: glowText 3s infinite ease-in-out;
                  }
  
                  h2::after {
                      content: '';
                      position: absolute;
                      bottom: -10px;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 50px;
                      height: 3px;
                      background: linear-gradient(90deg, #3498db, #e67e22);
                      border-radius: 2px;
                      box-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
                  }
  
                  @keyframes glowText {
                      0%, 100% { text-shadow: 0 0 10px rgba(52, 152, 219, 0.5); }
                      50% { text-shadow: 0 0 20px rgba(230, 126, 34, 0.8); }
                  }
  
                  h2:hover {
                      color: #e67e22;
                      text-shadow: 0 0 15px rgba(230, 126, 34, 1);
                  }
  
                  /* Form Container with Neumorphism */
                  form {
                      max-width: 600px;
                      margin: 40px auto;
                      background: rgba(44, 62, 80, 0.3);
                      backdrop-filter: blur(12px);
                      -webkit-backdrop-filter: blur(12px);
                      padding: 30px;
                      border-radius: 15px;
                      box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.4), -5px -5px 15px rgba(255, 255, 255, 0.05);
                      border: 1px solid rgba(255, 255, 255, 0.1);
                      transition: transform 0.3s ease, box-shadow 0.3s ease;
                      animation: fadeIn 1s ease-out;
                      position: relative;
                      overflow: hidden;
                  }
  
                  form::before {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background: radial-gradient(circle, rgba(52, 152, 219, 0.1) 0%, transparent 70%);
                      opacity: 0.3;
                      z-index: -1;
                      animation: pulseGlow 5s infinite ease-in-out;
                  }
  
                  @keyframes pulseGlow {
                      0%, 100% { opacity: 0.3; }
                      50% { opacity: 0.6; }
                  }
  
                  form:hover {
                      transform: translateY(-5px);
                      box-shadow: 5px 5px 20px rgba(52, 152, 219, 0.5), -5px -5px 20px rgba(230, 126, 34, 0.2);
                  }
  
                  /* Label Styles with Hover Animation */
                  label {
                      display: block;
                      font-size: 1em;
                      color: #e67e22;
                      margin-bottom: 5px;
                      font-weight: 500;
                      position: relative;
                      transition: color 0.3s ease, transform 0.3s ease;
                  }
  
                  label::before {
                      content: '✧';
                      position: absolute;
                      left: -20px;
                      opacity: 0;
                      color: #3498db;
                      transition: opacity 0.3s ease, transform 0.3s ease;
                  }
  
                  label:hover::before {
                      opacity: 1;
                      transform: translateX(5px);
                  }
  
                  label:hover {
                      color: #3498db;
                      transform: translateX(10px);
                  }
  
                  /* Input Fields with 3D Effect */
                  input[type="text"],
                  input[type="number"],
                  input[type="file"] {
                      width: calc(100% - 20px);
                      padding: 12px;
                      margin: 0 10px 15px 10px;
                      background: rgba(52, 73, 94, 0.5);
                      border: 1px solid rgba(52, 152, 219, 0.3);
                      border-radius: 8px;
                      color: #ecf0f1;
                      font-family: 'Exo 2', sans-serif;
                      font-size: 0.95em;
                      box-sizing: border-box;
                      box-shadow: inset 3px 3px 6px rgba(0, 0, 0, 0.2), inset -3px -3px 6px rgba(255, 255, 255, 0.05);
                      transition: all 0.3s ease;
                      position: relative;
                      z-index: 1;
                  }
  
                  input[type="text"]::placeholder,
                  input[type="number"]::placeholder {
                      color: #bdc3c7;
                      opacity: 0.7;
                  }
  
                  input[type="text"]:hover,
                  input[type="number"]:hover,
                  input[type="file"]:hover {
                      border-color: #e67e22;
                      box-shadow: 0 0 10px rgba(230, 126, 34, 0.5);
                      transform: translateY(-2px);
                      background: rgba(62, 92, 118, 0.7);
                  }
  
                  input[type="text"]:focus,
                  input[type="number"]:focus,
                  input[type="file"]:focus {
                      outline: none;
                      border-color: #e67e22;
                      box-shadow: 0 0 12px rgba(230, 126, 34, 0.7);
                      background: rgba(62, 92, 118, 0.9);
                      transform: translateY(-2px);
                  }
  
                  input[type="file"] {
                      padding: 5px 10px;
                  }
  
                  /* File Input Custom Styling */
                  input[type="file"] + p {
                      margin: -10px 10px 15px 10px;
                      color: #bdc3c7;
                      font-size: 0.85em;
                      transition: color 0.3s ease;
                  }
  
                  input[type="file"]:hover + p {
                      color: #e67e22;
                  }
  
                  /* Button Styles with 3D Hover and Glow */
                  button {
                      padding: 12px 24px;
                      border: none;
                      border-radius: 8px;
                      background: linear-gradient(45deg, #3498db, #e67e22);
                      color: #ffffff;
                      font-size: 0.95em;
                      font-weight: 600;
                      text-transform: uppercase;
                      cursor: pointer;
                      box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.05);
                      transition: all 0.3s ease;
                      position: relative;
                      overflow: hidden;
                      z-index: 1;
                      width: 100%;
                  }
  
                  button::before {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: -100%;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                      transition: left 0.5s ease;
                  }
  
                  button:hover::before {
                      left: 100%;
                  }
  
                  button:hover {
                      background: linear-gradient(45deg, #e67e22, #3498db);
                      box-shadow: 0 0 15px rgba(230, 126, 34, 0.7);
                      transform: translateY(-3px) scale(1.05);
                  }
  
                  button:active {
                      transform: translateY(0) scale(0.98);
                      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
                  }
  
                  /* Back Links with Card-Like Hover Effects */
                  .back-links {
                      display: flex;
                      justify-content: center;
                      gap: 15px;
                      margin: 20px 0;
                      flex-wrap: wrap;
                  }
  
                  .back-link {
                      display: inline-block;
                      text-align: center;
                      padding: 12px 25px;
                      background: linear-gradient(45deg, #3498db, #e67e22);
                      color: #ffffff;
                      text-decoration: none;
                      border-radius: 8px;
                      box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3), -3px -3px 8px rgba(255, 255, 255, 0.05);
                      transition: all 0.3s ease;
                      font-size: 1em;
                      font-weight: 600;
                      position: relative;
                      overflow: hidden;
                      z-index: 1;
                  }
  
                  .back-link::before {
                      content: '';
                      position: absolute;
                      top: 0;
                      left: -100%;
                      width: 100%;
                      height: 100%;
                      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                      transition: left 0.5s ease;
                  }
  
                  .back-link:hover::before {
                      left: 100%;
                  }
  
                  .back-link:hover {
                      background: linear-gradient(45deg, #e67e22, #3498db);
                      box-shadow: 0 0 15px rgba(230, 126, 34, 0.7);
                      transform: translateY(-3px) rotate(2deg);
                  }
  
                  /* Footer with Glassmorphism */
                  footer {
                      background: rgba(44, 62, 80, 0.3);
                      backdrop-filter: blur(10px);
                      -webkit-backdrop-filter: blur(10px);
                      padding: 20px;
                      text-align: center;
                      margin-top: auto;
                      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.3);
                      border-top: 1px solid rgba(255, 255, 255, 0.1);
                  }
  
                  footer p {
                      margin: 5px 0;
                      font-size: 1em;
                      color: #ecf0f1;
                  }
  
                  footer .contact-section {
                      display: grid;
                      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                      gap: 15px;
                      max-width: 800px;
                      margin: 0 auto;
                      padding: 10px 0;
                  }
  
                  footer a {
                      color: #3498db;
                      text-decoration: none;
                      transition: color 0.3s ease, transform 0.3s ease;
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                      font-size: 1.1em;
                      background: none;
                      box-shadow: none;
                  }
  
                  footer a:hover {
                      color: #e67e22;
                      transform: translateX(5px);
                      box-shadow: none;
                  }
  
                  footer i {
                      font-size: 1.5em;
                      transition: transform 0.3s ease;
                  }
  
                  footer a:hover i {
                      transform: scale(1.2);
                  }
  
                  /* Animations */
                  @keyframes slideDown {
                      from {
                          opacity: 0;
                          transform: translateY(-50px);
                      }
                      to {
                          opacity: 1;
                          transform: translateY(0);
                      }
                  }
  
                  @keyframes fadeIn {
                      from {
                          opacity: 0;
                          transform: translateY(20px);
                      }
                      to {
                          opacity: 1;
                          transform: translateY(0);
                      }
                  }
  
                  /* Responsive Design */
                  @media (max-width: 768px) {
                      header {
                          flex-direction: column;
                          margin: 10px;
                          padding: 15px;
                      }
  
                      header img {
                          width: 80px;
                      }
  
                      header h1 {
                          font-size: 2em;
                      }
  
                      h2 {
                          font-size: 1.8em;
                          margin: 20px 0;
                      }
  
                      form {
                          margin: 30px auto;
                          padding: 20px;
                      }
  
                      input[type="text"],
                      input[type="number"],
                      input[type="file"] {
                          padding: 8px;
                          font-size: 0.85em;
                          margin: 0 8px 10px 8px;
                      }
  
                      button {
                          padding: 8px 16px;
                          font-size: 0.8em;
                      }
  
                      .back-link {
                          padding: 8px 20px;
                          font-size: 0.9em;
                      }
  
                      footer .contact-section {
                          grid-template-columns: 1fr;
                      }
                  }
  
                  @media (max-width: 480px) {
                      header img {
                          width: 60px;
                      }
  
                      header h1 {
                          font-size: 1.5em;
                      }
  
                      h2 {
                          font-size: 1.4em;
                          margin: 15px 0;
                      }
  
                      form {
                          margin: 20px auto;
                          padding: 15px;
                      }
  
                      input[type="text"],
                      input[type="number"],
                      input[type="file"] {
                          padding: 6px;
                          font-size: 0.75em;
                          margin: 0 6px 8px 6px;
                      }
  
                      button {
                          padding: 6px 12px;
                          font-size: 0.7em;
                      }
  
                      .back-link {
                          padding: 6px 15px;
                          font-size: 0.8em;
                      }
                  }
              </style>
          </head>
          <body>
              <header>
                  <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                  <h1>A&A Kennels - Add Male Stud</h1>
              </header>
              <h2>Add Male Stud</h2>
              <form action="/add-male-stud" method="POST" enctype="multipart/form-data">
                  <label for="name">Name:</label>
                  <input type="text" name="name" id="name" required>
                  
                  <label for="lineage">Lineage:</label>
                  <input type="text" name="lineage" id="lineage">
                  
                  <label for="color">Color:</label>
                  <input type="text" name="color" id="color">
                  
                  <label for="temperament">Temperament:</label>
                  <input type="text" name="temperament" id="temperament">
                  
                  <label for="age">Age:</label>
                  <input type="number" name="age" id="age" min="0">
                  
                  <label for="location">Location:</label>
                  <input type="text" name="location" id="location">
                  
                  <label for="image">Image:</label>
                  <input type="file" name="image" id="image" accept="image/*" required>
                  
                  <button type="submit">Submit</button>
              </form>
              <div class="back-links">
                  <a href="/admin-dashboard" class="back-link">Admin Dashboard</a>
                  <a href="/" class="back-link">View Male Studs</a>
              </div>
              <footer>
                  <p>Contact Us:</p>
                  <div class="contact-section">
                      <p>
                          <a href="https://wa.me/917338040633" target="_blank">
                              <i class="fab fa-whatsapp"></i> 7338040633
                          </a>
                      </p>
                      <p>
                          <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                              <i class="fab fa-facebook-f"></i> A&A Kennels
                          </a>
                      </p>
                  </div>
              </footer>
          </body>
          </html>
      `);
  });
  
  // Add Male Stud Submission
  app.post("/add-male-stud", isAdmin, upload.single("image"), async (req, res) => {
    const { name, lineage, color, temperament, age, location } = req.body;
    let imageUrl = null;
  
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "aanda-kennels/male-studs" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(req.file.buffer);
      });
      imageUrl = result.secure_url;
    }
  
    const sql = "INSERT INTO male_studs (name, lineage, color, temperament, age, location, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, lineage, color, temperament, age, location, imageUrl], (err) => {
      if (err) {
        console.error("Insert male stud error:", err);
        return res.status(500).send("Error inserting male stud");
      }
      res.redirect("/");
    });
  });

// Stud Performance Dashboard (Admin Only)
app.get("/analysis", isAdmin, (req, res) => {
    const queries = {
        successRate: `
            SELECT 
                SUM(CASE WHEN female_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered,
                SUM(CASE WHEN female_status = 'Failure' THEN 1 ELSE 0 END) AS failed,
                COUNT(*) AS total
            FROM studs
        `,
        puppyStats: `
            SELECT 
                AVG(female_puppy_count) AS avg_puppies,
                MIN(female_puppy_count) AS min_puppies,
                MAX(female_puppy_count) AS max_puppies
            FROM studs
            WHERE female_status = 'Delivered' AND female_puppy_count IS NOT NULL
        `,
        ownerStats: `
            SELECT 
                owner_name,
                COUNT(*) AS stud_count,
                SUM(CASE WHEN female_status = 'Delivered' THEN 1 ELSE 0 END) AS delivered_count
            FROM studs
            GROUP BY owner_name
            ORDER BY stud_count DESC
            LIMIT 5
        `,
        breedingTimeline: `
            SELECT 
                DATE_FORMAT(s.female_first_day_of_heat, '%Y-%m') AS heat_month,
                COUNT(DISTINCT s.id) AS heat_count,
                COUNT(DISTINCT CASE WHEN DATE_FORMAT(b.breeding_date, '%Y-%m') = DATE_FORMAT(s.female_first_day_of_heat, '%Y-%m') THEN b.breeding_date END) AS breeding_count
            FROM studs s
            LEFT JOIN breeding_dates b ON s.id = b.stud_id
            GROUP BY DATE_FORMAT(s.female_first_day_of_heat, '%Y-%m')
            ORDER BY heat_month
        `,
        upcomingEvents: `
            SELECT 
                s.name,
                s.owner_name,
                DATE_FORMAT(DATE_ADD(s.female_first_day_of_heat, INTERVAL 6 MONTH), '%Y-%m-%d') AS next_heat_cycle,
                DATEDIFF(DATE_ADD(s.female_first_day_of_heat, INTERVAL 6 MONTH), CURDATE()) AS days_until_heat,
                DATE_FORMAT(DATE_ADD(MAX(b.breeding_date), INTERVAL 63 DAY), '%Y-%m-%d') AS puppy_delivery_date,
                s.female_status
            FROM studs s
            LEFT JOIN breeding_dates b ON s.id = b.stud_id
            WHERE s.female_status != 'Delivered'
            GROUP BY s.id, s.name, s.owner_name, s.female_first_day_of_heat, s.female_status
            ORDER BY next_heat_cycle ASC
            LIMIT 5
        `,
    };

    Promise.all([
        new Promise((resolve, reject) => {
            db.query(queries.successRate, (err, result) => {
                if (err) reject(err);
                else resolve(result[0] || { delivered: 0, failed: 0, total: 0 });
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.puppyStats, (err, result) => {
                if (err) reject(err);
                else resolve(result[0] || { avg_puppies: null, min_puppies: null, max_puppies: null });
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.ownerStats, (err, result) => {
                if (err) reject(err);
                else resolve(result || []);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.breedingTimeline, (err, result) => {
                if (err) reject(err);
                else resolve(result || []);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(queries.upcomingEvents, (err, result) => {
                if (err) reject(err);
                else resolve(result || []);
            });
        }),
    ])
        .then(([successRate, puppyStats, ownerStats, breedingTimeline, upcomingEvents]) => {
            const timelineLabels = breedingTimeline.length ? breedingTimeline.map((t) => t.heat_month) : ["No Data"];
            const heatCounts = breedingTimeline.length ? breedingTimeline.map((t) => t.heat_count || 0) : [0];
            const breedingCounts = breedingTimeline.length ? breedingTimeline.map((t) => t.breeding_count || 0) : [0];

            // Handle null or undefined values for puppyStats
            const avgPuppies = puppyStats.avg_puppies !== null && puppyStats.avg_puppies !== undefined ? Number(puppyStats.avg_puppies).toFixed(1) : "N/A";
            const minPuppies = puppyStats.min_puppies !== null && puppyStats.min_puppies !== undefined ? puppyStats.min_puppies : "N/A";
            const maxPuppies = puppyStats.max_puppies !== null && puppyStats.max_puppies !== undefined ? puppyStats.max_puppies : "N/A";

            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <title>Stud Performance Dashboard - A&A Kennels</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta charset="UTF-8">
                    <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
                    <style>
                        /* Reset and Base Styles */
                        * {
                            box-sizing: border-box;
                            margin: 0;
                            padding: 0;
                            scroll-behavior: smooth;
                        }

                        body {
                            background: linear-gradient(135deg, #0f172a, #1e2a38);
                            font-family: 'Montserrat', sans-serif;
                            color: #e2e8f0;
                            margin: 0;
                            padding: 0;
                            min-height: 100vh;
                            display: flex;
                            flex-direction: column;
                            position: relative;
                            overflow-x: hidden;
                        }

                        /* Advanced Particle Background */
                        body::before {
                            content: '';
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="10" cy="10" r="2" fill="rgba(52, 152, 219, 0.3)" opacity="0.6"><animate attributeName="cx" from="10" to="100%" dur="8s" repeatCount="indefinite" /><animate attributeName="cy" from="10" to="100%" dur="12s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="4s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.3)" opacity="0.6"><animate attributeName="cx" from="50%" to="0" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="100%" dur="6s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="5s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(52, 152, 219, 0.3)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="9s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="3s" repeatCount="indefinite" /></circle><circle cx="80%" cy="30%" r="2" fill="rgba(255, 99, 71, 0.3)" opacity="0.6"><animate attributeName="cx" from="80%" to="10%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="30%" to="90%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="4s" repeatCount="indefinite" /></circle></svg>');
                            z-index: -1;
                            pointer-events: none;
                            animation: subtleMove 20s infinite linear;
                        }

                        @keyframes subtleMove {
                            0% { transform: translate(0, 0) scale(1); }
                            50% { transform: translate(20px, -20px) scale(1.05); }
                            100% { transform: translate(0, 0) scale(1); }
                        }

                        /* Sticky Header with Parallax and Glassmorphism */
                        header {
                            background: rgba(15, 23, 42, 0.4);
                            backdrop-filter: blur(15px);
                            -webkit-backdrop-filter: blur(15px);
                            padding: 20px;
                            text-align: center;
                            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            gap: 15px;
                            border-radius: 20px;
                            margin: 20px auto;
                            max-width: 1300px;
                            border: 1px solid rgba(255, 255, 255, 0.15);
                            position: relative;
                            top: 0;
                            z-index: 100;
                            animation: slideDown 1.2s ease-out;
                            overflow: hidden;
                        }

                        header::before {
                            content: '';
                            position: absolute;
                            top: -50%;
                            left: -50%;
                            width: 200%;
                            height: 200%;
                            background: radial-gradient(circle, rgba(52, 152, 219, 0.3) 0%, transparent 70%);
                            animation: rotateGlow 10s infinite linear;
                            z-index: -1;
                        }

                        @keyframes rotateGlow {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }

                        header img {
                            width: 80px;
                            height: auto;
                            border-radius: 50%;
                            transition: transform 0.4s ease, box-shadow 0.4s ease;
                            box-shadow: 0 0 20px rgba(230, 126, 34, 0.8), 0 0 30px rgba(52, 152, 219, 0.6);
                            animation: pulse 2.5s infinite ease-in-out;
                        }

                        header img:hover {
                            transform: scale(1.15) rotate(10deg);
                            box-shadow: 0 0 30px rgba(230, 126, 34, 1), 0 0 40px rgba(52, 152, 219, 0.9);
                        }

                        @keyframes pulse {
                            0%, 100% { transform: scale(1); }
                            50% { transform: scale(1.08); }
                        }

                        header h1 {
                            font-family: 'Orbitron', sans-serif;
                            font-size: 2em;
                            margin: 0;
                            text-transform: uppercase;
                            letter-spacing: 4px;
                            background: linear-gradient(45deg, #f97316, #3b82f6);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                            text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                            transition: transform 0.4s ease, text-shadow 0.4s ease;
                        }

                        header h1:hover {
                            transform: translateY(-5px);
                            text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                        }

                        /* Main Heading with Animated Glow */
                        h2 {
                            font-family: 'Orbitron', sans-serif;
                            font-size: 2.8em;
                            color: #3b82f6;
                            text-align: center;
                            margin: 40px 0 30px;
                            text-transform: uppercase;
                            letter-spacing: 4px;
                            text-shadow: 0 0 20px rgba(59, 130, 246, 0.7);
                            animation: neonPulse 3s infinite alternate;
                            position: relative;
                            z-index: 1;
                        }

                        h2::after {
                            content: '';
                            position: absolute;
                            bottom: -10px;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 60px;
                            height: 4px;
                            background: linear-gradient(90deg, #f97316, #3b82f6);
                            border-radius: 2px;
                            box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
                            animation: lineGlow 3s infinite alternate;
                        }

                        @keyframes neonPulse {
                            0% { text-shadow: 0 0 20px rgba(59, 130, 246, 0.7), 0 0 30px rgba(249, 115, 22, 0.4); }
                            100% { text-shadow: 0 0 30px rgba(59, 130, 246, 1), 0 0 40px rgba(249, 115, 22, 0.7); }
                        }

                        @keyframes lineGlow {
                            0% { box-shadow: 0 0 15px rgba(249, 115, 22, 0.5); }
                            100% { box-shadow: 0 0 25px rgba(249, 115, 22, 0.8); }
                        }

                        /* Dashboard Container with Masonry Grid */
                        .dashboard-container {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                            gap: 30px;
                            max-width: 1400px;
                            margin: 0 auto 50px;
                            padding: 0 20px;
                            position: relative;
                            z-index: 1;
                        }

                        /* Card with Advanced Glassmorphism and 3D Effects */
                        .card {
                            background: rgba(15, 23, 42, 0.3);
                            backdrop-filter: blur(15px);
                            -webkit-backdrop-filter: blur(15px);
                            border-radius: 20px;
                            overflow: hidden;
                            box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(255, 255, 255, 0.1);
                            transition: transform 0.5s ease, box-shadow 0.5s ease;
                            position: relative;
                            animation: fadeInUp 0.8s ease-out;
                            transform-style: preserve-3d;
                            perspective: 1000px;
                            padding: 25px;
                        }

                        .card::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                            opacity: 0;
                            transition: opacity 0.5s ease;
                            z-index: -1;
                        }

                        .card:hover::before {
                            opacity: 1;
                        }

                        .card:hover {
                            transform: translateY(-10px) scale(1.03) rotateX(5deg) rotateY(5deg);
                            box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                        }

                        .card h3 {
                            font-family: 'Orbitron', sans-serif;
                            font-size: 1.8em;
                            color: #f97316;
                            margin-bottom: 20px;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            text-shadow: 0 0 15px rgba(249, 115, 22, 0.6);
                            transition: color 0.4s ease, text-shadow 0.4s ease;
                        }

                        .card h3:hover {
                            color: #3b82f6;
                            text-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
                        }

                        .card p {
                            font-size: 1.1em;
                            color: #cbd5e1;
                            margin: 10px 0;
                            transition: color 0.4s ease, transform 0.4s ease;
                        }

                        .card p:hover {
                            color: #ffffff;
                            transform: translateX(5px);
                        }

                        /* Table Container for Upcoming Events with Horizontal Scrolling */
                        .table-container {
                            overflow-x: auto;
                            width: 100%;
                            -webkit-overflow-scrolling: touch;
                        }

                        .table-container::-webkit-scrollbar {
                            height: 8px;
                        }

                        .table-container::-webkit-scrollbar-thumb {
                            background: #3b82f6;
                            border-radius: 4px;
                            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
                        }

                        .table-container::-webkit-scrollbar-track {
                            background: rgba(15, 23, 42, 0.5);
                            border-radius: 4px;
                        }

                        .card table {
                            width: 100%;
                            min-width: 600px;
                            border-collapse: separate;
                            border-spacing: 0 10px;
                        }

                        .card th,
                        .card td {
                            padding: 12px 15px;
                            text-align: left;
                            font-size: 1em;
                            color: #e2e8f0;
                            background: rgba(15, 23, 42, 0.6);
                            transition: background 0.3s ease, transform 0.3s ease;
                            border-radius: 8px;
                        }

                        .card th {
                            background: linear-gradient(90deg, #1e293b, #2d3748);
                            color: #3b82f6;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }

                        .card tr:hover td {
                            background: rgba(59, 130, 246, 0.15);
                            transform: translateY(-2px);
                        }

                        /* Breeding Timeline Chart Size Adjustment */
                        .breeding-timeline-chart {
                            width: 100%;
                            height: 400px !important;
                        }

                        .card canvas {
                            max-width: 100%;
                            height: auto;
                            border-radius: 10px;
                            box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
                        }

                        /* Heat Soon Highlight */
                        .heat-soon {
                            background: rgba(249, 115, 22, 0.2);
                            color: #f97316;
                            font-weight: 600;
                            animation: pulseHighlight 2s infinite ease-in-out;
                        }

                        @keyframes pulseHighlight {
                            0%,
                            100% {
                                background: rgba(249, 115, 22, 0.2);
                            }
                            50% {
                                background: rgba(249, 115, 22, 0.4);
                            }
                        }

                        /* Back Links with Neumorphism */
                        .back-link {
                            display: inline-block;
                            padding: 12px 25px;
                            background: rgba(15, 23, 42, 0.6);
                            color: #e2e8f0;
                            text-decoration: none;
                            border-radius: 10px;
                            box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.4), -3px -3px 10px rgba(255, 255, 255, 0.05);
                            transition: all 0.4s ease;
                            font-size: 1em;
                            font-weight: 500;
                            margin: 10px 15px;
                            position: relative;
                            overflow: hidden;
                        }

                        .back-link::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: -100%;
                            width: 100%;
                            height: 100%;
                            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                            transition: left 0.6s ease;
                        }

                        .back-link:hover::before {
                            left: 100%;
                        }

                        .back-link:hover {
                            background: rgba(59, 130, 246, 0.4);
                            transform: translateY(-3px);
                            box-shadow: 0 6px 15px rgba(59, 130, 246, 0.5);
                            color: #ffffff;
                        }

                        /* Footer with Enhanced Glassmorphism */
                        footer {
                            background: rgba(15, 23, 42, 0.4);
                            backdrop-filter: blur(15px);
                            -webkit-backdrop-filter: blur(15px);
                            padding: 25px;
                            text-align: center;
                            margin-top: auto;
                            box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                            border-top: 1px solid rgba(255, 255, 255, 0.15);
                        }

                        footer .contact-section {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                            gap: 20px;
                            max-width: 900px;
                            margin: 0 auto;
                            padding: 15px 0;
                        }

                        footer p {
                            margin: 5px 0;
                            font-size: 1.1em;
                            color: #e2e8f0;
                            font-weight: 400;
                        }

                        footer a {
                            color: #3b82f6;
                            text-decoration: none;
                            transition: color 0.4s ease, transform 0.4s ease;
                            display: inline-flex;
                            align-items: center;
                            gap: 10px;
                            font-size: 1.2em;
                            font-weight: 500;
                        }

                        footer a:hover {
                            color: #f97316;
                            transform: translateX(8px);
                        }

                        footer i {
                            font-size: 1.8em;
                            transition: transform 0.4s ease;
                        }

                        footer a:hover i {
                            transform: scale(1.3) rotate(5deg);
                        }

                        /* Animations */
                        @keyframes slideDown {
                            from {
                                opacity: 0;
                                transform: translateY(-60px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }

                        @keyframes fadeInUp {
                            from {
                                opacity: 0;
                                transform: translateY(30px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }

                        /* Responsive Design */
                        @media (max-width: 768px) {
                            header {
                                flex-direction: column;
                                margin: 15px;
                                padding: 15px;
                            }

                            header img {
                                width: 60px;
                            }

                            header h1 {
                                font-size: 1.5em;
                            }

                            h2 {
                                font-size: 2em;
                            }

                            .dashboard-container {
                                grid-template-columns: 1fr;
                                gap: 20px;
                            }

                            .card {
                                padding: 15px;
                            }

                            .card h3 {
                                font-size: 1.5em;
                            }

                            .card p,
                            .card th,
                            .card td {
                                font-size: 0.9em;
                            }

                            .breeding-timeline-chart {
                                height: 300px !important;
                            }

                            .back-link {
                                margin: 10px 0;
                            }

                            footer .contact-section {
                                grid-template-columns: 1fr;
                            }
                        }

                        @media (max-width: 480px) {
                            header img {
                                width: 50px;
                            }

                            header h1 {
                                font-size: 1.2em;
                            }

                            h2 {
                                font-size: 1.6em;
                            }

                            .card {
                                padding: 10px;
                            }

                            .card h3 {
                                font-size: 1.3em;
                            }

                            .card p,
                            .card th,
                            .card td {
                                font-size: 0.85em;
                            }

                            .breeding-timeline-chart {
                                height: 250px !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <header>
                        <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                        <h1>A&A Kennels - Stud Performance Dashboard</h1>
                    </header>
                    <h2>Stud Performance Dashboard</h2>
                    <div class="dashboard-container">
                        <div class="card">
                            <h3>Breeding Success Rate</h3>
                            <canvas id="successChart"></canvas>
                        </div>
                        <div class="card">
                            <h3>Puppy Count Statistics</h3>
                            <p>Average: ${avgPuppies}</p>
                            <p>Min: ${minPuppies}</p>
                            <p>Max: ${maxPuppies}</p>
                        </div>
                        <div class="card">
                            <h3>Top Owners</h3>
                            <div class="table-container">
                                <table>
                                    <tr><th>Owner</th><th>Studs</th><th>Success Rate</th></tr>
                                    ${
                                        ownerStats.length
                                            ? ownerStats
                                                  .map(
                                                      (owner) => `
                                        <tr>
                                            <td>${owner.owner_name || "Unknown"}</td>
                                            <td>${owner.stud_count || 0}</td>
                                            <td>${
                                                owner.stud_count > 0
                                                    ? ((owner.delivered_count / owner.stud_count) * 100).toFixed(1)
                                                    : 0
                                            }%</td>
                                        </tr>
                                    `
                                                  )
                                                  .join("")
                                            : '<tr><td colspan="3">No data available</td></tr>'
                                    }
                                </table>
                            </div>
                        </div>
                        <div class="card">
                            <h3>Breeding Timeline</h3>
                            <canvas id="timelineChart" class="breeding-timeline-chart"></canvas>
                        </div>
                        <div class="card">
                            <h3>Upcoming Events</h3>
                            <div class="table-container">
                                <table>
                                    <tr><th>Stud</th><th>Owner</th><th>Next Heat</th><th>Days Until Heat</th><th>Delivery Date</th></tr>
                                    ${
                                        upcomingEvents.length
                                            ? upcomingEvents
                                                  .map(
                                                      (event) => `
                                        <tr ${
                                            event.days_until_heat <= 7 && event.days_until_heat >= 0
                                                ? 'class="heat-soon"'
                                                : ""
                                        }>
                                            <td>${event.name || "Unknown"}</td>
                                            <td>${event.owner_name || "Unknown"}</td>
                                            <td>${event.next_heat_cycle || "N/A"}</td>
                                            <td>${event.days_until_heat !== null ? event.days_until_heat : "N/A"}</td>
                                            <td>${
                                                event.female_status === "Waiting"
                                                    ? event.puppy_delivery_date || "N/A"
                                                    : "N/A"
                                            }</td>
                                        </tr>
                                    `
                                                  )
                                                  .join("")
                                            : '<tr><td colspan="5">No upcoming events</td></tr>'
                                    }
                                </table>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="/admin-dashboard" class="back-link">Admin Dashboard</a>
                        <a href="/" class="back-link">View Male Studs</a>
                        <a href="/logout" class="back-link">Logout</a>
                    </div>
                    <footer>
                        <p>Contact Us:</p>
                        <div class="contact-section">
                            <p>
                                <a href="https://wa.me/917338040633" target="_blank">
                                    <i class="fab fa-whatsapp"></i> 7338040633
                                </a>
                            </p>
                            <p>
                                <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                                    <i class="fab fa-facebook-f"></i> A&A Kennels
                                </a>
                            </p>
                        </div>
                    </footer>
                    <script>
                        const successCtx = document.getElementById("successChart").getContext("2d");
                        new Chart(successCtx, {
                            type: "pie",
                            data: {
                                labels: ["Delivered", "Failed"],
                                datasets: [{
                                    data: [${successRate.delivered || 0}, ${successRate.failed || 0}],
                                    backgroundColor: ["#27ae60", "#e74c3c"],
                                    borderColor: "#ecf0f1",
                                    borderWidth: 1,
                                }],
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { position: "top", labels: { color: "#ecf0f1" } },
                                    tooltip: { bodyFont: { size: 14 }, titleFont: { size: 16 } },
                                },
                            },
                        });

                        const timelineCtx = document.getElementById("timelineChart").getContext("2d");
                        new Chart(timelineCtx, {
                            type: "line",
                            data: {
                                labels: [${timelineLabels.map((label) => `'${label}'`).join(",")}],
                                datasets: [
                                    {
                                        label: "Heat Starts",
                                        data: [${heatCounts.join(",")}],
                                        borderColor: "#3498db",
                                        fill: false,
                                        tension: 0.4,
                                    },
                                    {
                                        label: "Breeding Events",
                                        data: [${breedingCounts.join(",")}],
                                        borderColor: "#e67e22",
                                        fill: false,
                                        tension: 0.4,
                                    },
                                ],
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    x: { ticks: { color: "#ecf0f1" } },
                                    y: { ticks: { color: "#ecf0f1" }, beginAtZero: true },
                                },
                                plugins: {
                                    legend: { labels: { color: "#ecf0f1" } },
                                    tooltip: { bodyFont: { size: 14 }, titleFont: { size: 16 } },
                                },
                            },
                        });
                    </script>
                </body>
                </html>
            `;
            res.send(html);
        })
        .catch((err) => {
            console.error("Analysis route failed:", err);
            res.status(500).send(`Error generating analysis: ${err.message}`);
        });
});
// Forgot Password Submission
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    const authorizedEmail = "akashnayak200329@gmail.com";
  
    if (email !== authorizedEmail) {
      return res.redirect("/forgot-password?error=true");
    }
  
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err || !results.length) {
        return res.redirect("/forgot-password?error=true");
      }
  
      const token = crypto.randomBytes(20).toString("hex");
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration
  
      db.query(
        "INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
        [email, token, expiresAt],
        (err) => {
          if (err) {
            console.error("Error storing token:", err);
            return res.redirect("/forgot-password?error=true");
          }
  
          const resetLink = `http://localhost:3000/reset-password?token=${token}`;
          const mailOptions = {
            from: "akashnayak200329@gmail.com",
            to: email,
            subject: "Password Reset Request - A&A Kennels",
            html: `
                          <h2>Password Reset Request</h2>
                          <p>You requested a password reset for your A&A Kennels account.</p>
                          <p>Click the link below to reset your password:</p>
                          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                          <p>This link will expire in 1 hour.</p>
                          <p>If you did not request a password reset, please ignore this email.</p>
                      `,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error("Error sending email:", error);
              return res.redirect("/forgot-password?error=true");
            }
            res.send(`
                          <!DOCTYPE html>
                          <html lang="en">
                          <head>
                              <title>Recovery Email Sent - A&A Kennels</title>
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <meta charset="UTF-8">
                              <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                              <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                              <style>
                                  /* Reset and Base Styles */
                                  * {
                                      box-sizing: border-box;
                                      margin: 0;
                                      padding: 0;
                                      scroll-behavior: smooth;
                                  }
  
                                  body {
                                      background: linear-gradient(135deg, #0f172a, #1e2a38);
                                      font-family: 'Montserrat', sans-serif;
                                      color: #e2e8f0;
                                      min-height: 100vh;
                                      display: flex;
                                      flex-direction: column;
                                      align-items: center;
                                      justify-content: center;
                                      overflow-x: hidden;
                                      position: relative;
                                      z-index: 1;
                                      padding-bottom: 60px;
                                  }
  
                                  body::before {
                                      content: '';
                                      position: fixed;
                                      top: 0;
                                      left: 0;
                                      width: 100%;
                                      height: 100%;
                                      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                                      z-index: -1;
                                      animation: particleFlow 20s infinite linear;
                                  }
  
                                  @keyframes particleFlow {
                                      0% { transform: translate(0, 0) scale(1); }
                                      50% { transform: translate(15px, -15px) scale(1.1); }
                                      100% { transform: translate(0, 0) scale(1); }
                                  }
  
                                  header {
                                      background: rgba(15, 23, 42, 0.4);
                                      backdrop-filter: blur(15px);
                                      -webkit-backdrop-filter: blur(15px);
                                      padding: 20px;
                                      text-align: center;
                                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                                      border-radius: 20px;
                                      margin-bottom: 40px;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      gap: 20px;
                                      border: 1px solid rgba(255, 255, 255, 0.15);
                                      position: relative;
                                      overflow: hidden;
                                      animation: slideDown 1.2s ease-out;
                                  }
  
                                  header::before {
                                      content: '';
                                      position: absolute;
                                      top: -50%;
                                      left: -50%;
                                      width: 200%;
                                      height: 200%;
                                      background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                                      animation: rotateGlow 12s infinite linear;
                                      z-index: -1;
                                  }
  
                                  @keyframes rotateGlow {
                                      0% { transform: rotate(0deg); }
                                      100% { transform: rotate(360deg); }
                                  }
  
                                  header img {
                                      width: 100px;
                                      height: auto;
                                      border-radius: 50%;
                                      transition: transform 0.4s ease, box-shadow 0.4s ease;
                                      box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                                      animation: pulse 2.5s infinite ease-in-out;
                                  }
  
                                  header img:hover {
                                      transform: scale(1.15) rotate(10deg);
                                      box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
                                  }
  
                                  @keyframes pulse {
                                      0%, 100% { transform: scale(1); }
                                      50% { transform: scale(1.08); }
                                  }
  
                                  header h1 {
                                      font-family: 'Orbitron', sans-serif;
                                      font-size: 2.5em;
                                      margin: 0;
                                      text-transform: uppercase;
                                      letter-spacing: 4px;
                                      background: linear-gradient(45deg, #f97316, #3b82f6);
                                      -webkit-background-clip: text;
                                      -webkit-text-fill-color: transparent;
                                      text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                                      transition: transform 0.4s ease, text-shadow 0.4s ease;
                                  }
  
                                  header h1:hover {
                                      transform: translateY(-5px);
                                      text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                                  }
  
                                  .forgot-password-container {
                                      background: rgba(15, 23, 42, 0.3);
                                      backdrop-filter: blur(15px);
                                      -webkit-backdrop-filter: blur(15px);
                                      padding: 40px;
                                      border-radius: 20px;
                                      box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                                      border: 1px solid rgba(255, 255, 255, 0.1);
                                      width: 100%;
                                      max-width: 450px;
                                      text-align: center;
                                      position: relative;
                                      overflow: hidden;
                                      animation: fadeInUp 1s ease-out;
                                      transform-style: preserve-3d;
                                      perspective: 1000px;
                                      margin-bottom: 20px;
                                  }
  
                                  .forgot-password-container::before {
                                      content: '';
                                      position: absolute;
                                      top: 0;
                                      left: 0;
                                      width: 100%;
                                      height: 100%;
                                      background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                                      opacity: 0;
                                      transition: opacity 0.5s ease;
                                      z-index: -1;
                                  }
  
                                  .forgot-password-container:hover::before {
                                      opacity: 1;
                                  }
  
                                  .forgot-password-container:hover {
                                      transform: translateY(-10px) scale(1.02) rotateX(5deg);
                                      box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                                  }
  
                                  h2 {
                                      font-family: 'Orbitron', sans-serif;
                                      font-size: 2.2em;
                                      color: #3b82f6;
                                      margin-bottom: 30px;
                                      text-transform: uppercase;
                                      letter-spacing: 3px;
                                      text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                                      animation: neonPulse 3s infinite alternate;
                                  }
  
                                  @keyframes neonPulse {
                                      0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                                      100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
                                  }
  
                                  .message {
                                      font-size: 1.1em;
                                      color: #2ecc71;
                                      margin-bottom: 20px;
                                      transition: color 0.4s ease;
                                  }
  
                                  .message:hover {
                                      color: #27ae60;
                                  }
  
                                  .back-button {
                                      display: inline-block;
                                      padding: 10px 20px;
                                      background: rgba(15, 23, 42, 0.6);
                                      border: 1px solid rgba(255, 255, 255, 0.2);
                                      border-radius: 10px;
                                      color: #e2e8f0;
                                      font-family: 'Orbitron', sans-serif;
                                      font-size: 1em;
                                      text-decoration: none;
                                      transition: all 0.4s ease;
                                      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                                      text-transform: uppercase;
                                      letter-spacing: 1px;
                                  }
  
                                  .back-button:hover {
                                      background: rgba(59, 130, 246, 0.8);
                                      transform: translateY(-2px);
                                      box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
                                      color: #ffffff;
                                  }
  
                                  .back-button:active {
                                      transform: translateY(0);
                                      box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                                  }
  
                                  footer {
                                      background: rgba(15, 23, 42, 0.4);
                                      backdrop-filter: blur(15px);
                                      -webkit-backdrop-filter: blur(15px);
                                      padding: 20px;
                                      text-align: center;
                                      box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                                      border-top: 1px solid rgba(255, 255, 255, 0.15);
                                      width: 100%;
                                      margin-top: auto;
                                  }
  
                                  footer .contact-section {
                                      display: flex;
                                      justify-content: center;
                                      gap: 20px;
                                      max-width: 900px;
                                      margin: 0 auto;
                                      padding: 10px 0;
                                  }
  
                                  footer p {
                                      margin: 5px 0;
                                      font-size: 1em;
                                      color: #e2e8f0;
                                      font-weight: 400;
                                  }
  
                                  footer a {
                                      color: #3b82f6;
                                      text-decoration: none;
                                      transition: color 0.4s ease, transform 0.4s ease;
                                      display: inline-flex;
                                      align-items: center;
                                      gap: 8px;
                                      font-size: 1.1em;
                                      font-weight: 500;
                                  }
  
                                  footer a:hover {
                                      color: #f97316;
                                      transform: translateX(5px);
                                  }
  
                                  footer i {
                                      font-size: 1.5em;
                                      transition: transform 0.4s ease;
                                  }
  
                                  footer a:hover i {
                                      transform: scale(1.2) rotate(5deg);
                                  }
  
                                  @keyframes slideDown {
                                      from { opacity: 0; transform: translateY(-60px); }
                                      to { opacity: 1; transform: translateY(0); }
                                  }
  
                                  @keyframes fadeInUp {
                                      from { opacity: 0; transform: translateY(20px); }
                                      to { opacity: 1; transform: translateY(0); }
                                  }
  
                                  @media (max-width: 768px) {
                                      header {
                                          flex-direction: column;
                                          padding: 15px;
                                          margin-bottom: 20px;
                                      }
  
                                      header img {
                                          width: 80px;
                                      }
  
                                      header h1 {
                                          font-size: 2em;
                                      }
  
                                      .forgot f-password-container {
                                          padding: 30px;
                                          max-width: 350px;
                                      }
  
                                      h2 {
                                          font-size: 1.8em;
                                      }
  
                                      .message {
                                          font-size: 1em;
                                      }
  
                                      .back-button {
                                          padding: 8px 16px;
                                          font-size: 0.9em;
                                      }
  
                                      footer .contact-section {
                                          flex-direction: column;
                                          gap: 10px;
                                      }
                                  }
  
                                  @media (max-width: 480px) {
                                      header img {
                                          width: 60px;
                                      }
  
                                      header h1 {
                                          font-size: 1.5em;
                                      }
  
                                      .forgot-password-container {
                                          padding: 20px;
                                          max-width: 300px;
                                      }
  
                                      h2 {
                                          font-size: 1.5em;
                                      }
  
                                      .message {
                                          font-size: 0.9em;
                                      }
  
                                      .back-button {
                                          padding: 6px 12px;
                                          font-size: 0.85em;
                                      }
  
                                      footer p {
                                          font-size: 0.9em;
                                      }
  
                                      footer a {
                                          font-size: 1em;
                                      }
                                  }
                              </style>
                          </head>
                          <body>
                              <header>
                                  <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                                  <h1>A&A Kennels - Recovery Email Sent</h1>
                              </header>
                              <div class="forgot-password-container">
                                  <h2>Email Sent</h2>
                                  <div class="message">A password reset link has been sent to your email. Please check your inbox (and spam/junk folder).</div>
                                  <a href="/login" class="back-button">Back to Login</a>
                              </div>
                              <footer>
                                  <p>Contact Us:</p>
                                  <div class="contact-section">
                                      <p>
                                          <a href="https://wa.me/917338040633" target="_blank">
                                              <i class="fab fa-whatsapp"></i> 7338040633
                                          </a>
                                      </p>
                                      <p>
                                          <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                                              <i class="fab fa-facebook-f"></i> A&A Kennels
                                          </a>
                                      </p>
                                  </div>
                              </footer>
                          </body>
                          </html>
                      `);
          });
        }
      );
    });
  });
// Static files (moved after route definitions)

// Reset Password Page
app.get("/reset-password", (req, res) => {
    const { token } = req.query;
    const authorizedEmail = "akashnayak200329@gmail.com";
  
    if (!token) {
      return res.redirect("/forgot-password?error=true");
    }
  
    db.query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE",
      [token],
      (err, results) => {
        if (err || !results.length || results[0].email !== authorizedEmail) {
          return res.send(`
                      <!DOCTYPE html>
                      <html lang="en">
                      <head>
                          <title>Invalid or Restricted Link - A&A Kennels</title>
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <meta charset="UTF-8">
                          <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                          <style>
                              /* Reset and Base Styles */
                              * {
                                  box-sizing: border-box;
                                  margin: 0;
                                  padding: 0;
                                  scroll-behavior: smooth;
                              }
  
                              body {
                                  background: linear-gradient(135deg, #0f172a, #1e2a38);
                                  font-family: 'Montserrat', sans-serif;
                                  color: #e2e8f0;
                                  min-height: 100vh;
                                  display: flex;
                                  flex-direction: column;
                                  align-items: center;
                                  justify-content: center;
                                  overflow-x: hidden;
                                  position: relative;
                                  z-index: 1;
                                  padding-bottom: 60px;
                              }
  
                              body::before {
                                  content: '';
                                  position: fixed;
                                  top: 0;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                                  z-index: -1;
                                  animation: particleFlow 20s infinite linear;
                              }
  
                              @keyframes particleFlow {
                                  0% { transform: translate(0, 0) scale(1); }
                                  50% { transform: translate(15px, -15px) scale(1.1); }
                                  100% { transform: translate(0, 0) scale(1); }
                              }
  
                              header {
                                  background: rgba(15, 23, 42, 0.4);
                                  backdrop-filter: blur(15px);
                                  -webkit-backdrop-filter: blur(15px);
                                  padding: 20px;
                                  text-align: center;
                                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                                  border-radius: 20px;
                                  margin-bottom: 40px;
                                  display: flex;
                                  align-items: center;
                                  justify-content: center;
                                  gap: 20px;
                                  border: 1px solid rgba(255, 255, 255, 0.15);
                                  position: relative;
                                  overflow: hidden;
                                  animation: slideDown 1.2s ease-out;
                              }
  
                              header::before {
                                  content: '';
                                  position: absolute;
                                  top: -50%;
                                  left: -50%;
                                  width: 200%;
                                  height: 200%;
                                  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                                  animation: rotateGlow 12s infinite linear;
                                  z-index: -1;
                              }
  
                              @keyframes rotateGlow {
                                  0% { transform: rotate(0deg); }
                                  100% { transform: rotate(360deg); }
                              }
  
                              header img {
                                  width: 100px;
                                  height: auto;
                                  border-radius: 50%;
                                  transition: transform 0.4s ease, box-shadow 0.4s ease;
                                  box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                                  animation: pulse 2.5s infinite ease-in-out;
                              }
  
                              header img:hover {
                                  transform: scale(1.15) rotate(10deg);
                                  box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
                              }
  
                              @keyframes pulse {
                                  0%, 100% { transform: scale(1); }
                                  50% { transform: scale(1.08); }
                              }
  
                              header h1 {
                                  font-family: 'Orbitron', sans-serif;
                                  font-size: 2.5em;
                                  margin: 0;
                                  text-transform: uppercase;
                                  letter-spacing: 4px;
                                  background: linear-gradient(45deg, #f97316, #3b82f6);
                                  -webkit-background-clip: text;
                                  -webkit-text-fill-color: transparent;
                                  text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                                  transition: transform 0.4s ease, text-shadow 0.4s ease;
                              }
  
                              header h1:hover {
                                  transform: translateY(-5px);
                                  text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                              }
  
                              .reset-password-container {
                                  background: rgba(15, 23, 42, 0.3);
                                  backdrop-filter: blur(15px);
                                  -webkit-backdrop-filter: blur(15px);
                                  padding: 40px;
                                  border-radius: 20px;
                                  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                                  border: 1px solid rgba(255, 255, 255, 0.1);
                                  width: 100%;
                                  max-width: 450px;
                                  text-align: center;
                                  position: relative;
                                  overflow: hidden;
                                  animation: fadeInUp 1s ease-out;
                                  transform-style: preserve-3d;
                                  perspective: 1000px;
                                  margin-bottom: 20px;
                              }
  
                              .reset-password-container::before {
                                  content: '';
                                  position: absolute;
                                  top: 0;
                                  left: 0;
                                  width: 100%;
                                  height: 100%;
                                  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                                  opacity: 0;
                                  transition: opacity 0.5s ease;
                                  z-index: -1;
                              }
  
                              .reset-password-container:hover::before {
                                  opacity: 1;
                              }
  
                              .reset-password-container:hover {
                                  transform: translateY(-10px) scale(1.02) rotateX(5deg);
                                  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                              }
  
                              h2 {
                                  font-family: 'Orbitron', sans-serif;
                                  font-size: 2.2em;
                                  color: #3b82f6;
                                  margin-bottom: 30px;
                                  text-transform: uppercase;
                                  letter-spacing: 3px;
                                  text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                                  animation: neonPulse 3s infinite alternate;
                              }
  
                              @keyframes neonPulse {
                                  0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                                  100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
                              }
  
                              input[type="password"] {
                                  width: 100%;
                                  padding: 12px 15px;
                                  margin: 15px 0;
                                  border: 1px solid rgba(255, 255, 255, 0.2);
                                  border-radius: 10px;
                                  background: rgba(255, 255, 255, 0.05);
                                  color: #e2e8f0;
                                  font-family: 'Montserrat', sans-serif;
                                  font-size: 1em;
                                  outline: none;
                                  transition: all 0.4s ease;
                                  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1);
                              }
  
                              input[type="password"]:focus {
                                  border-color: #3b82f6;
                                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                                  background: rgba(255, 255, 255, 0.1);
                              }
  
                              button {
                                  width: 100%;
                                  padding: 12px;
                                  background: linear-gradient(45deg, #f97316, #3b82f6);
                                  border: none;
                                  border-radius: 10px;
                                  color: #ffffff;
                                  font-family: 'Orbitron', sans-serif;
                                  font-size: 1.1em;
                                  cursor: pointer;
                                  transition: all 0.4s ease;
                                  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                                  text-transform: uppercase;
                                  letter-spacing: 2px;
                              }
  
                              button:hover {
                                  transform: translateY(-2px);
                                  box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(249, 115, 22, 0.4);
                              }
  
                              button:active {
                                  transform: translateY(0);
                                  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                              }
  
                              .message {
                                  font-size: 1.1em;
                                  color: #ef4444;
                                  margin: 15px 0;
                                  padding: 10px;
                                  border-radius: 8px;
                                  transition: color 0.4s ease;
                              }
  
                              .message:hover {
                                  color: #dc2626;
                              }
  
                              .back-button {
                                  display: inline-block;
                                  padding: 10px 20px;
                                  background: rgba(15, 23, 42, 0.6);
                                  border: 1px solid rgba(255, 255, 255, 0.2);
                                  border-radius: 10px;
                                  color: #e2e8f0;
                                  font-family: 'Orbitron', sans-serif;
                                  font-size: 1em;
                                  text-decoration: none;
                                  transition: all 0.4s ease;
                                  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                                  text-transform: uppercase;
                                  letter-spacing: 1px;
                              }
  
                              .back-button:hover {
                                  background: rgba(59, 130, 246, 0.8);
                                  transform: translateY(-2px);
                                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
                                  color: #ffffff;
                              }
  
                              .back-button:active {
                                  transform: translateY(0);
                                  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                              }
  
                              footer {
                                  background: rgba(15, 23, 42, 0.4);
                                  backdrop-filter: blur(15px);
                                  -webkit-backdrop-filter: blur(15px);
                                  padding: 20px;
                                  text-align: center;
                                  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                                  border-top: 1px solid rgba(255, 255, 255, 0.15);
                                  width: 100%;
                                  margin-top: auto;
                              }
  
                              footer .contact-section {
                                  display: flex;
                                  justify-content: center;
                                  gap: 20px;
                                  max-width: 900px;
                                  margin: 0 auto;
                                  padding: 10px 0;
                              }
  
                              footer p {
                                  margin: 5px 0;
                                  font-size: 1em;
                                  color: #e2e8f0;
                                  font-weight: 400;
                              }
  
                              footer a {
                                  color: #3b82f6;
                                  text-decoration: none;
                                  transition: color 0.4s ease, transform 0.4s ease;
                                  display: inline-flex;
                                  align-items: center;
                                  gap: 8px;
                                  font-size: 1.1em;
                                  font-weight: 500;
                              }
  
                              footer a:hover {
                                  color: #f97316;
                                  transform: translateX(5px);
                              }
  
                              footer i {
                                  font-size: 1.5em;
                                  transition: transform 0.4s ease;
                              }
  
                              footer a:hover i {
                                  transform: scale(1.2) rotate(5deg);
                              }
  
                              @keyframes slideDown {
                                  from { opacity: 0; transform: translateY(-60px); }
                                  to { opacity: 1; transform: translateY(0); }
                              }
  
                              @keyframes fadeInUp {
                                  from { opacity: 0; transform: translateY(20px); }
                                  to { opacity: 1; transform: translateY(0); }
                              }
  
                              @media (max-width: 768px) {
                                  header {
                                      flex-direction: column;
                                      padding: 15px;
                                      margin-bottom: 20px;
                                  }
  
                                  header img {
                                      width: 80px;
                                  }
  
                                  header h1 {
                                      font-size: 2em;
                                  }
  
                                  .reset-password-container {
                                      padding: 30px;
                                      max-width: 350px;
                                  }
  
                                  h2 {
                                      font-size: 1.8em;
                                  }
  
                                  .message {
                                      font-size: 1em;
                                  }
  
                                  footer .contact-section {
                                      flex-direction: column;
                                      gap: 10px;
                                  }
                              }
  
                              @media (max-width: 480px) {
                                  header img {
                                      width: 60px;
                                  }
  
                                  header h1 {
                                      font-size: 1.5em;
                                  }
  
                                  .reset-password-container {
                                      padding: 20px;
                                      max-width: 300px;
                                  }
  
                                  h2 {
                                      font-size: 1.5em;
                                  }
  
                                  .message {
                                      font-size: 0.9em;
                                  }
  
                                  footer p {
                                      font-size: 0.9em;
                                  }
  
                                  footer a {
                                      font-size: 1em;
                                  }
                              }
                          </style>
                      </head>
                      <body>
                          <header>
                              <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                              <h1>A&A Kennels - Invalid Link</h1>
                          </header>
                          <div class="reset-password-container">
                              <h2>Invalid or Restricted Link</h2>
                              <div class="message">This password reset link is invalid, expired, or restricted to authorized personnel only.</div>
                              <a href="/forgot-password" class="back-button">Request a New Link</a>
                          </div>
                          <footer>
                              <p>Contact Us:</p>
                              <div class="contact-section">
                                  <p>
                                      <a href="https://wa.me/917338040633" target="_blank">
                                          <i class="fab fa-whatsapp"></i> 7338040633
                                      </a>
                                  </p>
                                  <p>
                                      <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                                          <i class="fab fa-facebook-f"></i> A&A Kennels
                                      </a>
                                  </p>
                              </div>
                          </footer>
                      </body>
                      </html>
                  `);
        }
  
        res.send(`
                  <!DOCTYPE html>
                  <html lang="en">
                  <head>
                      <title>Reset Password - A&A Kennels</title>
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <meta charset="UTF-8">
                      <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                      <style>
                          /* Reset and Base Styles */
                          * {
                              box-sizing: border-box;
                              margin: 0;
                              padding: 0;
                              scroll-behavior: smooth;
                          }
  
                          body {
                              background: linear-gradient(135deg, #0f172a, #1e2a38);
                              font-family: 'Montserrat', sans-serif;
                              color: #e2e8f0;
                              min-height: 100vh;
                              display: flex;
                              flex-direction: column;
                              align-items: center;
                              justify-content: center;
                              overflow-x: hidden;
                              position: relative;
                              z-index: 1;
                              padding-bottom: 60px;
                          }
  
                          body::before {
                              content: '';
                              position: fixed;
                              top: 0;
                              left: 0;
                              width: 100%;
                              height: 100%;
                              background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                              z-index: -1;
                              animation: particleFlow 20s infinite linear;
                          }
  
                          @keyframes particleFlow {
                              0% { transform: translate(0, 0) scale(1); }
                              50% { transform: translate(15px, -15px) scale(1.1); }
                              100% { transform: translate(0, 0) scale(1); }
                          }
  
                          header {
                              background: rgba(15, 23, 42, 0.4);
                              backdrop-filter: blur(15px);
                              -webkit-backdrop-filter: blur(15px);
                              padding: 20px;
                              text-align: center;
                              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                              border-radius: 20px;
                              margin-bottom: 40px;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              gap: 20px;
                              border: 1px solid rgba(255, 255, 255, 0.15);
                              position: relative;
                              overflow: hidden;
                              animation: slideDown 1.2s ease-out;
                          }
  
                          header::before {
                              content: '';
                              position: absolute;
                              top: -50%;
                              left: -50%;
                              width: 200%;
                              height: 200%;
                              background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                              animation: rotateGlow 12s infinite linear;
                              z-index: -1;
                          }
  
                          @keyframes rotateGlow {
                              0% { transform: rotate(0deg); }
                              100% { transform: rotate(360deg); }
                          }
  
                          header img {
                              width: 100px;
                              height: auto;
                              border-radius: 50%;
                              transition: transform 0.4s ease, box-shadow 0.4s ease;
                              box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                              animation: pulse 2.5s infinite ease-in-out;
                          }
  
                          header img:hover {
                              transform: scale(1.15) rotate(10deg);
                              box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
                          }
  
                          @keyframes pulse {
                              0%, 100% { transform: scale(1); }
                              50% { transform: scale(1.08); }
                          }
  
                          header h1 {
                              font-family: 'Orbitron', sans-serif;
                              font-size: 2.5em;
                              margin: 0;
                              text-transform: uppercase;
                              letter-spacing: 4px;
                              background: linear-gradient(45deg, #f97316, #3b82f6);
                              -webkit-background-clip: text;
                              -webkit-text-fill-color: transparent;
                              text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                              transition: transform 0.4s ease, text-shadow 0.4s ease;
                          }
  
                          header h1:hover {
                              transform: translateY(-5px);
                              text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                          }
  
                          .reset-password-container {
                              background: rgba(15, 23, 42, 0.3);
                              backdrop-filter: blur(15px);
                              -webkit-backdrop-filter: blur(15px);
                              padding: 40px;
                              border-radius: 20px;
                              box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                              border: 1px solid rgba(255, 255, 255, 0.1);
                              width: 100%;
                              max-width: 450px;
                              text-align: center;
                              position: relative;
                              overflow: hidden;
                              animation: fadeInUp 1s ease-out;
                              transform-style: preserve-3d;
                              perspective: 1000px;
                              margin-bottom: 20px;
                          }
  
                          .reset-password-container::before {
                              content: '';
                              position: absolute;
                              top: 0;
                              left: 0;
                              width: 100%;
                              height: 100%;
                              background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                              opacity: 0;
                              transition: opacity 0.5s ease;
                              z-index: -1;
                          }
  
                          .reset-password-container:hover::before {
                              opacity: 1;
                          }
  
                          .reset-password-container:hover {
                              transform: translateY(-10px) scale(1.02) rotateX(5deg);
                              box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                          }
  
                          h2 {
                              font-family: 'Orbitron', sans-serif;
                              font-size: 2.2em;
                              color: #3b82f6;
                              margin-bottom: 30px;
                              text-transform: uppercase;
                              letter-spacing: 3px;
                              text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                              animation: neonPulse 3s infinite alternate;
                          }
  
                          @keyframes neonPulse {
                              0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                              100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
                          }
  
                          input[type="password"] {
                              width: 100%;
                              padding: 12px 15px;
                              margin: 15px 0;
                              border: 1px solid rgba(255, 255, 255, 0.2);
                              border-radius: 10px;
                              background: rgba(255, 255, 255, 0.05);
                              color: #e2e8f0;
                              font-family: 'Montserrat', sans-serif;
                              font-size: 1em;
                              outline: none;
                              transition: all 0.4s ease;
                              box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.1);
                          }
  
                          input[type="password"]:focus {
                              border-color: #3b82f6;
                              box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                              background: rgba(255, 255, 255, 0.1);
                          }
  
                          button {
                              width: 100%;
                              padding: 12px;
                              background: linear-gradient(45deg, #f97316, #3b82f6);
                              border: none;
                              border-radius: 10px;
                              color: #ffffff;
                              font-family: 'Orbitron', sans-serif;
                              font-size: 1.1em;
                              cursor: pointer;
                              transition: all 0.4s ease;
                              box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                              text-transform: uppercase;
                              letter-spacing: 2px;
                          }
  
                          button:hover {
                              transform: translateY(-2px);
                              box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(249, 115, 22, 0.4);
                          }
  
                          button:active {
                              transform: translateY(0);
                              box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                          }
  
                          .message {
                              font-size: 1.1em;
                              color: #ef4444;
                              margin: 15px 0;
                              padding: 10px;
                              border-radius: 8px;
                              transition: color 0.4s ease;
                          }
  
                          .message:hover {
                              color: #dc2626;
                          }
  
                          footer {
                              background: rgba(15, 23, 42, 0.4);
                              backdrop-filter: blur(15px);
                              -webkit-backdrop-filter: blur(15px);
                              padding: 20px;
                              text-align: center;
                              box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                              border-top: 1px solid rgba(255, 255, 255, 0.15);
                              width: 100%;
                              margin-top: auto;
                          }
  
                          footer .contact-section {
                              display: flex;
                              justify-content: center;
                              gap: 20px;
                              max-width: 900px;
                              margin: 0 auto;
                              padding: 10px 0;
                          }
  
                          footer p {
                              margin: 5px 0;
                              font-size: 1em;
                              color: #e2e8f0;
                              font-weight: 400;
                          }
  
                          footer a {
                              color: #3b82f6;
                              text-decoration: none;
                              transition: color 0.4s ease, transform 0.4s ease;
                              display: inline-flex;
                              align-items: center;
                              gap: 8px;
                              font-size: 1.1em;
                              font-weight: 500;
                          }
  
                          footer a:hover {
                              color: #f97316;
                              transform: translateX(5px);
                          }
  
                          footer i {
                              font-size: 1.5em;
                              transition: transform 0.4s ease;
                          }
  
                          footer a:hover i {
                              transform: scale(1.2) rotate(5deg);
                          }
  
                          @keyframes slideDown {
                              from { opacity: 0; transform: translateY(-60px); }
                              to { opacity: 1; transform: translateY(0); }
                          }
  
                          @keyframes fadeInUp {
                              from { opacity: 0; transform: translateY(20px); }
                              to { opacity: 1; transform: translateY(0); }
                          }
  
                          @media (max-width: 768px) {
                              header {
                                  flex-direction: column;
                                  padding: 15px;
                                  margin-bottom: 20px;
                              }
  
                              header img {
                                  width: 80px;
                              }
  
                              header h1 {
                                  font-size: 2em;
                              }
  
                              .reset-password-container {
                                  padding: 30px;
                                  max-width: 350px;
                              }
  
                              h2 {
                                  font-size: 1.8em;
                              }
  
                              .message {
                                  font-size: 1em;
                              }
  
                              footer .contact-section {
                                  flex-direction: column;
                                  gap: 10px;
                              }
                          }
  
                          @media (max-width: 480px) {
                              header img {
                                  width: 60px;
                              }
  
                              header h1 {
                                  font-size: 1.5em;
                              }
  
                              .reset-password-container {
                                  padding: 20px;
                                  max-width: 300px;
                              }
  
                              h2 {
                                  font-size: 1.5em;
                              }
  
                              .message {
                                  font-size: 0.9em;
                              }
  
                              footer p {
                                  font-size: 0.9em;
                              }
  
                              footer a {
                                  font-size: 1em;
                              }
                          }
                      </style>
                  </head>
                  <body>
                      <header>
                          <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                          <h1>A&A Kennels - Reset Password</h1>
                      </header>
                      <div class="reset-password-container">
                          <h2>Reset Password</h2>
                          <form action="/reset-password" method="POST">
                              <input type="hidden" name="token" value="${token}">
                              <input type="password" name="newPassword" placeholder="Enter new password" required>
                              <input type="password" name="confirmPassword" placeholder="Confirm new password" required>
                              <button type="submit">Reset Password</button>
                          </form>
                          ${req.query.error ? '<div class="message">Passwords do not match or an error occurred.</div>' : ""}
                      </div>
                      <footer>
                          <p>Contact Us:</p>
                          <div class="contact-section">
                              <p>
                                  <a href="https://wa.me/917338040633" target="_blank">
                                      <i class="fab fa-whatsapp"></i> 7338040633
                                  </a>
                              </p>
                              <p>
                                  <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                                      <i class="fab fa-facebook-f"></i> A&A Kennels
                                  </a>
                              </p>
                          </div>
                      </footer>
                  </body>
                  </html>
              `);
      }
    );
  });
// Reset Password Submission
app.post("/reset-password", (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;
    const authorizedEmail = "akashnayak200329@gmail.com";
  
    if (
      !token ||
      !newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword
    ) {
      return res.redirect(`/reset-password?token=${token}&error=true`);
    }
  
    db.query(
      "SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW() AND used = FALSE",
      [token],
      (err, results) => {
        if (err || !results.length || results[0].email !== authorizedEmail) {
          return res.redirect("/forgot-password?error=true");
        }
  
        const email = results[0].email;
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
          if (err) {
            console.error("Error hashing password:", err);
            return res.redirect(`/reset-password?token=${token}&error=true`);
          }
  
          db.query(
            "UPDATE users SET password = ? WHERE email = ?",
            [hashedPassword, email],
            (err) => {
              if (err) {
                console.error("Error updating password:", err);
                return res.redirect(`/reset-password?token=${token}&error=true`);
              }
  
              db.query(
                "UPDATE password_reset_tokens SET used = TRUE WHERE token = ?",
                [token],
                (err) => {
                  if (err) {
                    console.error("Error marking token as used:", err);
                  }
                  res.send(`
                                      <!DOCTYPE html>
                                      <html lang="en">
                                      <head>
                                          <title>Password Reset Successful - A&A Kennels</title>
                                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                          <meta charset="UTF-8">
                                          <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;700&family=Orbitron:wght@400;700&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">
                                          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
                                          <style>
                                              /* Reset and Base Styles */
                                              * {
                                                  box-sizing: border-box;
                                                  margin: 0;
                                                  padding: 0;
                                                  scroll-behavior: smooth;
                                              }
  
                                              body {
                                                  background: linear-gradient(135deg, #0f172a, #1e2a38);
                                                  font-family: 'Montserrat', sans-serif;
                                                  color: #e2e8f0;
                                                  min-height: 100vh;
                                                  display: flex;
                                                  flex-direction: column;
                                                  align-items: center;
                                                  justify-content: center;
                                                  overflow-x: hidden;
                                                  position: relative;
                                                  z-index: 1;
                                                  padding-bottom: 60px;
                                              }
  
                                              body::before {
                                                  content: '';
                                                  position: fixed;
                                                  top: 0;
                                                  left: 0;
                                                  width: 100%;
                                                  height: 100%;
                                                  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><circle cx="5" cy="5" r="2" fill="rgba(52, 152, 219, 0.4)" opacity="0.6"><animate attributeName="cx" from="5" to="95%" dur="10s" repeatCount="indefinite" /><animate attributeName="cy" from="5" to="95%" dur="15s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="4" dur="5s" repeatCount="indefinite" /></circle><circle cx="50%" cy="50%" r="2" fill="rgba(230, 126, 34, 0.4)" opacity="0.6"><animate attributeName="cx" from="50%" to="5%" dur="12s" repeatCount="indefinite" /><animate attributeName="cy" from="50%" to="95%" dur="8s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="5" dur="6s" repeatCount="indefinite" /></circle><circle cx="20%" cy="80%" r="2" fill="rgba(255, 99, 71, 0.4)" opacity="0.6"><animate attributeName="cx" from="20%" to="80%" dur="14s" repeatCount="indefinite" /><animate attributeName="cy" from="80%" to="20%" dur="10s" repeatCount="indefinite" /><animate attributeName="r" from="2" to="3" dur="4s" repeatCount="indefinite" /></circle></svg>');
                                                  z-index: -1;
                                                  animation: particleFlow 20s infinite linear;
                                              }
  
                                              @keyframes particleFlow {
                                                  0% { transform: translate(0, 0) scale(1); }
                                                  50% { transform: translate(15px, -15px) scale(1.1); }
                                                  100% { transform: translate(0, 0) scale(1); }
                                              }
  
                                              header {
                                                  background: rgba(15, 23, 42, 0.4);
                                                  backdrop-filter: blur(15px);
                                                  -webkit-backdrop-filter: blur(15px);
                                                  padding: 20px;
                                                  text-align: center;
                                                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
                                                  border-radius: 20px;
                                                  margin-bottom: 40px;
                                                  display: flex;
                                                  align-items: center;
                                                  justify-content: center;
                                                  gap: 20px;
                                                  border: 1px solid rgba(255, 255, 255, 0.15);
                                                  position: relative;
                                                  overflow: hidden;
                                                  animation: slideDown 1.2s ease-out;
                                              }
  
                                              header::before {
                                                  content: '';
                                                  position: absolute;
                                                  top: -50%;
                                                  left: -50%;
                                                  width: 200%;
                                                  height: 200%;
                                                  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
                                                  animation: rotateGlow 12s infinite linear;
                                                  z-index: -1;
                                              }
  
                                              @keyframes rotateGlow {
                                                  0% { transform: rotate(0deg); }
                                                  100% { transform: rotate(360deg); }
                                              }
  
                                              header img {
                                                  width: 100px;
                                                  height: auto;
                                                  border-radius: 50%;
                                                  transition: transform 0.4s ease, box-shadow 0.4s ease;
                                                  box-shadow: 0 0 20px rgba(249, 115, 22, 0.8), 0 0 30px rgba(59, 130, 246, 0.6);
                                                  animation: pulse 2.5s infinite ease-in-out;
                                              }
  
                                              header img:hover {
                                                  transform: scale(1.15) rotate(10deg);
                                                  box-shadow: 0 0 30px rgba(249, 115, 22, 1), 0 0 40px rgba(59, 130, 246, 0.9);
                                              }
  
                                              @keyframes pulse {
                                                  0%, 100% { transform: scale(1); }
                                                  50% { transform: scale(1.08); }
                                              }
  
                                              header h1 {
                                                  font-family: 'Orbitron', sans-serif;
                                                  font-size: 2.5em;
                                                  margin: 0;
                                                  text-transform: uppercase;
                                                  letter-spacing: 4px;
                                                  background: linear-gradient(45deg, #f97316, #3b82f6);
                                                  -webkit-background-clip: text;
                                                  -webkit-text-fill-color: transparent;
                                                  text-shadow: 0 0 15px rgba(249, 115, 22, 0.8), 0 0 25px rgba(59, 130, 246, 0.6);
                                                  transition: transform 0.4s ease, text-shadow 0.4s ease;
                                              }
  
                                              header h1:hover {
                                                  transform: translateY(-5px);
                                                  text-shadow: 0 0 25px rgba(249, 115, 22, 1), 0 0 35px rgba(59, 130, 246, 1);
                                              }
  
                                              .reset-password-container {
                                                  background: rgba(15, 23, 42, 0.3);
                                                  backdrop-filter: blur(15px);
                                                  -webkit-backdrop-filter: blur(15px);
                                                  padding: 40px;
                                                  border-radius: 20px;
                                                  box-shadow: 5px 5px 20px rgba(0, 0, 0, 0.4), -5px -5px 20px rgba(255, 255, 255, 0.05);
                                                  border: 1px solid rgba(255, 255, 255, 0.1);
                                                  width: 100%;
                                                  max-width: 450px;
                                                  text-align: center;
                                                  position: relative;
                                                  overflow: hidden;
                                                  animation: fadeInUp 1s ease-out;
                                                  transform-style: preserve-3d;
                                                  perspective: 1000px;
                                                  margin-bottom: 20px;
                                              }
  
                                              .reset-password-container::before {
                                                  content: '';
                                                  position: absolute;
                                                  top: 0;
                                                  left: 0;
                                                  width: 100%;
                                                  height: 100%;
                                                  background: linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(249, 115, 22, 0.2));
                                                  opacity: 0;
                                                  transition: opacity 0.5s ease;
                                                  z-index: -1;
                                              }
  
                                              .reset-password-container:hover::before {
                                                  opacity: 1;
                                              }
  
                                              .reset-password-container:hover {
                                                  transform: translateY(-10px) scale(1.02) rotateX(5deg);
                                                  box-shadow: 0 15px 40px rgba(59, 130, 246, 0.6), 0 0 50px rgba(249, 115, 22, 0.4);
                                              }
  
                                              h2 {
                                                  font-family: 'Orbitron', sans-serif;
                                                  font-size: 2.2em;
                                                  color: #3b82f6;
                                                  margin-bottom: 30px;
                                                  text-transform: uppercase;
                                                  letter-spacing: 3px;
                                                  text-shadow: 0 0 15px rgba(59, 130, 246, 0.7);
                                                  animation: neonPulse 3s infinite alternate;
                                              }
  
                                              @keyframes neonPulse {
                                                  0% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.7), 0 0 25px rgba(249, 115, 22, 0.4); }
                                                  100% { text-shadow: 0 0 25px rgba(59, 130, 246, 1), 0 0 35px rgba(249, 115, 22, 0.7); }
                                              }
  
                                              .message {
                                                  font-size: 1.1em;
                                                  color: #2ecc71;
                                                  margin-bottom: 20px;
                                                  transition: color 0.4s ease;
                                              }
  
                                              .message:hover {
                                                  color: #27ae60;
                                              }
  
                                              .back-button {
                                                  display: inline-block;
                                                  padding: 10px 20px;
                                                  background: rgba(15, 23, 42, 0.6);
                                                  border: 1px solid rgba(255, 255, 255, 0.2);
                                                  border-radius: 10px;
                                                  color: #e2e8f0;
                                                  font-family: 'Orbitron', sans-serif;
                                                  font-size: 1em;
                                                  text-decoration: none;
                                                  transition: all 0.4s ease;
                                                  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3), -2px -2px 8px rgba(255, 255, 255, 0.1);
                                                  text-transform: uppercase;
                                                  letter-spacing: 1px;
                                              }
  
                                              .back-button:hover {
                                                  background: rgba(59, 130, 246, 0.8);
                                                  transform: translateY(-2px);
                                                  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
                                                  color: #ffffff;
                                              }
  
                                              .back-button:active {
                                                  transform: translateY(0);
                                                  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.4);
                                              }
  
                                              footer {
                                                  background: rgba(15, 23, 42, 0.4);
                                                  backdrop-filter: blur(15px);
                                                  -webkit-backdrop-filter: blur(15px);
                                                  padding: 20px;
                                                  text-align: center;
                                                  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.5);
                                                  border-top: 1px solid rgba(255, 255, 255, 0.15);
                                                  width: 100%;
                                                  margin-top: auto;
                                              }
  
                                              footer .contact-section {
                                                  display: flex;
                                                  justify-content: center;
                                                  gap: 20px;
                                                  max-width: 900px;
                                                  margin: 0 auto;
                                                  padding: 10px 0;
                                              }
  
                                              footer p {
                                                  margin: 5px 0;
                                                  font-size: 1em;
                                                  color: #e2e8f0;
                                                  font-weight: 400;
                                              }
  
                                              footer a {
                                                  color: #3b82f6;
                                                  text-decoration: none;
                                                  transition: color 0.4s ease, transform 0.4s ease;
                                                  display: inline-flex;
                                                  align-items: center;
                                                  gap: 8px;
                                                  font-size: 1.1em;
                                                  font-weight: 500;
                                              }
  
                                              footer a:hover {
                                                  color: #f97316;
                                                  transform: translateX(5px);
                                              }
  
                                              footer i {
                                                  font-size: 1.5em;
                                                  transition: transform 0.4s ease;
                                              }
  
                                              footer a:hover i {
                                                  transform: scale(1.2) rotate(5deg);
                                              }
  
                                              @keyframes slideDown {
                                                  from { opacity: 0; transform: translateY(-60px); }
                                                  to { opacity: 1; transform: translateY(0); }
                                              }
  
                                              @keyframes fadeInUp {
                                                  from { opacity: 0; transform: translateY(20px); }
                                                  to { opacity: 1; transform: translateY(0); }
                                              }
  
                                              @media (max-width: 768px) {
                                                  header {
                                                      flex-direction: column;
                                                      padding: 15px;
                                                      margin-bottom: 20px;
                                                  }
  
                                                  header img {
                                                      width: 80px;
                                                  }
  
                                                  header h1 {
                                                      font-size: 2em;
                                                  }
  
                                                  .reset-password-container {
                                                      padding: 30px;
                                                      max-width: 350px;
                                                  }
  
                                                  h2 {
                                                      font-size: 1.8em;
                                                  }
  
                                                  .message {
                                                      font-size: 1em;
                                                  }
  
                                                  .back-button {
                                                      padding: 8px 16px;
                                                      font-size: 0.9em;
                                                  }
  
                                                  footer .contact-section {
                                                      flex-direction: column;
                                                      gap: 10px;
                                                  }
                                              }
  
                                              @media (max-width: 480px) {
                                                  header img {
                                                      width: 60px;
                                                  }
  
                                                  header h1 {
                                                      font-size: 1.5em;
                                                  }
  
                                                  .reset-password-container {
                                                      padding: 20px;
                                                      max-width: 300px;
                                                  }
  
                                                  h2 {
                                                      font-size: 1.5em;
                                                  }
  
                                                  .message {
                                                      font-size: 0.9em;
                                                  }
  
                                                  .back-button {
                                                      padding: 6px 12px;
                                                      font-size: 0.85em;
                                                  }
  
                                                  footer p {
                                                      font-size: 0.9em;
                                                  }
  
                                                  footer a {
                                                      font-size: 1em;
                                                  }
                                              }
                                          </style>
                                      </head>
                                      <body>
                                          <header>
                                              <img src="/uploads/a_a_kennels_logo_transparent.png" alt="A&A Kennels Logo">
                                              <h1>A&A Kennels - Password Reset</h1>
                                          </header>
                                          <div class="reset-password-container">
                                              <h2>Password Reset Successful</h2>
                                              <div class="message">Your password has been reset successfully.</div>
                                              <a href="/login" class="back-button">Back to Login</a>
                                          </div>
                                          <footer>
                                              <p>Contact Us:</p>
                                              <div class="contact-section">
                                                  <p>
                                                      <a href="https://wa.me/917338040633" target="_blank">
                                                          <i class="fab fa-whatsapp"></i> 7338040633
                                                      </a>
                                                  </p>
                                                  <p>
                                                      <a href="https://www.facebook.com/share/1HdVyCqHuM/" target="_blank">
                                                          <i class="fab fa-facebook-f"></i> A&A Kennels
                                                      </a>
                                                  </p>
                                              </div>
                                          </footer>
                                      </body>
                                      </html>
                                  `);
                }
              );
            }
          );
        });
      }
    );
  });

  app.use(express.static(path.join(__dirname, "public")));
  
  // Serve static files from the "public" directory
  const PORT = process.env.PORT || 3000;
  app.use(express.static("public"));
  
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });