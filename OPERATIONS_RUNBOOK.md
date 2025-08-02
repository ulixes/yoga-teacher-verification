# Operations and Maintenance Runbook

## Quick Reference

### Service Status Check
```bash
# Check all services
pm2 list                              # Backend process
sudo systemctl status nginx          # Web server
curl -I http://165.232.147.118/      # Frontend test
curl http://165.232.147.118/api/verified-teachers  # Backend test
```

### Emergency Restart
```bash
# Restart all services
pm2 restart yoga-backend
sudo systemctl restart nginx
```

## Daily Operations

### Health Checks

#### 1. Service Health
```bash
# Check PM2 processes
pm2 list
# Expected: yoga-backend status "online"

# Check nginx status
sudo systemctl status nginx
# Expected: "active (running)"

# Check listening ports
ss -tlnp | grep -E "(80|3001)"
# Expected: nginx on :80, node on :3001
```

#### 2. Application Health
```bash
# Test frontend
curl -I http://165.232.147.118/
# Expected: HTTP/1.1 200 OK

# Test backend API
curl http://165.232.147.118/api/verified-teachers
# Expected: {"teachers":[]}

# Test config generation
curl http://165.232.147.118/api/generate-config | jq .
# Expected: JSON with reclaimProofRequestConfig
```

#### 3. Resource Usage
```bash
# Check disk usage
df -h
# Monitor: Root partition usage

# Check memory usage
free -h
pm2 monit
# Monitor: Backend memory consumption

# Check CPU usage
top -p $(pgrep -f "yoga-backend")
```

### Log Monitoring

#### PM2 Backend Logs
```bash
# View recent logs
pm2 logs yoga-backend --lines 50

# Follow logs in real-time
pm2 logs yoga-backend

# Error logs only
pm2 logs yoga-backend --err
```

#### Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Search for specific errors
sudo grep "error" /var/log/nginx/error.log | tail -10
```

## Maintenance Procedures

### Backend Updates

#### Update Environment Variables
```bash
# 1. Edit environment file
sudo nano /opt/yoga-teacher-verification/backend/.env

# 2. Update PM2 ecosystem config
sudo nano /opt/yoga-teacher-verification/backend/ecosystem.config.js

# 3. Restart with new environment
pm2 restart yoga-backend --update-env

# 4. Verify changes
pm2 logs yoga-backend --lines 5
```

#### Update Backend Code
```bash
# 1. Stop backend
pm2 stop yoga-backend

# 2. Backup current code
cp /opt/yoga-teacher-verification/backend/server.js /opt/yoga-teacher-verification/backend/server.js.backup

# 3. Update dependencies if needed
cd /opt/yoga-teacher-verification/backend
npm install

# 4. Restart backend
pm2 start ecosystem.config.js

# 5. Verify functionality
curl http://165.232.147.118/api/verified-teachers
```

### Frontend Updates

#### Rebuild and Deploy
```bash
# 1. Navigate to frontend source
cd /root/yoga-teacher-verification/frontend

# 2. Update environment if needed
nano .env.production

# 3. Install dependencies
npm install

# 4. Build for production
npm run build

