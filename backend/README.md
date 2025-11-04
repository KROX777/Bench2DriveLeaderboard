# Backend - Bench2Drive Leaderboard API

Node.js/Express backend with SQLite database for the Bench2Drive Autonomous Driving Leaderboard.

## Quick Start

```bash
npm install
npm start
```

Server runs at: `http://localhost:5000`

## API Endpoints

### GET /api/leaderboard
Fetch all leaderboard entries sorted by score (descending).

**Response:**
```json
[
  {
    "id": 1,
    "rank": 1,
    "entry": "AutonomousAI Team",
    "score": 95.5,
    "driving_score": 98.2,
    "route_completion": 99.1,
    "infraction_penalty": 0.95,
    "submissions": 15
  },
  ...
]
```

### POST /api/submit
Submit a new leaderboard entry.

**Request Body:**
```json
{
  "entry": "Team Name",
  "score": 88.5,
  "driving_score": 92.3,
  "route_completion": 93.5,
  "infraction_penalty": 1.45
}
```

**Response:**
```json
{
  "message": "Entry submitted successfully",
  "id": 13
}
```

### GET /api/health
Check server status.

**Response:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

## Database Schema

**Table: entries**

| Column              | Type    | Description                        |
|---------------------|---------|-------------------------------------|
| id                  | INTEGER | Primary key (auto-increment)       |
| rank                | INTEGER | Current rank (updated automatically)|
| entry               | TEXT    | Team/model name                     |
| score               | REAL    | Overall score                       |
| driving_score       | REAL    | Driving performance score           |
| route_completion    | REAL    | Percentage of route completed       |
| infraction_penalty  | REAL    | Penalty score for infractions       |
| submissions         | INTEGER | Number of submissions               |

## Technologies

- **Express.js** - Web framework
- **SQLite3** - Database
- **CORS** - Cross-Origin Resource Sharing

## Configuration

Change the port in `index.js`:
```javascript
const port = 5000; // Change to your preferred port
```

## Sample Data

The database is automatically populated with 12 sample entries on first run. To reset:

1. Stop the server
2. Delete `leaderboard.db`
3. Restart the server

## Testing with cURL

```bash
# Fetch leaderboard
curl http://localhost:5000/api/leaderboard

# Submit new entry
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"entry":"Test Team","score":85.5,"driving_score":88.0,"route_completion":90.0,"infraction_penalty":1.5}'

# Health check
curl http://localhost:5000/api/health
```

## Development

The server automatically:
- Creates the database if it doesn't exist
- Creates the table schema
- Inserts sample data on first run
- Updates ranks when new entries are added
- Handles graceful shutdown

## Production Deployment

For production, consider:
- Using PostgreSQL instead of SQLite
- Adding authentication/authorization
- Implementing rate limiting
- Adding request validation
- Using environment variables for configuration
- Adding logging middleware

See main README.md for deployment instructions.
