#!/bin/bash
# Auto-deploy script for ProudShop backend
# This script pulls latest changes and restarts the service
# Location: /var/www/proudshop-backend/deploy.sh

set -e

echo "🚀 Starting auto-deployment..."

# Navigate to project directory
cd /var/www/proudshop-backend

# Store current commit for rollback
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "📝 Current commit: $CURRENT_COMMIT"

# Backup database before deploy (optional)
echo "💾 Creating database backup..."
pg_dump -h localhost -U proudshop1 -d proudshop > "backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql" 2>/dev/null || echo "⚠️  Backup failed (continuing anyway)"

# Pull latest changes
echo "📥 Pulling latest changes..."
git fetch origin
git reset --hard origin/master

# Activate virtual environment
source .venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt --quiet

# Run database migrations
echo "🔄 Running database migrations..."
alembic upgrade head

# Restart the service
echo "🔄 Restarting backend service..."
sudo systemctl restart proudshop-backend

# Wait a moment for service to start
sleep 3

# Check if service is running
if systemctl is-active --quiet proudshop-backend; then
    echo "✅ Deployment successful!"
    echo "🌐 Service is running on: http://localhost:8000"
    
    # Test health endpoints
    echo "🏥 Testing health endpoints..."
    curl -s http://localhost:8000/health > /dev/null && echo "✅ Health check passed" || echo "❌ Health check failed"
    curl -s http://localhost:8000/health/db > /dev/null && echo "✅ Database check passed" || echo "❌ Database check failed"
    
else
    echo "❌ Deployment failed! Service is not running."
    echo "📋 Service status:"
    systemctl status proudshop-backend --no-pager
    
    echo "🔄 Rolling back to previous commit..."
    git reset --hard $CURRENT_COMMIT
    sudo systemctl restart proudshop-backend
    
    exit 1
fi

echo "🎉 Auto-deployment completed successfully!"

# Log deployment
echo "$(date): Deployed commit $(git rev-parse HEAD)" >> deploy.log
