import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { getClients, uploadClientDocument } from './handleDataBase.js'

dotenv.config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

console.log('Setting up authentication...')

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) {
    res.redirect('http://localhost:3000/api/logout');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.redirect('http://localhost:3000/api/logout');
  }
}

async function checkS3Bucket() {
  const bucketName = process.env.AWS_BUCKET_NAME;

  try {
    // Check if bucket exists
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log('✅ S3 bucket verified:', bucketName);

    // Configure CORS
    const corsParams = {
      Bucket: bucketName,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
            AllowedOrigins: ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
            ExposeHeaders: ['ETag']
          }
        ]
      }
    };

    try {
      await s3.send(new PutBucketCorsCommand(corsParams));
      console.log('✅ S3 bucket CORS configured');
    } catch (corsErr) {
      console.error('❌ Failed to configure CORS:', corsErr);
    }

    return true;
  } catch (err) {
    console.error('❌ S3 bucket error:', err.message);

    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      console.log('Creating bucket...');
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucketName, ACL: 'private' }));
        console.log('✅ S3 bucket created:', bucketName);
        return true;
      } catch (createErr) {
        console.error('❌ Failed to create bucket:', createErr);
        return false;
      }
    }

    return false;
  }
}
// =================== Middleware ===================
console.log("🛠️ Setting up session middleware");
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
}));

console.log("🛠️ Initializing Passport");
app.use(passport.initialize());
app.use(passport.session());

console.log("🛠️ Setting up CORS");
app.use(cors({
  origin: 'http://localhost:5173', // use your frontend domain if deployed
  credentials: true
}));

// =================== Passport Strategy ===================
console.log("🔐 Configuring Google OAuth strategy");
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback' // update for production
}, (accessToken, refreshToken, profile, done) => {
  const token = jwt.sign(
    { userId: profile.id, name: profile.displayName, email: profile.emails[0].value },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }                      // Optional: expires in 1 hour
  );
  return done(null, {
    token,
    name: profile.displayName,
    userId: profile.id,
    accessToken
  });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// =================== Auth Routes ===================
console.log("📌 Registering /auth/google route");
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

console.log("📌 Registering /auth/google/callback route");
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }),
  async (req, res) => {
    // Redirect to frontend after successful login     //add retreave database here 
    console.log('user: ', req.user.userId)
    res.redirect('http://localhost:5173');
  }
);

app.get('/api/clients', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  const clients = await getClients(req.user.userId);
  console.log(clients)
  res.json(clients);
});

// Add a debug route to check session
app.get('/debug-session', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  res.json({ session: req.session, user: req.user });
});

// =================== API Routes ===================
console.log("📌 Registering /api/user route");
app.get('/api/user', (req, res) => {
  res.json(req.user || null);
});

console.log("📌 Registering /api/logout route");
app.post('/api/logout/', (req, res) => {
  req.logout(function (err) {
    if (err) return res.status(500).send('Logout error');
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.sendStatus(200);
    });
  });
});


// =================== S3 Upload & List Endpoints ===================

app.post('/upload-note', async (req, res) => {
  console.log(req.body);
  await uploadClientDocument(req.user.userId, req.body);
  res.end();
});

app.get('/s3-test', async (req, res) => {
  try {
    const result = await s3.send(new HeadBucketCommand({ Bucket: process.env.AWS_BUCKET_NAME }));
    res.send("S3 bucket is accessible ✅");
  } catch (err) {
    console.error("S3 access test failed:", err);
    res.status(500).send("S3 test failed ❌");
  }
});

app.get('/list-notes', async (req, res) => {
  console.log('🔍 Listing notes...');

  const bucketName = process.env.AWS_BUCKET_NAME;

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: 'clients/' // Ensures we only get files under that path
  });

  try {
    const data = await s3.send(command);

    const groupedByClient = {};

    for (const obj of data.Contents || []) {
      const key = obj.Key; // e.g., clients/jane_doe/2025-05-26_17-23-00.pdf
      const parts = key.split('/');
      if (parts.length !== 3) continue;

      const clientFolder = parts[1];
      const fileName = parts[2];

      if (!groupedByClient[clientFolder]) {
        groupedByClient[clientFolder] = [];
      }

      groupedByClient[clientFolder].push({
        key,
        fileName,
        url: `https://${bucketName}.s3.amazonaws.com/${key}`
      });
    }

    // ✅ Sort notes for each client
    Object.values(groupedByClient).forEach(notesArray => {
      notesArray.sort((a, b) => {
        return new Date(b.fileName.split('_')[0]) - new Date(a.fileName.split('_')[0]);
      });
    });

    res.json(groupedByClient);
  } catch (err) {
    console.error("Error listing S3 objects:", err);
    res.status(500).send('Failed to list notes');
  }
});



// =================== Static File Handling ===================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, 'public');
const indexPath = path.join(publicPath, 'index.html');

// app.use(express.static(path.join(__dirname, 'dist')));
/* 
if (!fs.existsSync(path.join(publicPath, 'public', 'index.html'))) {
  console.error('❌ public/index.html not found. Did you run `npm run build`?');
  process.exit(1);
}
// app.use(express.static(publicPath));
console.log("📦 Serving static files from /public");
app.use((req, res) => {
  res.sendFile(path.join(publicPath, 'public', 'index.html'));
});

for some reson not working 
app.get('*', (req, res) => {
  res.sendFile(indexPath);
}); 
*/
/*
// Verify S3 bucket when starting server
checkS3Bucket().then(bucketOk => {
  if (!bucketOk) {
    console.error('Failed to verify/create S3 bucket. File uploads will not work.');
  }
});
*/
// =================== Start Server ===================
console.log("🚀 Starting server...");
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
