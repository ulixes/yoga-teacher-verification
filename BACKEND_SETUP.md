# Backend Configuration and Setup

## Environment Variables

The backend requires the following environment variables to be configured:

### Required Variables

```bash
# Reclaim Protocol Credentials
RECLAIM_APP_ID=0x8045C6B32950453C08420f321ACea677A84b62B9
RECLAIM_APP_SECRET=0x0fb80437bc8ce16086a07e4b1fc5606acc450394456ad7ae69b64b6c0096b8cb
RECLAIM_PROVIDER_ID=3ad6946f-88f4-4958-9a8e-5271a831b5b8

# Server Configuration
BASE_URL=http://165.232.147.118
PORT=3001
```

### Configuration Files

#### 1. Environment File: `/opt/yoga-teacher-verification/backend/.env`
```bash
RECLAIM_APP_ID=0x8045C6B32950453C08420f321ACea677A84b62B9
RECLAIM_APP_SECRET=0x0fb80437bc8ce16086a07e4b1fc5606acc450394456ad7ae69b64b6c0096b8cb
RECLAIM_PROVIDER_ID=3ad6946f-88f4-4958-9a8e-5271a831b5b8
BASE_URL=http://165.232.147.118
PORT=3001
```

#### 2. PM2 Ecosystem Config: `/opt/yoga-teacher-verification/backend/ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: 'yoga-backend',
    script: 'server.js',
    cwd: '/opt/yoga-teacher-verification/backend',
    env: {
      NODE_ENV: 'production',
      RECLAIM_APP_ID: '0x8045C6B32950453C08420f321ACea677A84b62B9',
      RECLAIM_APP_SECRET: '0x0fb80437bc8ce16086a07e4b1fc5606acc450394456ad7ae69b64b6c0096b8cb',
      RECLAIM_PROVIDER_ID: '3ad6946f-88f4-4958-9a8e-5271a831b5b8',
      BASE_URL: 'http://165.232.147.118',
      PORT: 3001
    }
  }]
};
```

## PM2 Process Management

### Starting the Backend
```bash
# Start with ecosystem config (recommended)
pm2 start /opt/yoga-teacher-verification/backend/ecosystem.config.js

# Alternative: Start with environment variables
RECLAIM_APP_ID=0x8045C6B32950453C08420f321ACea677A84b62B9 \
RECLAIM_APP_SECRET=0x0fb80437bc8ce16086a07e4b1fc5606acc450394456ad7ae69b64b6c0096b8cb \
RECLAIM_PROVIDER_ID=3ad6946f-88f4-4958-9a8e-5271a831b5b8 \
pm2 start /opt/yoga-teacher-verification/backend/server.js --name yoga-backend
```

### Managing the Process
```bash
# Check status
pm2 list

# View logs
pm2 logs yoga-backend

# Restart
pm2 restart yoga-backend

# Stop
pm2 stop yoga-backend

# Delete
pm2 delete yoga-backend

# Restart with environment update
pm2 restart yoga-backend --update-env
```

### PM2 Process Information
- **Process Name**: `yoga-backend`
- **Script**: `/opt/yoga-teacher-verification/backend/server.js`
- **Working Directory**: `/opt/yoga-teacher-verification/backend`
- **Mode**: `fork` (single instance)
- **Auto Restart**: Enabled

## Dependencies

### Package.json Dependencies
```json
{
  "dependencies": {
    "@reclaimprotocol/js-sdk": "^latest",
    "express": "^4.x.x",
    "cors": "^2.x.x",
    "dotenv": "^17.x.x"
  }
}
```

### Installing Dependencies
```bash
cd /opt/yoga-teacher-verification/backend
npm install
```

## Server Application Structure

### Main Server File: `server.js`

Key features:
- **Express.js** web server
- **CORS** enabled for cross-origin requests
- **JSON and text** body parsing (up to 50mb)
- **Reclaim Protocol SDK** integration
- **In-memory storage** for verified teachers (production should use database)

### API Implementation

#### 1. Generate Config Endpoint
```javascript
app.get('/api/generate-config', async (req, res) => {
  // Initializes ReclaimProofRequest with credentials
  // Sets callback URL to BASE_URL/api/receive-proofs
  // Returns configuration for frontend
});
```

#### 2. Receive Proofs Endpoint
```javascript
app.post('/api/receive-proofs', async (req, res) => {
  // Receives proof from Reclaim Protocol
  // Verifies proof using SDK
  // Stores verification result
});
```

#### 3. Check Verification Endpoint
```javascript
app.get('/api/check-verification/:username', (req, res) => {
  // Checks if username is verified
  // Returns verification status
});
```

#### 4. List Verified Teachers Endpoint
```javascript
app.get('/api/verified-teachers', (req, res) => {
  // Returns list of all verified teachers
  // Useful for health checks
});
```

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env` file exists in `/opt/yoga-teacher-verification/backend/`
   - Use PM2 ecosystem config for reliable environment loading
   - Restart PM2 with `--update-env` flag

2. **Reclaim Credentials Error**
   - Verify credentials are correct in environment files
   - Check that credentials don't contain placeholder values
   - Ensure BASE_URL matches server's public IP

3. **Port Already in Use**
   - Check if another process is using port 3001: `lsof -i :3001`
   - Stop conflicting processes or change PORT in environment

4. **CORS Issues**
   - CORS is enabled for all origins (`*`) in development
   - For production, consider restricting to specific domains

### Health Checks

```bash
# Check if backend is responding
curl http://localhost:3001/api/verified-teachers

# Check if environment is loaded correctly
pm2 logs yoga-backend | grep "Environment loaded"

# Test configuration generation
curl http://localhost:3001/api/generate-config
```

## Security Considerations

1. **Environment Variables**: Sensitive credentials are stored in environment variables
2. **CORS**: Currently allows all origins - restrict in production
3. **HTTPS**: Not configured - should add SSL/TLS for production
4. **Input Validation**: Basic validation on proof processing
5. **Rate Limiting**: Not implemented - consider adding for production