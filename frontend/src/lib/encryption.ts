import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-key-change-in-production'
const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Encryption error:', error)
    // Fallback to simple encryption
    return simpleEncrypt(text)
  }
}

export function decrypt(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      // Try simple decryption
      return simpleDecrypt(encryptedData)
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Fallback to simple decryption
    return simpleDecrypt(encryptedData)
  }
}

// Simple encryption using AES-256-CBC (more compatible)
export function simpleEncrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    return iv.toString('hex') + ':' + encrypted
  } catch (error) {
    console.error('Simple encryption error:', error)
    return Buffer.from(text).toString('base64') // Fallback to base64
  }
}

export function simpleDecrypt(encryptedData: string): string {
  try {
    // Check if it's in the new format with IV
    const parts = encryptedData.split(':')
    if (parts.length === 2) {
      const iv = Buffer.from(parts[0], 'hex')
      const encrypted = parts[1]
      const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      return decrypted
    } else {
      // Try old format fallback
      return simpleFallbackDecrypt(encryptedData)
    }
  } catch (error) {
    console.error('Simple decryption error:', error)
    return simpleFallbackDecrypt(encryptedData)
  }
}

function simpleFallbackDecrypt(encryptedData: string): string {
  try {
    return Buffer.from(encryptedData, 'base64').toString('utf8') // Fallback from base64
  } catch {
    return encryptedData // Return as-is if all fails
  }
}
