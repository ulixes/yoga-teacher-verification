# Yoga Teacher Verification App - Deployment Documentation

## Overview

This document describes the deployment architecture and setup for the Yoga Teacher Verification app on Digital Ocean. The application allows yoga teachers to verify their Instagram accounts using Reclaim Protocol.

## Architecture

```
Internet → nginx (Port 80) → Frontend (Static Files) + Backend API Proxy
                           ↓
                         PM2 → Node.js Backend (Port 3001)
                           ↓
                         Reclaim Protocol SDK
```

### Components

1. **Frontend**: React + TypeScript + Vite application
2. **Backend**: Node.js Express server with Reclaim Protocol integration
3. **Reverse Proxy**: nginx serving static files and proxying API requests
4. **Process Manager**: PM2 for backend process management

## Server Information

- **Public IP**: `165.232.147.118`
- **Domain**: Not configured (using IP directly)
- **SSL**: Not configured (HTTP only)
- **OS**: Ubuntu Linux

## Directory Structure

```
/opt/yoga-teacher-verification/
├── backend/
│   ├── server.js                 # Main backend application
│   ├── ecosystem.config.js       # PM2 configuration
│   ├── .env                     # Environment variables
│   ├── package.json             # Backend dependencies
│   └── package-lock.json
└── frontend/
    ├── dist/                    # Built frontend files (served by nginx)
    │   ├── index.html
    │   ├── assets/
    │   └── vite.svg
    ├── src/                     # Source code
    ├── package.json             # Frontend dependencies
    └── .env.production          # Frontend build environment
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **SDK**: @reclaimprotocol/js-sdk
- **Process Manager**: PM2
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **QR Code**: qrcode.react
- **SDK**: @reclaimprotocol/js-sdk

### Infrastructure
- **Web Server**: nginx
- **Platform**: Digital Ocean Droplet
- **OS**: Ubuntu Linux

## Reclaim Protocol Integration

The app uses Reclaim Protocol to verify Instagram accounts:

1. **Backend generates** proof request configuration
2. **Frontend displays** QR code for mobile verification
3. **Users scan** QR code and complete verification on their phone
4. **Reclaim Protocol** sends proof back to the backend callback URL
5. **Backend validates** the proof and stores verification status

### Credentials Required
- `RECLAIM_APP_ID`: Application ID from Reclaim Protocol
- `RECLAIM_APP_SECRET`: Application secret from Reclaim Protocol  
- `RECLAIM_PROVIDER_ID`: Instagram provider ID from Reclaim Protocol

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-config` | GET | Generate Reclaim proof request configuration |
| `/api/receive-proofs` | POST | Receive and verify proofs from Reclaim |
| `/api/check-verification/:username` | GET | Check if a username is verified |
| `/api/verified-teachers` | GET | Get list of all verified teachers |

## Access URLs

- **Frontend**: http://165.232.147.118/
- **API**: http://165.232.147.118/api/
- **Health Check**: http://165.232.147.118/api/verified-teachers