import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import bodyParser from 'body-parser';
import { getClients, uploadClientDocument, getNotes, updateNote, DeleteAccount } from './handleDataBase.js'

dotenv.config();

const logOut = (req, res) => {
  req.logout(function (err) {
    if (err) return res.status(500).send('Logout error');
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.sendStatus(200);
    });
  });
};

const uploadToGoogle = async () => {
  console.log('uploading to google');  // will be handled later 
  return true;
};

// Initialize Express app
const app = express();
app.use(bodyParser.json());

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

console.log("🛠️ Setting up CORS");
app.use(cors({
  origin: process.env.FrontEnd_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


console.log("🛠️ Initializing Passport");
app.use(passport.initialize());
app.use(passport.session());

// =================== Passport Strategy ===================
console.log("🔐 Configuring Google OAuth strategy");
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback' // update for production
}, (accessToken, refreshToken, profile, done) => {
  console.log('here')
  const token = jwt.sign(
    { userId: profile.id, name: profile.displayName, email: profile.emails[0].value },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  return done(null, {
    token,
    name: profile.displayName,
    userId: profile.id,
    accessToken
  });
}));

passport.use('google-delete', new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/delete/callback'
}, (accessToken, refreshToken, profile, done) => {
  const token = jwt.sign(
    { userId: profile.id, name: profile.displayName, email: profile.emails[0].value },
    process.env.JWT_SECRET,
    { expiresIn: '5m' }
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
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'consent',   // forces consent screen every time
  accessType: 'offline'  // (optional) useful if you want refresh tokens
}));

console.log("📌 Registering /auth/google/callback route");
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FrontEnd_URL }),
  async (req, res) => {
    // Redirect to frontend after successful login
    console.log('user: ', req.user.userId)
    res.redirect(process.env.FrontEnd_URL);
  }
);

app.get('/auth/google/delete',
  passport.authenticate('google-delete', {
    scope: ['profile', 'email'],
    prompt: 'consent',   // forces consent screen every time
    accessType: 'offline'  // (optional) useful if you want refresh tokens
  })
);

app.get('/auth/google/delete/callback',
  passport.authenticate('google-delete', { failureRedirect: process.env.FrontEnd_URL }),
  async (req, res) => {
    try {
      if (!req.user.userId) {
        return res.status(401).json({ error: "Not authenticated or missing clientKey" });
      }
      const result = await DeleteAccount(req.user.userId);
      if (result) {
        req.logout(function (err) {
          if (err) {
            console.error(err);
            return res.redirect(`${process.env.FrontEnd_URL}?logout_error=true`);
          }
          req.session.destroy(() => {
            res.clearCookie('connect.sid', { path: '/' });
            res.redirect(`${process.env.FrontEnd_URL}?delete_success=true`);
          });
        });
      }
    } catch (err) {
      console.error(err);
      res.redirect(`${process.env.FrontEnd_URL}?delete_failed=true`);
    }
  }
);



// =================== API Routes ===================
app.get('/api/user', (req, res) => {
  res.json(req.user || null);
});

app.get('/api/clients', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  const clients = await getClients(req.user.userId);
  console.log(clients)
  res.json(clients);
});

app.get('/api/notes', async (req, res) => {
  const clientKey = req.query.clientKey;
  if (!req.user || !clientKey) {
    return res.status(401).json({ error: "Not authenticated or missing clientKey" });
  }
  try {
    const { clientInfo, files } = await getNotes(req.user.userId, clientKey);
    console.log({ clientInfo, files });
    res.json({ clientInfo, files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post('/upload-note', async (req, res) => {
  console.log(req.body);
  const result = await uploadClientDocument(req.user.userId, req.body);
  let uploadGoogleDoc = false;
  if (result && req.body.googleDocsEnabled) {
    uploadGoogleDoc = await uploadToGoogle();
  }
  res.json({ success: result, uploadGoogleDoc });
});

app.post('/api/update_note', async (req, res) => {
  const { s3Key, content, googleDocsEnabled } = req.body;
  if (!req.user || !s3Key || !content) {
    return res.status(401).json({ error: "Not authenticated or missing clientKey" });
  }
  try {
    const result = await updateNote(req.user.userId, s3Key, content);
    let uploadGoogleDoc = false;
    if (result && googleDocsEnabled) {
      uploadGoogleDoc = await uploadToGoogle();
    }
    res.json({ success: result, uploadGoogleDoc });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

app.post('/api/generate_pdf', (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content." });
  }

  // Create a new PDF document
  const doc = new PDFDocument();

  // We’ll use a PassThrough stream to send PDF directly to client
  const passthroughStream = new PassThrough();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="note.pdf"');

  // Pipe the PDF document into the passthrough stream
  doc.pipe(passthroughStream);
  passthroughStream.pipe(res);

  // Add the text
  doc.fontSize(12).text(content, {
    align: 'left',
    lineGap: 5
  });

  // Finalize PDF file
  doc.end();
});

app.post('/api/logout/', logOut);


// Add a debug route to check session
app.get('/debug-session', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  res.json({ session: req.session, user: req.user });
});



// =================== Start Server ===================
console.log("🚀 Starting server...");
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
