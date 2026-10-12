use std::fs;
use std::path::PathBuf;

/// Synchronizes authenticated session credentials from the active Chrome profile
/// into a temporary shadow profile directory without encountering SQLite file-lock errors.
pub fn sync_chrome_profile() -> Result<PathBuf, String> {
    let temp_dir = std::env::temp_dir();
    let target_profile = temp_dir.join("llmconductor-chrome-profile");
    let target_default = target_profile.join("Default");
    let target_network = target_default.join("Network");

    fs::create_dir_all(&target_network).map_err(|e| format!("Failed to create directories: {}", e))?;

    let src_root = if cfg!(target_os = "windows") {
        std::env::var("LOCALAPPDATA")
            .ok()
            .map(|l| PathBuf::from(l).join(r"Google\Chrome\User Data"))
    } else if cfg!(target_os = "macos") {
        std::env::var("HOME")
            .ok()
            .map(|h| PathBuf::from(h).join("Library/Application Support/Google/Chrome"))
    } else {
        std::env::var("HOME")
            .ok()
            .map(|h| PathBuf::from(h).join(".config/google-chrome"))
    }.ok_or_else(|| "Failed to resolve Chrome User Data directory".to_string())?;

    if !src_root.exists() {
        return Err("Chrome profile directory not found".to_string());
    }

    // 1. Copy Local State (contains DPAPI decryption key for Chrome)
    let src_local_state = src_root.join("Local State");
    let dst_local_state = target_profile.join("Local State");
    if src_local_state.exists() {
        let _ = fs::copy(&src_local_state, &dst_local_state);
    }

    // 2. Clone active user session & login data without process kill
    for fname in &["Preferences", "Secure Preferences", "Login Data", "Web Data"] {
        let src_f = src_root.join("Default").join(fname);
        let dst_f = target_default.join(fname);
        if src_f.exists() {
            let _ = fs::copy(&src_f, &dst_f);
        }
    }

    // 3. Copy cookie database
    let src_cookies = src_root.join("Default").join("Network").join("Cookies");
    let dst_cookies = target_network.join("Cookies");
    if src_cookies.exists() {
        let _ = fs::copy(&src_cookies, &dst_cookies);
    }

    Ok(target_profile)
}
