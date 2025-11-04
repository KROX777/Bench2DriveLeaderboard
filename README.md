# Bench2Drive-Style Leaderboard Website

A full-stack web application replicating the Bench2Drive Autonomous Driving Leaderboard, featuring a React frontend with sortable tables and a Node.js/Express backend with SQLite database.

## 🚀 Features

- **User Authentication System**:
  - User registration with secure password encryption
  - User login with JWT token authentication
  - Protected routes for authenticated users
  - User profile management
- **Multiple Pages with React Router**:
  - Home page with features and call-to-action
  - Interactive Leaderboard with sortable columns
  - Get Started guide with step-by-step instructions
  - News page with latest updates
  - User Profile page with submission history
  - Submit page for evaluation results
- **Dynamic Leaderboard Table**: Sortable columns for rank, entry, score, driving score, route completion, infraction penalty, and submissions
- **User Management**: Registration, login, and profile viewing
- **Submission System**: Users can submit their evaluation results with daily quota limits
- **Responsive Design**: Mobile-friendly layout with clean UI
- **Tab Navigation**: Switch between different tracks (Map Track, Sensor Track)
- **Real-time Data**: Fetches leaderboard data from backend API
- **RESTful API**: Backend endpoints for authentication, submissions, and user management
- **SQLite Database**: Persistent storage for users, submissions, and leaderboard entries

## 📁 Project Structure

```
b2d/
├── frontend/               # React application
│   ├── public/
│   ├── src/
│   │   ├── App.js         # Main React component with leaderboard
│   │   ├── App.css        # Styling for the application
│   │   └── index.js       # React entry point
│   └── package.json
│
└── backend/               # Node.js/Express API
    ├── index.js          # Express server with SQLite
    ├── package.json
    └── leaderboard.db    # SQLite database (auto-generated)
```

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (optional, for version control)

## 📦 Installation & Setup

### 1. Backend Setup

Open a terminal and navigate to the backend folder:

```bash
cd backend
```

Dependencies are already installed, but if needed:
```bash
npm install
```

Start the backend server:
```bash
npm start
```

The server will start on `http://localhost:5000`. You should see:
```
Server running on http://localhost:5000
Connected to SQLite database
Table created or already exists
Inserting sample data...
Sample data inserted successfully
```

**Available API Endpoints:**
- `GET http://localhost:5001/api/leaderboard` - Fetch all leaderboard entries
- `POST http://localhost:5001/api/submit` - Submit a new entry
- `POST http://localhost:5001/api/auth/register` - Register a new user
- `POST http://localhost:5001/api/auth/login` - Login user
- `GET http://localhost:5001/api/users/:id` - Get user information
- `GET http://localhost:5001/api/users/:id/submissions` - Get user's submissions
- `POST http://localhost:5001/api/submissions` - Submit evaluation results
- `GET http://localhost:5001/api/health` - Health check

**Note:** The backend server now runs on port **5001** instead of 5000.

### 2. Frontend Setup

Open a **new terminal** window and navigate to the frontend folder:

```bash
cd frontend
```

Dependencies are already installed, but if needed:
```bash
npm install
```

Start the React development server:
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`.

## 🎯 Usage

### User Authentication

1. **Register a New Account**:
   - Click "Login" in the navigation bar
   - Click "Register here" link
   - Fill in username, email, and password (minimum 6 characters)
   - Click "Register" button
   - You'll be automatically logged in and redirected to your profile

2. **Login to Existing Account**:
   - Click "Login" in the navigation bar
   - Enter your email and password
   - Click "Login" button
   - Access your profile and submit results

3. **View Your Profile**:
   - After logging in, click "Profile" in the navigation
   - View your account information
   - See your submission history
   - Check your daily quota limit

### Viewing the Website

1. Start both backend and frontend servers (see installation steps above)
2. Open your browser to `http://localhost:3000`
3. Navigate through the pages:
   - **Home**: Overview of the Bench2Drive leaderboard platform
   - **Leaderboard**: View rankings with sortable columns (click headers to sort)
   - **Submit**: Submit your evaluation results (requires login)
   - **Profile**: View your account and submission history (requires login)
   - **Get Started**: Step-by-step guide to submit your agent
   - **News**: Latest updates and announcements
4. Switch between "Map Track" and "Sensor Track" tabs on the leaderboard page

