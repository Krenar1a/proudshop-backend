# Deploy Backend to a VPS (Ubuntu)

## 1. Server Prep
```bash
# Update & basic tools
sudo apt update && sudo apt upgrade -y
sudo apt install -y git python3 python3-venv python3-pip nginx ufw postgresql postgresql-contrib

# (Optional) fail2ban & htop
sudo apt install -y fail2ban htop
```

## 2. Create DB (Postgres)
```bash
sudo -u postgres psql -c "CREATE DATABASE proudshop;"
sudo -u postgres psql -c "CREATE USER proudshop_user WITH PASSWORD 'STRONGPASS';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE proudshop TO proudshop_user;"
```

## 3. Clone Code
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Krenar1a/proudshop-backend.git
sudo chown -R $USER:www-data proudshop-backend
cd proudshop-backend
```

## 4. Virtualenv & Install
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip wheel
pip install -r requirements.txt
```

## 5. Environment File
Copy `.env.production.example` -> `.env` and edit values:
```
cp .env.production.example .env
nano .env
```
Set:
- SECRET_KEY (gjenero random)
- DATABASE_URL=postgresql+psycopg://proudshop_user:STRONGPASS@localhost:5432/proudshop
- BACKEND_CORS_ORIGINS=["https://your-frontend-domain","http://localhost:3000"]

## 6. Alembic (Optional if using migrations)
```bash
source .venv/bin/activate
alembic upgrade head || echo "No migrations yet"
```

## 7. Systemd Service
Create unit:
```bash
sudo cp proudshop-backend.service.example /etc/systemd/system/proudshop-backend.service
sudo nano /etc/systemd/system/proudshop-backend.service  # adjust paths & user
```
Ensure `ExecStart` points to your run.sh inside venv:
```
ExecStart=/var/www/proudshop-backend/.venv/bin/bash /var/www/proudshop-backend/run.sh
```
Reload & enable:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now proudshop-backend
sudo systemctl status proudshop-backend
```

## 8. Nginx Reverse Proxy
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/proudshop-backend
sudo ln -s /etc/nginx/sites-available/proudshop-backend /etc/nginx/sites-enabled/
```
Test & reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 9. SSL (Let's Encrypt)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com --redirect --email you@example.com --agree-tos --no-eff-email
```

## 10. Firewall (UFW)
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## 11. Logs & Monitoring
```bash
journalctl -u proudshop-backend -f
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 12. Update / Deploy New Version
```bash
cd /var/www/proudshop-backend
sudo -u $USER git pull
source .venv/bin/activate
pip install -r requirements.txt --upgrade
alembic upgrade head || true
sudo systemctl restart proudshop-backend
```

## 13. Health Checks
- http(s)://api.your-domain.com/ -> {"message":"ProudShop API OK"}
- http(s)://api.your-domain.com/health/db -> {"db":"ok"}

## 14. Frontend Env
Set NEXT_PUBLIC_API_URL=https://api.your-domain.com/api/v1 in Vercel.

## 15. Hardening (later)
- Add Fail2ban jail for nginx (protect brute force)
- Use a non-root deploy user
- Rotate SECRET_KEY if compromised
- Add backups for Postgres (pg_dump cron)

## Quick Rollback
Keep previous commit hash; to rollback:
```bash
git checkout <old_commit>
systemctl restart proudshop-backend
```

## Troubleshooting
| Issue | Fix |
|-------|-----|
| ModuleNotFoundError app | Check PYTHONPATH / working dir; service unit WorkingDirectory correct |
| 502 Bad Gateway | Backend service down -> systemctl status |
| DB connection refused | Ensure Postgres running & credentials correct |
| CORS errors | Update BACKEND_CORS_ORIGINS in .env |

---
Generated deployment guide. Adapt domain names & security per production standards.
