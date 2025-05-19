import express from 'express';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:');
  console.error(err.stack || err);
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

// =================== API Routes ===================
console.log("📌 Registering /api/user route");
app.get('/api/user', (req, res) => {
  res.json(req.user || null);
});

console.log("📌 Registering /api/logout route");
app.post('/api/logout', (req, res) => {
  req.logout(function(err) {
    if (err) return res.status(500).send('Logout error');
    req.session.destroy(() => {
      res.clearCookie('connect.sid', { path: '/' });
      res.sendStatus(200);
    });
  });
});

// =================== Static File Handling ===================
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

// =================== Start Server ===================
console.log("🚀 Starting server...");
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
