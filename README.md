# 🚗⚡ EV CHARGER BOOKING SYSTEM  
_A DBMS Mini-Project using MySQL + Node.js + Express + HTML/CSS/JS_

---

## 👥 TEAM DETAILS  
**ANAGHA N BHARADWAJ – PES1UG23CS067**  
**ANIVARTHA UPADHYAYA – PES1UG23CS079**

---

## 📌 PROJECT OVERVIEW  
The **EV Charger Booking System** is a web-based platform that allows:

### 👤 **Users to:**
- Login securely  
- View available charging stations  
- Select charger type  
- View available time slots  
- Book slots for a selected date  
- View booking history  

### 🛠️ **Admins to:**
- Add stations  
- Add chargers  
- Manage bookings  
- View system overview (total stations, users, bookings, revenue)  

This system ensures **proper slot management**, prevents double booking, and uses **triggers + procedures + nested queries** as required for the DBMS mini-project.

---

## 🏗️ TECH STACK  
### **Frontend**
- HTML  
- CSS  
- JavaScript  

### **Backend**
- Node.js  
- Express.js  

### **Database**
- MySQL  
- Triggers  
- Procedures/Functions  
- Nested Queries  
- Join Queries  
- Aggregate Queries  

---


---

## 🗄️ DATABASE FEATURES  
### ✔ **Tables**
- `users`
- `admin`
- `stations`
- `chargers`
- `slots`
- `bookings`
- `booking_log` (log table for trigger)

### ✔ **Triggers Used**
1. **prevent_double_booking**  
   Prevents booking the same slot for the same charger twice.

2. **update_revenue_after_booking**  
   Automatically updates revenue of the station after booking.

3. **log_booking_activity**  
   Inserts a row into `booking_log` whenever a booking is created.

### ✔ **Stored Procedures / Functions**
- `get_available_slots()`  
- `calculate_station_revenue()`  
- `get_user_booking_history()`

### ✔ **Queries Used**
- 1 Nested Query  
- 1 Join Query  
- 1 Aggregate Query  
_All integrated with frontend (GUI)_

---

## HOW TO RUN (LOCAL SETUP)

### **1️⃣ Install Dependencies**
```bash
npm install
### 2️⃣ Import Database

Open MySQL and run:

CREATE DATABASE ev_charger;
USE ev_charger;
SOURCE ev_charger_full.sql;

3️⃣ Update DB Credentials (if needed)

Inside db/db.js:

user: 'root',
password: 'YOUR_MYSQL_PASSWORD',
database: 'ev_charger'

4️⃣ Start Backend Server
node server.js

5️⃣ Open in Browser
http://localhost:3000