# 5. Deploy to server
cp -r dist/* /opt/yoga-teacher-verification/frontend/dist/

# 6. Verify deployment
curl -I http://165.232.147.118/
```

### Nginx Maintenance

#### Configuration Updates
```bash
# 1. Backup current config
sudo cp /etc/nginx/sites-available/yoga-verification /etc/nginx/sites-available/yoga-verification.backup

# 2. Edit configuration
sudo nano /etc/nginx/sites-available/yoga-verification

# 3. Test configuration
sudo nginx -t

# 4. Reload if test passes
sudo systemctl reload nginx

# 5. Verify changes
curl -I http://165.232.147.118/
```

#### SSL Certificate Setup (Future)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (replace with actual domain)
sudo certbot --nginx -d yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Troubleshooting Guide

### Common Issues

#### 1. Backend Not Responding (502 Bad Gateway)

**Symptoms**: API calls return 502 error
**Diagnosis**:
```bash
pm2 list
pm2 logs yoga-backend --err
ss -tlnp | grep 3001
```

**Solutions**:
```bash
# Restart backend
pm2 restart yoga-backend

# If still failing, check environment
pm2 logs yoga-backend | grep -i "environment\|error"

# Reinstall dependencies if needed
cd /opt/yoga-teacher-verification/backend
npm install
pm2 restart yoga-backend
```

#### 2. Frontend Not Loading (404 or Empty Page)

**Symptoms**: Website returns 404 or blank page
**Diagnosis**:
```bash
ls -la /opt/yoga-teacher-verification/frontend/dist/
curl -I http://165.232.147.118/
sudo tail /var/log/nginx/error.log
```

**Solutions**:
```bash
# Check file permissions
sudo chown -R www-data:www-data /opt/yoga-teacher-verification/frontend/dist/
sudo chmod -R 755 /opt/yoga-teacher-verification/frontend/dist/

# Rebuild frontend if files missing
cd /root/yoga-teacher-verification/frontend
npm run build
cp -r dist/* /opt/yoga-teacher-verification/frontend/dist/
```

#### 3. Environment Variables Not Loading

**Symptoms**: Backend logs show "YOUR_APPLI..." in credentials
**Diagnosis**:
```bash
pm2 logs yoga-backend | grep "Environment loaded"
cat /opt/yoga-teacher-verification/backend/.env
```

**Solutions**:
```bash
# Restart with ecosystem config
pm2 delete yoga-backend
pm2 start /opt/yoga-teacher-verification/backend/ecosystem.config.js

# Verify environment loading
pm2 logs yoga-backend --lines 10
```

#### 4. High Memory Usage

**Symptoms**: Server running slowly, high memory consumption
**Diagnosis**:
```bash
free -h
pm2 monit
ps aux --sort=-%mem | head -10
```

**Solutions**:
```bash
# Restart backend to clear memory leaks
pm2 restart yoga-backend

# If persistent, check for memory leaks in logs
pm2 logs yoga-backend | grep -i "memory\|heap\|out of memory"
```

### Performance Issues

#### 1. Slow API Response Times

**Diagnosis**:
```bash
# Test API response time
time curl http://165.232.147.118/api/generate-config

# Check backend logs for errors
pm2 logs yoga-backend | grep -i "error\|timeout"
```

**Solutions**:
```bash
# Restart backend
pm2 restart yoga-backend

# Check for Reclaim Protocol connectivity
pm2 logs yoga-backend | grep -i "reclaim"
```

#### 2. High CPU Usage

**Diagnosis**:
```bash
top
ps aux --sort=-%cpu | head -10
```

**Solutions**:
```bash
# Restart high-CPU processes
pm2 restart yoga-backend

# Check for infinite loops in logs
pm2 logs yoga-backend --lines 100
```

## Backup and Recovery

### Configuration Backup
```bash
# Create backup directory
mkdir -p /root/backups/$(date +%Y%m%d)

# Backup nginx config
sudo cp /etc/nginx/sites-available/yoga-verification /root/backups/$(date +%Y%m%d)/

# Backup PM2 ecosystem
cp /opt/yoga-teacher-verification/backend/ecosystem.config.js /root/backups/$(date +%Y%m%d)/

# Backup environment files
cp /opt/yoga-teacher-verification/backend/.env /root/backups/$(date +%Y%m%d)/
cp /root/yoga-teacher-verification/frontend/.env.production /root/backups/$(date +%Y%m%d)/
```

### Application Backup
```bash
# Backup source code
tar -czf /root/backups/$(date +%Y%m%d)/yoga-app-source.tar.gz /root/yoga-teacher-verification/

# Backup deployed files
tar -czf /root/backups/$(date +%Y%m%d)/yoga-app-deployed.tar.gz /opt/yoga-teacher-verification/
```

### Recovery Procedure
```bash
# Restore from backup
cd /root/backups/YYYYMMDD/

# Restore nginx config
sudo cp yoga-verification /etc/nginx/sites-available/
sudo nginx -t && sudo systemctl reload nginx

# Restore backend config
cp ecosystem.config.js /opt/yoga-teacher-verification/backend/
cp .env /opt/yoga-teacher-verification/backend/
pm2 restart yoga-backend --update-env

# Restore frontend environment
cp .env.production /root/yoga-teacher-verification/frontend/
```

## Monitoring and Alerts

### Key Metrics to Monitor

1. **Service Availability**
   - PM2 process status
   - Nginx service status
   - HTTP response codes

2. **Performance Metrics**
   - API response times
   - Memory usage
   - CPU usage
   - Disk space

3. **Application Metrics**
   - Verification success rates
   - Error rates in logs
   - User activity patterns

### Simple Monitoring Script
```bash
#!/bin/bash
# Simple health check script
# Save as /root/health-check.sh

echo "=== Health Check $(date) ==="

# Check PM2
echo "PM2 Status:"
pm2 list | grep yoga-backend

# Check Nginx
echo "Nginx Status:"
sudo systemctl is-active nginx

# Check Frontend
echo "Frontend Test:"
curl -s -o /dev/null -w "%{http_code}" http://165.232.147.118/

# Check Backend
echo "Backend Test:"
curl -s -o /dev/null -w "%{http_code}" http://165.232.147.118/api/verified-teachers

echo "=== End Health Check ==="
```

## Contact Information

### Support Escalation
- **Application Issues**: Check logs and restart services
- **Server Issues**: Check system resources and restart services
- **Network Issues**: Check firewall and DNS settings

### Documentation References
- `DEPLOYMENT.md` - Overall architecture
- `BACKEND_SETUP.md` - Backend configuration
- `FRONTEND_DEPLOYMENT.md` - Frontend build process
- `NGINX_SETUP.md` - Web server configuration