# Frontend Build and Deployment Process

## Overview

The frontend is a React + TypeScript application built with Vite that provides the user interface for Instagram verification using Reclaim Protocol.

## Source Code Structure

```
/root/yoga-teacher-verification/frontend/
├── src/
│   ├── components/
│   │   └── InstagramVerification.tsx    # Main verification component
│   ├── App.tsx                          # Root component
│   ├── App.css                          # Global styles
│   ├── main.tsx                         # Application entry point
│   └── index.css                        # Base styles
├── public/
│   └── vite.svg                         # Static assets
├── package.json                         # Dependencies and scripts
├── vite.config.ts                       # Vite build configuration
├── tsconfig.json                        # TypeScript configuration
└── .env.production                      # Production environment variables
```

## Environment Configuration

### Production Environment File: `.env.production`
```bash
VITE_API_URL=http://165.232.147.118
```

### Environment Variable Usage
```typescript
// In InstagramVerification.tsx
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
```

## Dependencies

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.x.x",
    "react-dom": "^18.x.x",
    "@reclaimprotocol/js-sdk": "^latest",
    "qrcode.react": "^latest"
  },
  "devDependencies": {
    "@types/react": "^18.x.x",
    "@types/react-dom": "^18.x.x",
    "@vitejs/plugin-react-swc": "^3.x.x",
    "typescript": "^5.x.x",
    "vite": "^7.x.x"
  }
}
```

## Build Process

### 1. Install Dependencies
```bash
cd /root/yoga-teacher-verification/frontend
npm install
```

### 2. Build for Production
```bash
# Builds using .env.production environment
npm run build
```

### 3. Build Output
The build creates optimized files in the `dist/` directory:
```
dist/
├── index.html                           # Main HTML file
├── assets/
│   ├── index-[hash].js                  # Bundled JavaScript
│   └── index-[hash].css                 # Bundled CSS
└── vite.svg                             # Static assets
```

### 4. Deploy to Server
```bash
# Copy built files to nginx serve directory
cp -r /root/yoga-teacher-verification/frontend/dist/* /opt/yoga-teacher-verification/frontend/dist/
```

## Component Architecture

### Main Component: InstagramVerification.tsx

#### Key Features:
1. **QR Code Generation**: Uses `qrcode.react` to display verification QR codes
2. **Reclaim SDK Integration**: Handles proof request generation and verification
3. **State Management**: Manages verification flow states
4. **Error Handling**: Displays user-friendly error messages

#### State Flow:
```
Initial → Loading → QR Display → Verification → Success/Error
```

#### API Integration:
```typescript
// Fetch configuration from backend
const response = await fetch(`${BASE_URL}/api/generate-config`);

// Initialize Reclaim SDK
const reclaimProofRequest = await ReclaimProofRequest.fromJsonString(config);

// Generate QR code URL
const url = await reclaimProofRequest.getRequestUrl();

// Handle verification completion
await reclaimProofRequest.startSession({
  onSuccess: (proofs) => { /* Handle success */ },
  onError: (error) => { /* Handle error */ }
});
```

## Styling

### CSS Architecture:
- **Global Styles**: `index.css` - Base styles and CSS variables
- **Component Styles**: `App.css` - Component-specific styles
- **Design Theme**: Pink gradient yoga-themed design

### Key CSS Features:
- Responsive design for mobile and desktop
- Gradient backgrounds and modern UI elements
- QR code styling and animations
- Error and success state styling

## TypeScript Configuration

### Import Configuration
```typescript
// Type-only imports for Reclaim SDK
import { ReclaimProofRequest, type Proof } from '@reclaimprotocol/js-sdk';
```

### Type Safety Features:
- Strict TypeScript configuration
- Type-safe prop handling
- Error boundary implementation
- SDK type integration

## Build Optimization

### Vite Configuration Features:
- **Hot Module Replacement (HMR)** for development
- **Tree Shaking** for smaller bundles
- **Code Splitting** for optimal loading
- **Asset Optimization** for images and static files

### Bundle Analysis:
```bash
# Current build output
dist/assets/index-C1gXSokr.js   758.08 kB │ gzip: 248.46 kB
dist/assets/index-S03Q4R9M.css    2.83 kB │ gzip:   1.03 kB
```

## Development vs Production

### Development Mode:
```bash
cd /root/yoga-teacher-verification/frontend
npm run dev
# Runs on http://localhost:5173
# Uses hot reload and development optimizations
```

### Production Mode:
```bash
npm run build
# Creates optimized bundle in dist/
# Uses production environment variables
# Minifies and optimizes all assets
```

## Deployment Steps

### Complete Frontend Deployment Process:

1. **Navigate to frontend directory**
   ```bash
   cd /root/yoga-teacher-verification/frontend
   ```

2. **Install dependencies** (if not already installed)
   ```bash
   npm install
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Deploy to server**
   ```bash
   cp -r dist/* /opt/yoga-teacher-verification/frontend/dist/
   ```

5. **Verify deployment**
   ```bash
   curl -I http://165.232.147.118/
   ```

## Troubleshooting

### Common Issues:

1. **Build Fails with TypeScript Errors**
   - Check import statements use `type` keyword for type-only imports
   - Verify all dependencies are installed
   - Check TypeScript configuration

2. **API Calls Fail**
   - Verify `VITE_API_URL` in `.env.production`
   - Ensure backend is running and accessible
   - Check CORS configuration

3. **QR Code Not Displaying**
   - Verify `qrcode.react` dependency is installed
   - Check console for JavaScript errors
   - Ensure Reclaim SDK is properly initialized

4. **Static Assets Not Loading**
   - Verify nginx configuration serves static files correctly
   - Check file permissions in deployment directory
   - Ensure build process completed successfully

### Debug Commands:

```bash
# Check if frontend files exist
ls -la /opt/yoga-teacher-verification/frontend/dist/

# Verify API URL in built JavaScript
grep -o "165\.232\.147\.118" /opt/yoga-teacher-verification/frontend/dist/assets/index-*.js

# Test frontend accessibility
curl -I http://165.232.147.118/

# Check JavaScript console for errors (in browser)
# Open browser dev tools → Console tab
```

## Security Considerations

1. **Environment Variables**: Only `VITE_` prefixed variables are exposed to browser
2. **API Endpoints**: All API calls go through nginx proxy
3. **Content Security**: Consider adding CSP headers for production
4. **HTTPS**: Should implement SSL/TLS for production deployment