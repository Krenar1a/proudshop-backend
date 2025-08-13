#!/usr/bin/env python3
"""
GitHub Webhook Handler for Auto-Deploy
Listens for GitHub push events and triggers deployment

Install: pip install flask
Run: python3 webhook-server.py
"""

from flask import Flask, request, jsonify
import hashlib
import hmac
import subprocess
import os
import threading
import logging

app = Flask(__name__)

# Configuration
WEBHOOK_SECRET = "your-webhook-secret-change-this"  # Change this!
DEPLOY_SCRIPT_PATH = "/var/www/proudshop-backend/deploy.sh"
ALLOWED_BRANCH = "master"

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_signature(payload_body, secret_token, signature_header):
    """Verify GitHub webhook signature"""
    if not signature_header:
        return False
    
    hash_object = hmac.new(
        secret_token.encode('utf-8'), 
        payload_body, 
        hashlib.sha256
    )
    expected_signature = "sha256=" + hash_object.hexdigest()
    
    return hmac.compare_digest(expected_signature, signature_header)

def run_deployment():
    """Run deployment script in background"""
    try:
        logger.info("🚀 Starting deployment process...")
        result = subprocess.run(
            ['bash', DEPLOY_SCRIPT_PATH],
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            logger.info("✅ Deployment completed successfully")
            logger.info(f"Output: {result.stdout}")
        else:
            logger.error("❌ Deployment failed")
            logger.error(f"Error: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Deployment timed out")
    except Exception as e:
        logger.error(f"❌ Deployment error: {e}")

@app.route('/webhook', methods=['POST'])
def github_webhook():
    """Handle GitHub webhook"""
    
    # Verify signature
    signature = request.headers.get('X-Hub-Signature-256')
    if not verify_signature(request.data, WEBHOOK_SECRET, signature):
        logger.warning("⚠️ Invalid webhook signature")
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Parse payload
    payload = request.get_json()
    
    if not payload:
        return jsonify({'error': 'No payload'}), 400
    
    # Check if it's a push event to the right branch
    if payload.get('ref') != f'refs/heads/{ALLOWED_BRANCH}':
        logger.info(f"ℹ️ Ignoring push to {payload.get('ref')}")
        return jsonify({'message': 'Ignored - not target branch'}), 200
    
    # Log the push event
    commits = payload.get('commits', [])
    commit_messages = [commit.get('message', '') for commit in commits]
    logger.info(f"📝 Received push with {len(commits)} commits")
    logger.info(f"📝 Latest commit: {commit_messages[-1] if commit_messages else 'No commits'}")
    
    # Start deployment in background thread
    deployment_thread = threading.Thread(target=run_deployment)
    deployment_thread.start()
    
    return jsonify({
        'message': 'Deployment started',
        'commits': len(commits),
        'branch': ALLOWED_BRANCH
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'webhook-server'}), 200

@app.route('/', methods=['GET'])
def index():
    """Simple index page"""
    return '''
    <h1>ProudShop Auto-Deploy Webhook</h1>
    <p>✅ Webhook server is running</p>
    <p>🔗 Listening for GitHub webhooks on /webhook</p>
    <p>🏥 Health check: <a href="/health">/health</a></p>
    '''

if __name__ == '__main__':
    # Create backups directory if it doesn't exist
    os.makedirs('/var/www/proudshop-backend/backups', exist_ok=True)
    
    logger.info("🎯 Starting webhook server...")
    logger.info(f"📁 Deploy script: {DEPLOY_SCRIPT_PATH}")
    logger.info(f"🌿 Target branch: {ALLOWED_BRANCH}")
    
    # Run on all interfaces, port 9000
    app.run(host='0.0.0.0', port=9000, debug=False)
