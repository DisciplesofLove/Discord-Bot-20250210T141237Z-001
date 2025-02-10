// scripts/security/rotate-keys.js
const { EnvironmentManager } = require('../../utils/envManager');
const crypto = require('crypto');

async function rotateEncryptionKeys() {
    const envManager = new EnvironmentManager();
    
    // Generate new master key
    const newMasterKey = crypto.randomBytes(32).toString('hex');
    
    try {
        // Re-encrypt environment with new key
        await envManager.rotateEncryption(newMasterKey);
        console.log("✅ Encryption keys rotated successfully");
    } catch (error) {
        console.error("❌ Key rotation failed:", error);
        process.exit(1);
    }
}

rotateEncryptionKeys()
    .then(() => process.exit(0))
    .catch(console.error);
