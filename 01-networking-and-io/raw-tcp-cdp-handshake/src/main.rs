use std::io::{Read, Write};
use std::net::TcpStream;
use std::time::{Duration, Instant};

/// Queries the Chrome DevTools Protocol target registry (/json) directly
/// over a raw TCP socket, bypassing Chromium Private Network Access (PNA)
/// and CORS security boundaries without pulling in external HTTP client crates.
pub fn fetch_cdp_targets_raw(addr_str: &str, timeout_ms: u64) -> Result<(String, Duration), String> {
    let start_time = Instant::now();

    let addr = addr_str
        .parse()
        .map_err(|e: std::net::AddrParseError| format!("Invalid address: {}", e))?;

    let mut stream = TcpStream::connect_timeout(&addr, Duration::from_millis(timeout_ms))
        .map_err(|e| format!("CDP endpoint {} unreachable: {}", addr_str, e))?;

    stream
        .set_read_timeout(Some(Duration::from_millis(timeout_ms)))
        .map_err(|e| e.to_string())?;

    // Handcrafted HTTP/1.1 request (zero allocations beyond the payload)
    let req = format!(
        "GET /json HTTP/1.1\r\nHost: {}\r\nConnection: close\r\n\r\n",
        addr_str
    );
    stream.write_all(req.as_bytes()).map_err(|e| e.to_string())?;

    let mut response = Vec::with_capacity(8192);
    let mut buf = [0u8; 4096];

    // Read loop with Content-Length framing detection to avoid socket EOF delay
    for _ in 0..30 {
        match stream.read(&mut buf) {
            Ok(0) => break,
            Ok(n) => {
                response.extend_from_slice(&buf[..n]);
                let resp_str = String::from_utf8_lossy(&response);

                if let Some(pos) = resp_str.find("\r\n\r\n") {
                    let headers = &resp_str[..pos];
                    let body = &resp_str[pos + 4..];

                    // Early exit when the announced Content-Length is satisfied
                    if let Some(cl_idx) = headers.to_lowercase().find("content-length:") {
                        let after = &headers[cl_idx + 15..];
                        if let Some(end_line) = after.find("\r\n") {
                            if let Ok(expected_len) = after[..end_line].trim().parse::<usize>() {
                                if body.as_bytes().len() >= expected_len {
                                    let duration = start_time.elapsed();
                                    return Ok((body[..expected_len].trim().to_string(), duration));
                                }
                            }
                        }
                    } else if body.trim().starts_with('[') && body.trim().ends_with(']') {
                        let duration = start_time.elapsed();
                        return Ok((body.trim().to_string(), duration));
                    }
                }
            }
            Err(_) => break,
        }
    }

    let resp_str = String::from_utf8_lossy(&response);
    let duration = start_time.elapsed();
    if let Some(pos) = resp_str.find("\r\n\r\n") {
        Ok((resp_str[pos + 4..].trim().to_string(), duration))
    } else {
        Ok((resp_str.trim().to_string(), duration))
    }
}

fn main() {
    println!("--- Testing Raw TCP CDP Handshake ---");
    match fetch_cdp_targets_raw("127.0.0.1:9222", 800) {
        Ok((payload, duration)) => {
            println!("Success! Handshake completed in: {:.2?}", duration);
            println!("Payload preview: {}", &payload[..payload.len().min(120)]);
        }
        Err(err) => {
            println!("Handshake error (Chrome running on 9222?): {}", err);
            println!("Note: Start Chrome with '--remote-debugging-port=9222' to test live.");
        }
    }
}
