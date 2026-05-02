================================================================================
                           TEAM TASK MANAGER
================================================================================

A full-stack task management application with role-based access control, built 
for the Full Stack Software Engineer assignment at Ethara AI.

================================================================================
                              LIVE DEMO
================================================================================

Frontend URL: https://team-task-manager-one-lake.vercel.app
Backend API:  https://team-task-manager-vj1a.onrender.com/api
Demo Video:   [PASTE YOUR VIDEO LINK HERE]

================================================================================
                              FEATURES
================================================================================

[USER AUTHENTICATION]
- Signup and Login with JWT authentication
- Passwords hashed using bcryptjs

[PROJECT MANAGEMENT]
- Create, view, and delete projects
- Each project has a unique creator (Admin)

[TASK MANAGEMENT]
- Create tasks with title, description, due date, and assignment
- Update task status: Todo -> In Progress -> Done
- Delete tasks (Admin only)
- Edit task details

[ROLE-BASED ACCESS CONTROL (RBAC)]
- Admin (Project Creator): Full control - can delete any task, add/remove members
- Member (Invited User): Limited access - can only update status of assigned tasks

[DASHBOARD]
- Statistics: Total projects, total tasks, tasks by status
- View overdue tasks
- View recent tasks
- Quick action buttons

[TEAM COLLABORATION]
- Add team members to projects by email
- Members see only projects they're invited to

================================================================================
                              TECH STACK
================================================================================

Frontend:      React + Vite
Backend:       Node.js + Express
Database:      MongoDB Atlas
Authentication: JWT + bcryptjs
HTTP Client:   Axios
Deployment:    Vercel (Frontend) + Render (Backend)

================================================================================
                          PROJECT STRUCTURE
================================================================================

team-task-manager/
├── backend/
│   ├── models/          # User, Project, Task schemas
│   ├── routes/          # API routes
│   ├── middleware/      # JWT authentication
│   ├── server.js        # Express entry point
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Login, Signup, Dashboard, Projects, Tasks
│   │   ├── context/     # AuthContext for global state
│   │   ├── utils/       # API configuration
│   │   └── App.jsx      # Main app with routing
│   ├── .env             # Environment variables
│   └── package.json
└── README.txt

================================================================================
                          LOCAL SETUP INSTRUCTIONS
================================================================================

[PREREQUISITES]
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

[BACKEND SETUP]
1. git clone https://github.com/Paras-username/team-task-manager.git
2. cd team-task-manager/backend
3. npm install
4. Create .env file with:
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
5. npm start

[FRONTEND SETUP]
1. cd ../frontend
2. npm install
3. Create .env file with:
   VITE_API_URL=http://localhost:5000/api
4. npm run dev
5. Open http://localhost:5173

================================================================================
                              DEPLOYMENT
================================================================================

[BACKEND - RENDER]
1. Push code to GitHub
2. Create Web Service on Render
3. Connect repository
4. Set Root Directory: backend
5. Add environment variables in dashboard
6. Deploy

[FRONTEND - VERCEL]
1. Push code to GitHub
2. Import project to Vercel
3. Set Root Directory: frontend
4. Deploy

================================================================================
                              DEMO VIDEO
================================================================================

The 2-5 minute demo video demonstrates:
- User signup and login
- Creating a project
- Creating and assigning tasks
- Updating task status
- Dashboard statistics
- Role-based access control overview



================================================================================
                                AUTHOR
================================================================================

Name: Paras
GitHub: @Paras-username
Date: 3 May 2026

================================================================================
                          ASSIGNMENT REQUIREMENTS
================================================================================

Authentication (Signup/Login)
Project & team management
Task creation, assignment & status tracking
Dashboard with task statistics and overdue tracking
ole-based access control (Admin/Member)
REST APIs with database
Deployment with live URL
Demo video
README documentation

================================================================================