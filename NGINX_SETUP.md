# Nginx Configuration and Reverse Proxy Setup

## Overview

Nginx serves as both a static file server for the frontend and a reverse proxy for backend API requests. This setup provides a single entry point for the entire application.

## Nginx Architecture

```
Internet (Port 80) → nginx → Frontend Static Files (/)
                          → Backend API Proxy (/api/)
```

## Configuration Files

### Site Configuration: `/etc/nginx/sites-available/yoga-verification`

```nginx
server {
    listen 80;
    server_name _;

    # Frontend - serve static files
    location / {
        root /opt/yoga-teacher-verification/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Symlink: `/etc/nginx/sites-enabled/yoga-verification`
```bash
# Symbolic link to enable the site
lrwxrwxrwx 1 root root 44 Aug  2 16:52 yoga-verification -> /etc/nginx/sites-available/yoga-verification
```

## Directory Structure

```
/etc/nginx/
├── nginx.conf                           # Main nginx configuration
├── sites-available/
│   ├── default                          # Default nginx site
│   └── yoga-verification                # Yoga app configuration
└── sites-enabled/
    └── yoga-verification                # Symlink to active site

/opt/yoga-teacher-verification/frontend/dist/
├── index.html                           # Main HTML file served by nginx
├── assets/
│   ├── index-[hash].js                  # JavaScript files
│   └── index-[hash].css                 # CSS files
└── vite.svg                             # Static assets
```

## Nginx Configuration Explained

### Frontend Static File Serving

```nginx
location / {
    root /opt/yoga-teacher-verification/frontend/dist;
    try_files $uri $uri/ /index.html;
    index index.html;
}
```

**Purpose**: Serves the React application and static assets
- **`root`**: Points to the built frontend files
- **`try_files`**: Implements SPA routing (fallback to index.html)
- **`index`**: Default file to serve for directory requests

### Backend API Reverse Proxy

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

**Purpose**: Proxies API requests to the Node.js backend
- **`proxy_pass`**: Forwards requests to backend server
- **Headers**: Preserve client information and enable WebSocket support
- **`proxy_cache_bypass`**: Ensures real-time data for upgrades

## Setup and Installation

### 1. Install Nginx
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Verify installation
nginx -v
```

### 2. Create Site Configuration
```bash
# Create configuration file
sudo nano /etc/nginx/sites-available/yoga-verification

# Add the configuration content (see above)
```

### 3. Enable the Site
```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/yoga-verification /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 4. Start and Enable Nginx
```bash
# Start nginx service
sudo systemctl start nginx

# Enable auto-start on boot
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

## Request Flow

### Frontend Requests (Static Files)
1. Client requests `http://165.232.147.118/`
2. Nginx serves `/opt/yoga-teacher-verification/frontend/dist/index.html`
3. Browser loads JavaScript and CSS assets
4. React application initializes

### API Requests (Backend Proxy)
1. Frontend makes request to `http://165.232.147.118/api/generate-config`
2. Nginx proxy forwards to `http://localhost:3001/api/generate-config`
3. Backend processes request and returns response
4. Nginx forwards response back to frontend

### SPA Routing
1. Client navigates to any frontend route (e.g., `/verification`)
2. Nginx `try_files` directive checks for file
3. Falls back to `/index.html` for SPA routing
4. React Router handles client-side routing

## Nginx Management

### Service Management
```bash
# Start nginx
sudo systemctl start nginx

# Stop nginx
sudo systemctl stop nginx

# Restart nginx
sudo systemctl restart nginx

# Reload configuration (no downtime)
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

### Configuration Testing
```bash
# Test configuration syntax
sudo nginx -t

# Test and reload if successful
sudo nginx -t && sudo systemctl reload nginx
```

### Log Management
```bash
# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log

# View yoga-verification specific logs (if configured)
sudo tail -f /var/log/nginx/yoga-verification.access.log
```

## Security Configuration

### Basic Security Headers (Recommended Addition)
```nginx
server {
    listen 80;
    server_name _;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend - serve static files
    location / {
        root /opt/yoga-teacher-verification/frontend/dist;
        try_files $uri $uri/ /index.html;
        index index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # API rate limiting
        limit_req zone=api burst=10 nodelay;
    }
}
```

## Troubleshooting

### Common Issues

1. **403 Forbidden**
   ```bash
   # Check file permissions
   ls -la /opt/yoga-teacher-verification/frontend/dist/
   
   # Fix permissions if needed
   sudo chown -R www-data:www-data /opt/yoga-teacher-verification/frontend/dist/
   sudo chmod -R 755 /opt/yoga-teacher-verification/frontend/dist/
   ```

2. **502 Bad Gateway**
   ```bash
   # Check if backend is running
   pm2 list
   
   # Check backend port
   ss -tlnp | grep 3001
   
   # Check nginx error logs
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Configuration Errors**
   ```bash
   # Test nginx configuration
   sudo nginx -t
   
   # Check syntax errors in config file
   sudo nano /etc/nginx/sites-available/yoga-verification
   ```

4. **Static Files Not Loading**
   ```bash
   # Verify file existence
   ls -la /opt/yoga-teacher-verification/frontend/dist/
   
   # Check nginx access logs
   sudo tail -f /var/log/nginx/access.log
   
   # Test direct file access
   curl -I http://165.232.147.118/index.html
   ```

### Debug Commands

```bash
# Test frontend serving
curl -I http://165.232.147.118/

# Test API proxy
curl -I http://165.232.147.118/api/verified-teachers

# Check nginx processes
ps aux | grep nginx

# Verify nginx configuration
sudo nginx -T

# Check listening ports
ss -tlnp | grep :80
```

## Performance Optimization

### Recommended Additions

1. **Gzip Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml;
   ```

2. **Static Asset Caching**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

3. **Rate Limiting**
   ```nginx
   http {
       limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
   }
   ```

## SSL/HTTPS Setup (Future)

For production deployment, consider adding SSL:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```