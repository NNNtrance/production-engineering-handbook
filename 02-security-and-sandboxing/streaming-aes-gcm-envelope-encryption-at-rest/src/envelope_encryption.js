// Custom binary framing: WPA1 (4B) + IV (12B) + Auth Tag (16B)
async function encryptFile(inputPath, outputPath, key) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertextPath = outputPath + '.ciphertext';
    try {
        // Stream pipeline holds only 32B in RAM, preventing V8 heap exhaustion
        await pipeline(fsReadStream(inputPath), cipher, fsWriteStream(ciphertextPath, { mode: 0o600 }));
        const authTag = cipher.getAuthTag();
        await fs.writeFile(outputPath, Buffer.concat([Buffer.from('WPA1'), iv, authTag]), { mode: 0o600 });
        await pipeline(fsReadStream(ciphertextPath), fsWriteStream(outputPath, { flags: 'a', mode: 0o600 }));
    } finally {
        await fs.unlink(ciphertextPath).catch(() => {});
    }
}