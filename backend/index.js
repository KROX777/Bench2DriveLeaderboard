// Import express, cors, and sqlite3
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Secret key for JWT
const JWT_SECRET = 'bench2drive_secret_key_2025'; // In production, use environment variable

// Set up Express server on port 5001
const app = express();
const port = 5001;

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Validate by extension (frontend restricts selectable extensions).
    const allowedExt = /\.(json|txt|log|zip)$/i;
    const extname = allowedExt.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON, TXT, LOG, and ZIP files are allowed.'));
    }
  }
});

// Create a SQLite database 'leaderboard.db'
const db = new sqlite3.Database('./leaderboard.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Mock evaluator function (will be replaced with actual Python evaluator later)
function evaluateSubmission(filePath) {
  // TODO: Replace with actual Python evaluator call
  // For now, return mock scores based on file
  return {
    score: 85.5 + Math.random() * 10,
    driving_score: 88.0 + Math.random() * 8,
    route_completion: 92.5 + Math.random() * 5,
    infraction_penalty: 1.2 + Math.random() * 2
  };
}

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    quota_limit INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created');
    }
  });

  // Submissions table
  db.run(`CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    score REAL NOT NULL,
    driving_score REAL,
    route_completion REAL,
    infraction_penalty REAL,
    file_hash TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating submissions table:', err.message);
    } else {
      console.log('Submissions table created');
    }
  });

  // Legacy entries table
  db.run(`CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rank INTEGER,
    entry TEXT,
    score REAL,
    driving_score REAL,
    route_completion REAL,
    infraction_penalty REAL,
    submissions INTEGER
  )`, (err) => {
    if (err) {
      console.error('Error creating entries table:', err.message);
    } else {
      console.log('Entries table created');
    }
  });

  // Start server after database setup
  // Insert sample users if needed
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (err) {
      console.error('Error checking users:', err.message);
    } else if (!row || row.count === 0) {
      console.log('Inserting sample users...');
      const sampleUsers = [
        { username: 'autonomous_ai', email: 'team@autonomousai.com', quota: 15 },
        { username: 'deepdrive', email: 'labs@deepdrive.com', quota: 12 },
        { username: 'neural_nav', email: 'contact@neuralnav.com', quota: 18 },
        { username: 'robovision', email: 'info@robovision.com', quota: 9 },
        { username: 'smartcar', email: 'team@smartcar.ai', quota: 21 }
      ];
      
      sampleUsers.forEach(user => {
        db.run(
          'INSERT INTO users (username, email, quota_limit) VALUES (?, ?, ?)',
          [user.username, user.email, user.quota],
          (err) => {
            if (err) {
              console.error('Error inserting user:', err.message);
            }
          }
        );
      });
      
      console.log('Sample users inserted');
    }
  });

  startServer();
});

// Function to start the server
function startServer() {
  // API endpoints
  app.get('/api/leaderboard', (req, res) => {
    db.all('SELECT * FROM entries ORDER BY score DESC', [], (err, rows) => {
      if (err) {
        console.error('Error fetching leaderboard:', err.message);
        return res.status(500).json({ error: 'Failed to fetch leaderboard data' });
      }
      res.json(rows);
    });
  });

  app.post('/api/submit', (req, res) => {
    const { entry, score, driving_score, route_completion, infraction_penalty } = req.body;
    if (!entry || score === undefined || driving_score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    db.run(
      'INSERT INTO entries (entry, score, driving_score, route_completion, infraction_penalty, submissions) VALUES (?, ?, ?, ?, ?, 1)',
      [entry, score, driving_score, route_completion || 0, infraction_penalty || 0],
      function(err) {
        if (err) {
          console.error('Error inserting entry:', err.message);
          return res.status(500).json({ error: 'Failed to submit entry' });
        }
        res.json({ message: 'Entry submitted successfully', id: this.lastID });
      }
    );
  });

  // Authentication endpoints
  app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert user
      db.run(
        'INSERT INTO users (username, email, password, quota_limit) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, 10],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(409).json({ error: 'Username or email already exists' });
            }
            console.error('Error creating user:', err.message);
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          // Generate JWT token
          const token = jwt.sign({ userId: this.lastID }, JWT_SECRET, { expiresIn: '7d' });
          
          res.json({ 
            message: 'User created successfully',
            user: {
              id: this.lastID,
              username,
              email,
              quota_limit: 10
            },
            token
          });
        }
      );
    } catch (error) {
      console.error('Error in registration:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Error finding user:', err.message);
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      try {
        // Compare password
        let isPasswordValid = false;
        try {
          isPasswordValid = await bcrypt.compare(password, user.password);
        } catch (bcryptErr) {
          console.error('Bcrypt error:', bcryptErr.message);
          // Fallback: check if password field is empty (for debug)
          if (!user.password) {
            console.log('Warning: user password field is empty, allowing login for debugging');
            isPasswordValid = true;
          }
        }
        
        if (!isPasswordValid) {
          console.log('Login failed - password mismatch for user:', user.email);
          return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log('Login successful for user:', user.email);
        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            quota_limit: user.quota_limit
          },
          token
        });
      } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ error: 'Login failed' });
      }
    });
  });

  // Legacy registration endpoint (deprecated)
  app.post('/api/users/register', (req, res) => {
    const { username, email, quota_limit } = req.body;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    db.run(
      'INSERT INTO users (username, email, password, quota_limit) VALUES (?, ?, ?, ?)',
      [username, email, 'legacy_password', quota_limit || 10],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Username or email already exists' });
          }
          console.error('Error creating user:', err.message);
          return res.status(500).json({ error: 'Failed to create user' });
        }
        res.json({ message: 'User created successfully', user_id: this.lastID });
      }
    );
  });

  app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.get('SELECT id, username, email, quota_limit, created_at FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error('Error fetching user:', err.message);
        return res.status(500).json({ error: 'Failed to fetch user' });
      }
      if (!row) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(row);
    });
  });

  app.get('/api/users/:id/submissions', (req, res) => {
    const userId = req.params.id;
    db.all(
      'SELECT * FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC',
      [userId],
      (err, rows) => {
        if (err) {
          console.error('Error fetching user submissions:', err.message);
          return res.status(500).json({ error: 'Failed to fetch submissions' });
        }
        res.json(rows);
      }
    );
  });

  // Update user profile
  app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, currentPassword, newPassword } = req.body;

    // Basic validation
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }

    try {
      // First, get the current user data
      db.get('SELECT * FROM users WHERE id = ?', [userId], async (err, user) => {
        if (err) {
          console.error('Error fetching user:', err.message);
          return res.status(500).json({ error: 'Failed to fetch user' });
        }

        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }

        // If changing password, verify current password
        if (newPassword) {
          if (!currentPassword) {
            return res.status(400).json({ error: 'Current password is required to change password' });
          }

          const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
          if (!isCurrentPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
          }

          if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
          }
        }

        // Check if username or email is already taken by another user
        db.get(
          'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
          [username, email, userId],
          async (err, existingUser) => {
            if (err) {
              console.error('Error checking existing user:', err.message);
              return res.status(500).json({ error: 'Failed to update user' });
            }

            if (existingUser) {
              return res.status(409).json({ error: 'Username or email already exists' });
            }

            // Prepare update data
            const updateData = {
              username,
              email
            };

            let updateQuery = 'UPDATE users SET username = ?, email = ?';
            let updateParams = [username, email];

            // If changing password, hash the new password
            if (newPassword) {
              const hashedPassword = await bcrypt.hash(newPassword, 10);
              updateQuery += ', password = ?';
              updateParams.push(hashedPassword);
            }

            updateQuery += ' WHERE id = ?';
            updateParams.push(userId);

            // Update user
            db.run(updateQuery, updateParams, function(err) {
              if (err) {
                console.error('Error updating user:', err.message);
                return res.status(500).json({ error: 'Failed to update user' });
              }

              if (this.changes === 0) {
                return res.status(404).json({ error: 'User not found' });
              }

              // If username changed, update entries table
              if (username !== user.username) {
                db.run('UPDATE entries SET entry = ? WHERE entry = ?', [username, user.username], function(err) {
                  if (err) {
                    console.error('Error updating entries:', err.message);
                    // Don't fail the request, just log the error
                  } else {
                    console.log(`Updated ${this.changes} entries with new username`);
                  }
                });
              }

              res.json({
                message: 'User updated successfully',
                user: {
                  id: parseInt(userId),
                  username,
                  email,
                  quota_limit: user.quota_limit
                }
              });
            });
          }
        );
      });
    } catch (error) {
      console.error('Error in update:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

app.post('/api/submissions', upload.single('file'), (req, res) => {
  // Accepts multipart/form-data from the frontend (file + fields)
  const file = req.file;
  const body = req.body || {};
  const user_id = body.user_id;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!file) {
    return res.status(400).json({ error: 'File is required' });
  }

  // Compute file hash
  let file_hash = null;
  try {
    if (file && file.path && fs.existsSync(file.path)) {
      const fileBuffer = fs.readFileSync(file.path);
      file_hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }
  } catch (err) {
    console.error('Error computing file hash:', err.message);
    // proceed without file hash
  }

  // Call evaluator to get scores
  let evaluation_result;
  try {
    evaluation_result = evaluateSubmission(file.path);
    console.log('Evaluation result:', evaluation_result);
  } catch (err) {
    console.error('Error evaluating submission:', err.message);
    return res.status(500).json({ error: 'Failed to evaluate submission' });
  }

  const { score, driving_score, route_completion, infraction_penalty } = evaluation_result;

  // Check user's submission quota
  db.get('SELECT quota_limit, (SELECT COUNT(*) FROM submissions WHERE user_id = ? AND DATE(submitted_at) = DATE("now")) as today_submissions FROM users WHERE id = ?', [user_id, user_id], (err, row) => {
    if (err) {
      console.error('Error checking quota:', err.message);
      return res.status(500).json({ error: 'Failed to check submission quota' });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (row.today_submissions >= row.quota_limit) {
      return res.status(429).json({ error: 'Daily submission limit exceeded' });
    }
    // Insert submission with evaluated scores
    db.run(
      'INSERT INTO submissions (user_id, score, driving_score, route_completion, infraction_penalty, file_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, score, driving_score || 0, route_completion || 0, infraction_penalty || 0, file_hash],
      function(err) {
        if (err) {
          console.error('Error creating submission:', err.message);
          return res.status(500).json({ error: 'Failed to create submission' });
        }

        const submission_id = this.lastID;

        // Get user info for leaderboard entry
        db.get('SELECT username FROM users WHERE id = ?', [user_id], (err, user) => {
          if (err) {
            console.error('Error fetching user info:', err.message);
            // Continue anyway, just log the error
          }

          const entry_name = user ? user.username : `User ${user_id}`;

          // Also insert into entries table for leaderboard
          db.run(
            'INSERT INTO entries (entry, score, driving_score, route_completion, infraction_penalty, submissions) VALUES (?, ?, ?, ?, ?, 1)',
            [entry_name, score, driving_score || 0, route_completion || 0, infraction_penalty || 0],
            function(err) {
              if (err) {
                console.error('Error adding to leaderboard:', err.message);
                // Don't fail the submission, just log the error
              } else {
                console.log('Added to leaderboard, entry_id:', this.lastID);
              }

              res.json({ 
                message: 'Submission created successfully', 
                submission_id: submission_id,
                evaluation: {
                  score,
                  driving_score,
                  route_completion,
                  infraction_penalty
                }
              });
            }
          );
        });
      }
    );
  });
});  app.get('/api/submissions/:id', (req, res) => {
    const submissionId = req.params.id;
    db.get('SELECT * FROM submissions WHERE id = ?', [submissionId], (err, row) => {
      if (err) {
        console.error('Error fetching submission:', err.message);
        return res.status(500).json({ error: 'Failed to fetch submission' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json(row);
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
  });

  // Start the server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`API endpoints available:`);
    console.log(`  - GET  http://localhost:${port}/api/leaderboard`);
    console.log(`  - POST http://localhost:${port}/api/submit`);
    console.log(`  - POST http://localhost:${port}/api/auth/register`);
    console.log(`  - POST http://localhost:${port}/api/auth/login`);
    console.log(`  - GET  http://localhost:${port}/api/users/:id`);
    console.log(`  - PUT  http://localhost:${port}/api/users/:id`);
    console.log(`  - GET  http://localhost:${port}/api/users/:id/submissions`);
    console.log(`  - POST http://localhost:${port}/api/submissions`);
    console.log(`  - GET  http://localhost:${port}/api/submissions/:id`);
    console.log(`  - GET  http://localhost:${port}/api/health`);
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});
