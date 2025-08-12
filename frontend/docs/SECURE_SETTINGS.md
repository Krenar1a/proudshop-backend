# Secure API Settings System

## Overview

The application now uses a secure database-based configuration system instead of environment variables for storing sensitive API keys and settings. All sensitive data is encrypted using AES-256-GCM encryption before being stored in the database.

## Features

- **Encrypted Storage**: All sensitive values are encrypted before being stored in the database
- **Category Organization**: Settings are organized by categories (facebook, ai, payment, email, general)
- **Admin Interface**: Web-based interface for managing all settings
- **Audit Trail**: Track when settings were created and last updated
- **Secure Access**: Only authenticated admins can view and modify settings

## How to Use

### 1. Initial Setup

After setting up the database, run the initialization script to create default settings:

```bash
npm run init:settings
```

This creates empty placeholder settings for all supported integrations.

### 2. Configure API Keys

1. Navigate to Admin Dashboard → API Settings
2. Select a category (Facebook, AI, Payment, Email, General)
3. Click "Edit" on any setting to modify its value
4. Enter your API keys/configuration values
5. Click "Save" to store the encrypted values

### 3. Supported Settings

#### Facebook API
- `FACEBOOK_ACCESS_TOKEN`: Facebook Graph API access token
- `FACEBOOK_AD_ACCOUNT_ID`: Your Facebook Ad Account ID
- `FACEBOOK_APP_ID`: Facebook App ID
- `FACEBOOK_APP_SECRET`: Facebook App Secret

#### AI Integration
- `OPENAI_API_KEY`: OpenAI API key for AI features

#### Payment Processing
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

#### Email Configuration
- `EMAIL_HOST`: SMTP host
- `EMAIL_PORT`: SMTP port (default: 587)
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: From email address

#### General Settings
- `SITE_NAME`: Application name
- `SITE_URL`: Base URL of the application
- `ADMIN_EMAIL`: Administrator email

## Security

### Encryption
- Uses AES-256-GCM encryption with authentication
- Generates unique IV for each value
- Includes authentication tag for integrity verification
- Falls back to Base64 encoding if encryption fails

### Access Control
- Only authenticated administrators can access settings
- JWT token verification required for all API endpoints
- Settings are never exposed in plain text in API responses

### Best Practices
- Change the `ENCRYPTION_KEY` environment variable in production
- Use a strong, unique encryption key (32+ characters)
- Regularly rotate API keys and update them in the settings
- Monitor access logs for unauthorized access attempts

## API Usage

### Getting Settings in Code

```typescript
import AdminSettings from '@/lib/admin-settings'

// Get Facebook configuration
const facebookConfig = await AdminSettings.getFacebookConfig()
const { accessToken, adAccountId } = facebookConfig

// Get specific setting
const openaiKey = await AdminSettings.getSetting('OPENAI_API_KEY')

// Set a setting programmatically
await AdminSettings.setSetting('SITE_NAME', 'My Store', 'general')
```

### API Endpoints

- `GET /api/admin/settings?category=facebook` - Get settings by category
- `POST /api/admin/settings` - Create new setting
- `PUT /api/admin/settings` - Update existing setting
- `DELETE /api/admin/settings?key=SETTING_KEY` - Delete setting

## Migration from Environment Variables

If you're migrating from environment variables:

1. Copy your current `.env` values
2. Add them through the admin interface
3. Remove them from your `.env` file
4. Verify all integrations are working

## Troubleshooting

### Common Issues

1. **Settings not found**: Run `npm run init:settings` to create default settings
2. **Encryption errors**: Check that `ENCRYPTION_KEY` is set in environment
3. **API not working**: Verify the correct API keys are set in admin settings
4. **Access denied**: Ensure you're logged in as an admin

### Debug Mode

To check current settings (for debugging):

```typescript
const settings = await AdminSettings.getAllSettings()
console.log(settings) // Values will be encrypted
```

## Database Schema

```sql
model AdminSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   // Encrypted value
  category    String   @default("general")
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```
