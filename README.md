# 📚 Express Book Ordering App

A full-stack **Book Ordering Web Application** built using **Node.js, Express, MongoDB, and Handlebars**.  
This project demonstrates real-world backend architecture, authentication, database modeling, and RESTful API design.

---

## 🚀 Features

✅ Admin authentication  
✅ Book management (Create / Read / Update / Delete)  
✅ Shopping cart with quantity control  
✅ Order checkout system  
✅ MongoDB database with Mongoose  
✅ REST API endpoints  
✅ ISBN auto-lookup (OpenLibrary API)  
✅ Session-based cart handling  
✅ Clean MVC project structure  

---

## 🧰 Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js, Express |
| Database | MongoDB + Mongoose |
| View Engine | Handlebars |
| Authentication | express-session |
| Validation | express-validator |
| API | REST |
| Version Control | Git & GitHub |

---

## 📂 Project Structure
express-book-ordering-app/
│
├── app.js
├── package.json
├── .env
├── config/
│ └── db.js
├── middleware/
│ └── auth.js
├── models/
│ ├── Book.js
│ ├── Order.js
│ └── User.js
├── routes/
│ ├── web.books.js
│ ├── web.orders.js
│ ├── web.auth.js
│ ├── api.books.js
│ ├── api.orders.js
│ └── api.isbn.js
├── services/
├── views/
│ ├── layouts/
│ ├── partials/
│ ├── books/
│ ├── orders/
│ └── auth/
└── README.md

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

git clone https://github.com/ajaya-ghimire/express-book-ordering-app.git
cd express-book-ordering-app

2️⃣ Install dependencies
npm install

3️⃣ Create .env file
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=supersecret123
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!

4️⃣ Run the app
npm run dev
Open in browser:
http://localhost:3000

🔐 Admin Login
Email: admin@example.com
Password: Admin123!
(Admin account auto-creates on first launch)

**
🛒 Key Features**

📘 Book Management
Add, edit, delete books
ISBN-based auto-fill
Stock tracking

🛍️ Cart & Orders
Add/remove items
Quantity updates
Checkout flow
Order history

🔐 Authentication
Admin login
Protected routes
Session-based auth

🌐 API Endpoints
Books
GET    /api/books
GET    /api/books/:id
Orders
POST   /api/orders
ISBN Lookup
GET /api/isbn/:isbn

📈 Learning Outcomes
Full MVC backend architecture
Secure authentication & session handling
Database modeling with MongoDB
REST API design
Real-world project structure

🚀 Future Improvements
Stripe payment integration
Admin analytics dashboard
React frontend
Docker deployment

👨‍💻 Author
Ajaya Ghimire
🌐 Portfolio: https://ajayaghimire.net
⭐ If you like this project, give it a star on GitHub!


