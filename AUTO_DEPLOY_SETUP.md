# Auto-Deploy Setup Guide

## 1. Install Flask for webhook server
```bash
cd /var/www/proudshop-backend
source .venv/bin/activate
pip install flask
```

## 2. Setup webhook server
```bash
# Make deploy script executable
chmod +x deploy.sh

# Create backups directory
mkdir -p backups

# Test deploy script manually
./deploy.sh

# Edit webhook secret (IMPORTANT!)
nano webhook-server.py
# Change WEBHOOK_SECRET to a random string
```

## 3. Setup systemd service for webhook
```bash
# Copy service file
sudo cp webhook-server.service.example /etc/systemd/system/webhook-server.service

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable webhook-server
sudo systemctl start webhook-server
sudo systemctl status webhook-server
```

## 4. Configure Nginx for webhook endpoint
Add to your nginx config:
```nginx
# Webhook endpoint
location /webhook {
    proxy_pass http://127.0.0.1:9000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## 5. Setup GitHub Webhook
1. Go to your repository on GitHub
2. Settings → Webhooks → Add webhook
3. Payload URL: `https://your-domain.com/webhook`
4. Content type: `application/json`
5. Secret: (same as WEBHOOK_SECRET in webhook-server.py)
6. Events: Just push events
7. Active: ✅

## 6. Test the setup
```bash
# Check webhook server logs
journalctl -u webhook-server -f

# Make a test commit and push
git commit -m "test auto-deploy" --allow-empty
git push origin master

# Watch logs to see deployment
```

## 7. Firewall (if needed)
```bash
sudo ufw allow 9000/tcp
```

## Manual Commands
```bash
# Manual deploy
./deploy.sh

# Restart webhook server
sudo systemctl restart webhook-server

# Check status
sudo systemctl status webhook-server
sudo systemctl status proudshop-backend

# View logs
journalctl -u webhook-server -f
journalctl -u proudshop-backend -f
```

## Security Notes
- Change WEBHOOK_SECRET to a strong random string
- The webhook server runs as root (needed for systemctl restart)
- Consider using a dedicated deploy user instead of root
- Webhook endpoint should be over HTTPS (handled by nginx + certbot)
