// 1. Frame-bounded geometric coefficient slew interpolation
if self.current_gains.iter().zip(target).all(|(c, t)| (*c - t).abs() <= 0.001) {
    self.current_gains = target;
    self.preamp = target_preamp;
    self.eq_transitioning = false;
    return;
}

self.active = true;
// 2. Smooth filter parameter transitions by 12% per 128-frame block
for (index, current) in self.current_gains.iter_mut().enumerate() {
    *current += (target[index] - *current) * 0.12;
}
self.preamp += (target_preamp - self.preamp) * 0.12;

// 3. Recompute biquad peak coefficients without digital pops
for channel in &mut self.filters {
    for (index, filter) in channel.iter_mut().enumerate() {
        filter.set_peak(
            self.sample_rate,
            EQ_FREQUENCIES[index],
            self.current_gains[index],
        );
    }
}