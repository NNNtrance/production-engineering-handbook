// 1. Bitmask POSIX file type inspection before extraction
const unixType = (entry.externalFileAttributes >>> 16) & 0o170000;
if (!safeEntryName(entry.fileName)) throw new AppError('Unsafe path.', 'ZIP_SLIP_DETECTED');
if (unixType === 0o120000) throw new AppError('Symlinks rejected.', 'ZIP_SYMLINK_DETECTED');

// 2. Prevent case-collision attacks on case-insensitive filesystems
const folded = normalized.toLocaleLowerCase('en-US');
if (names.has(folded)) throw new AppError('Path collision.', 'ZIP_PATH_COLLISION');
names.add(folded);

// 3. Exclusive file creation with user-only permissions (O_CREAT | O_EXCL)
const output = fs.createWriteStream(absolute, { flags: 'wx', mode: 0o600 });

// 4. In-flight stream data listener destroys stream if headers lied
stream.on('data', (chunk) => {
    written += chunk.length;
    total += chunk.length;
    if (written > maxFileBytes || total > maxUncompressedBytes) {
        stream.destroy(new AppError('Quota exceeded.', 'ZIP_BOMB_DETECTED'));
    }
});