# Digital Notice Board

A full-stack web application for managing and displaying college notices digitally.

## Features

- User login and authentication
- Role-based access control
- Admin, Staff, and Student roles
- Admin can create notices
- Admin can edit notices
- Admin can delete notices
- Notices can be targeted to:
  - Everyone
  - Staff
  - Students
- Notice expiry dates
- File/PDF attachments
- Search notices
- Filter notices by audience
- Sort notices
- Notifications for users
- Mark notifications as read
- Responsive mobile-friendly design
- MongoDB database

## Technologies Used

### Frontend

- React.js
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Multer
- CORS

## Project Structure

```text
Digital-Notice-Board/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md