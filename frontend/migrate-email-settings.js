// Migration script to update old email settings to new format
// Run this in the browser console on the admin settings page

async function migrateEmailSettings() {
  const adminToken = localStorage.getItem('adminToken')
  
  if (!adminToken) {
    console.error('No admin token found')
    return
  }

  // Mapping of old settings to new settings
  const migrations = [
    {
      oldKey: 'EMAIL_HOST',
      newKey: 'smtp_host',
      category: 'email',
      description: 'SMTP Server Host (p.sh. smtp.gmail.com)'
    },
    {
      oldKey: 'EMAIL_USER', 
      newKey: 'smtp_user',
      category: 'email',
      description: 'SMTP Username/Email'
    },
    {
      oldKey: 'EMAIL_PASSWORD',
      newKey: 'smtp_password', 
      category: 'email',
      description: 'SMTP Password ose App Password'
    },
    {
      oldKey: 'EMAIL_FROM',
      newKey: 'email_from',
      category: 'email', 
      description: 'Email-i dërgues (From address)'
    }
  ]

  // Add new settings that don't exist
  const newSettings = [
    {
      key: 'smtp_port',
      value: '587',
      category: 'email',
      description: 'SMTP Port (587 për TLS, 465 për SSL)'
    },
    {
      key: 'smtp_secure',
      value: 'false',
      category: 'email', 
      description: 'SMTP Security (true për SSL, false për TLS)'
    },
    {
      key: 'email_from_name',
      value: 'ProudShop',
      category: 'email',
      description: 'Emri i dërguesit (p.sh. ProudShop Support)'
    }
  ]

  console.log('Starting email settings migration...')

  try {
    // Get current settings
    const response = await fetch('/api/admin/settings', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    })
    
    const data = await response.json()
    const currentSettings = data.settings || []
    
    console.log('Current settings:', currentSettings.length)

    // Migrate old settings to new format
    for (const migration of migrations) {
      const oldSetting = currentSettings.find(s => s.key === migration.oldKey)
      const newSettingExists = currentSettings.find(s => s.key === migration.newKey)
      
      if (oldSetting && !newSettingExists) {
        console.log(`Migrating ${migration.oldKey} -> ${migration.newKey}`)
        
        // Create new setting
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            key: migration.newKey,
            value: oldSetting.value,
            category: migration.category,
            description: migration.description
          })
        })
        
        // Delete old setting
        await fetch('/api/admin/settings', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({
            key: migration.oldKey
          })
        })
      }
    }

    // Add new settings
    for (const newSetting of newSettings) {
      const exists = currentSettings.find(s => s.key === newSetting.key)
      
      if (!exists) {
        console.log(`Adding new setting: ${newSetting.key}`)
        
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify(newSetting)
        })
      }
    }

    console.log('Migration completed successfully!')
    
    // Refresh the page to see changes
    window.location.reload()
    
  } catch (error) {
    console.error('Migration failed:', error)
  }
}

// Run migration
migrateEmailSettings()
