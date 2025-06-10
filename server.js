import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import bodyParser from 'body-parser';
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import {
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketCorsCommand
} from '@aws-sdk/client-s3';

dotenv.config();

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// AWS Configuration
console.log('Checking AWS configuration...');

const s3 = new S3Client({
  region: "us-east-1", // or your region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,     // or use IAM role if on ECS
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  }
});
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
  secret: 's3cr3t',
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
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// =================== Auth Routes ===================
console.log("📌 Registering /auth/google route");
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

console.log("📌 Registering /auth/google/callback route");
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173' }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect('http://localhost:5173');
  }
);

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
app.post('/api/logout', (req, res) => {
  req.logout(function (err) {
    if (err) return res.status(500).send('Logout error');
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.sendStatus(200);
    });
  });
});

// =================== S3 Upload & List Endpoints ===================
import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

app.post('/upload-note', async (req, res) => {
  try {
    const { note, clientName, date } = req.body;

    if (!note || !clientName || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating PDF for:', { clientName, date });

    // Create a clean filename (remove special characters and spaces)
    const cleanName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    // Create a folder structure with client name
    const key = `clients/${cleanName}/${date}_${timestamp}.pdf`;

    // Create PDF
    const doc = new PDFDocument();
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));

    // Add content to PDF
    doc.fontSize(16).text('SOAP Note', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(note);
    doc.end();

    // Convert PDF to Buffer
    const pdfBuffer = Buffer.concat(buffers);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: pdfBuffer,
      ContentType: "application/pdf",
      Metadata: {
        'client-name': clientName,
        'date': date
      }
    });

    try {
      await s3.send(command);
      res.json({ message: "Uploaded", key });
    } catch (err) {
      console.error("Upload error:", err);
      console.log("🔐 AWS Access Key:", process.env.AWS_ACCESS_KEY_ID);
      console.log("🔐 AWS Secret Key:", process.env.AWS_SECRET_ACCESS_KEY ? '✅ Present' : '❌ Missing');
      console.log("🪣 Bucket:", process.env.AWS_BUCKET_NAME);
      res.status(500).json({ error: "Upload failed" });
    }
  } catch (err) {
    console.error("Error creating PDF:", err);
    res.status(500).json({ error: "Failed to create PDF" });
  }
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
const distPath = path.join(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('❌ dist/index.html not found. Did you run `npm run build`?');
  process.exit(1);
}

console.log("📦 Serving static files from /dist");
app.use(express.static(distPath));

console.log("🔁 Registering catch-all * route");
app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

// Verify S3 bucket when starting server
checkS3Bucket().then(bucketOk => {
  if (!bucketOk) {
    console.error('Failed to verify/create S3 bucket. File uploads will not work.');
  }
});

// =================== Start Server ===================
console.log("🚀 Starting server...");
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
