# Hot Yoga Teacher Instagram Verification

This demo app allows hot yoga teachers to verify their Instagram accounts using Reclaim Protocol.

## Features

- Instagram account verification for yoga teachers
- Beautiful yoga-themed UI with pink gradient design
- QR code generation for mobile verification
- Real-time verification status updates
- Backend validation of proofs

## Setup

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Reclaim Protocol credentials (Application ID, Secret, and Instagram Provider ID)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd yoga-teacher-verification/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Add your Reclaim Protocol credentials to `.env`:
   ```
   RECLAIM_APP_ID=your_application_id
   RECLAIM_APP_SECRET=your_application_secret
   RECLAIM_PROVIDER_ID=your_instagram_provider_id
   ```

5. Start the backend server:
   ```bash
   npm start
   ```

The backend will run on http://localhost:3001

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd yoga-teacher-verification/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file if you need to change the backend URL:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on http://localhost:5173

## Usage

1. Open the frontend app in your browser
2. Click "Verify Instagram Account"
3. Scan the QR code with your phone
4. Complete the verification process on your phone
5. Return to the app to see your verified status

## API Endpoints

- `GET /api/generate-config` - Generate Reclaim proof request configuration
- `POST /api/receive-proofs` - Receive and verify proofs from Reclaim
- `GET /api/check-verification/:username` - Check if a username is verified
- `GET /api/verified-teachers` - Get list of all verified teachers

## Development Notes

- The backend uses Express.js with CORS enabled for development
- The frontend uses Vite + React + TypeScript with SWC for fast builds
- Verified teachers are stored in memory (use a database for production)
- For production deployment, update the BASE_URL in both backend and frontend

## Deployment

For production deployment:

1. Use a proper database instead of in-memory storage
2. Set up environment variables for production
3. Use HTTPS for secure communication
4. Consider using ngrok for local testing with public URLs