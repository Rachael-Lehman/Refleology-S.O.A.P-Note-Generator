# Project README

## Overview

This project is a full-stack web application that allows users to manage client notes, save and generate PDFs from text content, and optionally save copies to Google Docs. The backend uses Express.js, AWS S3 for file storage, DynamoDB for database management, Google OAuth 2.0 for authentication, and PDFKit for PDF generation. The frontend interacts with the backend via REST API.

---

## Frontend

### Key Features

- **Google Login**: Users authenticate with Google via OAuth 2.0.
- **Client Note Management**: Users can create, edit, and save notes associated with clients.
- **PDF Generation and Download**: Users can save note content as a PDF file, which downloads directly to their machine.
- **Toggle Saving to Google Docs**: Optionally, users can save a copy of the note to their Google Docs account.
- **Fetch & Display Client Notes**: Fetch notes from backend, display for editing, and update accordingly.

### How It Works

- User logs in using Google OAuth; frontend receives authentication tokens.
- Notes are typed or edited on the frontend.
- On save:
  - If "Save to Google Docs" toggle is ON, the note uploads both as a PDF and as a Google Doc.
  - Otherwise, only a PDF is generated and downloaded.
- PDF generation is requested by the frontend via a POST to `/api/generate_pdf` with the note content.
- The backend responds with a PDF file stream, which frontend downloads automatically.
- Other API calls fetch client info, notes list, and handle updates via REST endpoints.

---

## Backend

### Technologies Used

- **Express.js**: Web server framework.
- **AWS SDK for JavaScript (v3)**:
  - **S3**: Store and retrieve note files.
  - **DynamoDB**: Store client metadata and note references.
- **Passport.js** with Google OAuth 2.0 strategy: Handles user authentication.
- **jsonwebtoken (JWT)**: Secure API endpoints with tokens.
- **pdfkit**: Dynamically generate PDF files from text content.
- **cors**: Handle Cross-Origin Resource Sharing for local development.
- **dotenv**: Manage environment variables.

### Main API Endpoints

- `POST /api/generate_pdf`: Accepts text content in the request body, generates a PDF with it, and streams it back for download.
- `POST /upload-note`: Uploads a note to S3, updates DynamoDB client metadata, optionally uploads to Google Docs.
- `GET /api/clients`: Returns a list of clients associated with the authenticated user.
- `GET /api/notes?clientKey=...`: Returns notes for a specific client.
- `POST /api/update_note`: Updates a note’s content on S3.
- Authentication routes for Google OAuth:
  - `/auth/google`
  - `/auth/google/callback`
- `POST /api/logout`: Logs out the user and clears session.

### How It Works

- Users authenticate via Google OAuth; JWT tokens manage API security.
- Notes are saved to S3 as text files; DynamoDB tracks metadata like client info and note file keys.
- PDF generation uses pdfkit and streams the file directly to the client.
- CORS is configured to allow requests from the frontend during development.
- Sessions are managed with express-session.

---

## Setup Instructions

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- AWS account with access keys configured (S3 and DynamoDB)
- Google Cloud Console credentials for OAuth (Client ID & Client Secret)
- Frontend framework of choice (e.g., Svelte, React, Vue)

---

### Backend Setup

1. Clone the repository and navigate to the backend folder (or your project root if combined).

2. Create a `.env` file in the backend folder with the following variables:

   ```dotenv
   PORT=3000
   SESSION_SECRET=your_session_secret_here
   JWT_SECRET=your_jwt_secret_here
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_S3_BucketName=your_s3_bucket_name
   AWS_DynamoDB_TableName=your_dynamodb_table_name
   ```

3. Install backend dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the backend server in development mode (with auto-reload):

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. The backend server will run at `http://localhost:3000` by default.

---

### Frontend Setup

1. Navigate to your frontend folder.

2. Create a `.env` or config file if needed to set API base URL:

   ```
   VITE_API_BASE_URL=http://localhost:3000
   ```

3. Install frontend dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the frontend development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Access the frontend in your browser at `http://localhost:5173` (or the port your frontend uses).

---

## Notes & Recommendations

- CORS is configured to allow `http://localhost:5173` during development; update for production domains.
- The PDF generation endpoint streams PDFs directly without saving on the server.
- Uploaded notes are saved as text files in S3 under user-specific folders.
- DynamoDB stores metadata for clients and their session files, enabling retrieval and updates.
- Google Docs integration is stubbed and should be completed to handle file upload with Google Drive API.
- Sessions are managed via cookies; JWT tokens secure API endpoints.
- Add `.mypy_cache/`, `node_modules/`, `.env` and other sensitive or build-related folders/files to `.gitignore`.
- For production, consider HTTPS, secure cookie flags, and proper OAuth callback URLs.
