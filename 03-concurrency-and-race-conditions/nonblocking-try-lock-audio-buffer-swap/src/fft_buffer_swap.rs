// Inside the real-time audio thread Iterator::next()
if self.channel == 0 && self.analysis_active {
    self.analysis_buffer.push(value);
    
    // Once 1024 samples accumulate, export to visualizer
    if self.analysis_buffer.len() >= 1024 {
        // 1. MUST NEVER BLOCK: Attempt non-blocking mutex acquisition
        if let Some(mut target) = self.analyzer.try_lock() {
            target.clear();
            // 2. Zero-copy pointer swap: transfers 1024 floats in O(1)
            std::mem::swap(&mut *target, &mut self.analysis_buffer);
            self.analysis_buffer.clear();
        } else {
            // 3. UI thread is currently running FFT: drop block and continue
            self.analysis_buffer.clear();
        }
    }
}