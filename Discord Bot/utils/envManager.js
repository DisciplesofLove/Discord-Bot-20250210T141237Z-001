const fs = require('fs');
const path = require('path');
const EnvironmentEncryption = require('./encryption');

class EnvironmentManager {
    constructor() {
        this.encryptor = new EnvironmentEncryption(process.env.MASTER_ENCRYPTION_KEY);
        this.encryptedEnvPath = path.join(process.cwd(), '.env.encrypted');
        this.decryptedValues = new Map();
    }

    async encryptEnvironmentFile() {
        const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
        const envLines = envContent.split('\n');
        const encryptedEnv = {};

        for (const line of envLines) {
            if (line && !line.startsWith('#')) {
                const [key, value] = line.split('=');
                if (key && value) {
                    const trimmedKey = key.trim();
                    const trimmedValue = value.trim();
                    
                    // Don't encrypt non-sensitive values
                    if (!this.shouldEncrypt(trimmedKey)) {
                        encryptedEnv[trimmedKey] = { encrypted: false, value: trimmedValue };
                        continue;
                    }

                    const encrypted = this.encryptor.encrypt(trimmedValue);
                    encryptedEnv[trimmedKey] = {
                        encrypted: true,
                        data: encrypted
                    };
                }
            }
        }

        fs.writeFileSync(
            this.encryptedEnvPath,
            JSON.stringify(encryptedEnv, null, 2)
        );

        // Delete original .env file
        fs.unlinkSync(path.join(process.cwd(), '.env'));
    }

    async loadEncryptedEnvironment() {
        if (!fs.existsSync(this.encryptedEnvPath)) {
            throw new Error('Encrypted environment file not found');
        }

        const encryptedEnv = JSON.parse(
            fs.readFileSync(this.encryptedEnvPath, 'utf8')
        );

        for (const [key, value] of Object.entries(encryptedEnv)) {
            if (value.encrypted) {
                const decrypted = this.encryptor.decrypt(
                    value.data.encrypted,
                    value.data.iv,
                    value.data.authTag,
                    value.data.salt
                );
                this.decryptedValues.set(key, decrypted);
                process.env[key] = decrypted;
            } else {
                process.env[key] = value.value;
            }
        }
    }

    shouldEncrypt(key) {
        const sensitivePatterns = [
            'KEY',
            'SECRET',
            'PASSWORD',
            'TOKEN',
            'PRIVATE',
            'AUTH'
        ];
        
        return sensitivePatterns.some(pattern => 
            key.toUpperCase().includes(pattern)
        );
    }

    getDecryptedValue(key) {
        return this.decryptedValues.get(key) || process.env[key];
    }
}

module.exports = EnvironmentManager;