### Submitting a New Entry (via Web Interface)

1. **Login** to your account (or register if you don't have one)
2. Navigate to the **Submit** page
3. Fill in your evaluation results:
   - Overall Score (required)
   - Driving Score
   - Route Completion (%)
   - Infraction Penalty
   - Upload result file (optional)
4. Click "Submit Results"
5. Check your submission history in your **Profile** page

### Submitting via API

Use a tool like Postman or curl to submit new entries:

```bash
# Register a user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_team",
    "email": "team@example.com",
    "password": "secure123"
  }'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "team@example.com",
    "password": "secure123"
  }'

# Submit results (use user_id from login response)
curl -X POST http://localhost:5001/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "score": 88.5,
    "driving_score": 92.3,
    "route_completion": 93.5,
    "infraction_penalty": 1.45
  }'
```

## 🎨 Customization

### Modifying Sample Data

Edit `backend/index.js` around line 47 to change the sample data:

```javascript
const sampleData = [
  [1, 'Your Team Name', 95.5, 98.2, 99.1, 0.95, 15],
  // Add more entries...
];
```

### Styling Changes

Modify `frontend/src/App.css` to customize:
- Colors (search for `#61dafb` for accent color)
- Table styling
- Navigation bar
- Responsive breakpoints

### Adding More Features

Some ideas for enhancement:
- Add pagination for large datasets
- Implement filtering by track type
- Add authentication for submissions
- Create admin dashboard
- Export leaderboard to CSV
- Add charts/visualizations

## 🚢 Deployment

### Frontend Deployment (Vercel)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend folder and deploy:
   ```bash
   cd frontend
   vercel
   ```

3. Update the API URL in `frontend/src/App.js`:
   ```javascript
   axios.get('https://your-backend-url.com/api/leaderboard')
   ```

### Backend Deployment (Heroku)

1. Install Heroku CLI: [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

2. Navigate to backend folder:
   ```bash
   cd backend
   git init
   heroku create your-app-name
   ```

3. Add a `Procfile`:
   ```
   web: node index.js
   ```

4. Update port in `backend/index.js`:
   ```javascript
   const port = process.env.PORT || 5000;
   ```

5. Deploy:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

### Alternative: Deploy Both on Same Platform

You can also deploy both frontend and backend together using platforms like:
- **Railway** - Supports full-stack apps
- **Render** - Free tier available
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**

## 🧪 Testing

### Backend API Tests

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Test fetching leaderboard:
```bash
curl http://localhost:5000/api/leaderboard
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Technology Stack

**Frontend:**
- React 19.x
- React Router DOM (page navigation)
- Axios (HTTP client)
- @tanstack/react-table (sortable tables)
- CSS3 (responsive design)

**Backend:**
- Node.js
- Express.js
- SQLite3
- CORS
- bcryptjs (password encryption)
- jsonwebtoken (JWT authentication)

## 🤝 Contributing

This is a learning project. Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

ISC License - free to use for educational purposes.

## 🐛 Troubleshooting

### Port Already in Use

If port 5000 or 3000 is already in use:

**Backend:**
Edit `backend/index.js` and change:
```javascript
const port = 5001; // or any other available port
```

**Frontend:**
Create a `.env` file in frontend folder:
```
PORT=3001
```

### CORS Issues

If you see CORS errors, ensure the backend is running and check the URL in `frontend/src/App.js` matches your backend address.

### Database Errors

If you encounter database errors, delete `backend/leaderboard.db` and restart the backend server to recreate it.

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Tutorial](https://www.sqlitetutorial.net/)
- [TanStack Table Docs](https://tanstack.com/table/latest)
- [Bench2Drive Simulator](https://bench2drive.org/)

## 💡 Tips for GitHub Copilot Users

This project was designed to be built with GitHub Copilot assistance. When extending the application:

1. Write clear comments describing what you want
2. Let Copilot suggest implementations
3. Review and test suggestions before accepting
4. Break complex features into smaller functions
5. Use descriptive variable names for better suggestions

Example Copilot-friendly comment:
```javascript
// Create a function that filters leaderboard entries by minimum score
// Parameters: entries array, minScore number
// Returns: filtered array sorted by score descending
```

---

**Built with ❤️ using React, Node.js, and GitHub Copilot**
