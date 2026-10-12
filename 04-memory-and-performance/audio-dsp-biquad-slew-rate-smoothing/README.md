# Case Study 60: 10-Band Biquad Filter Equalizer with Slew-Rate Slew Smoothing

## 1. The Engineering Constraint
1. **Digital Audio Clicks and Popping:** When users adjust equalizer sliders in desktop music players, abruptly updating IIR filter coefficients mid-stream produces discontinuous waveform jumps that sound like loud static clicks and can damage speakers.
2. **CPU Overload from Per-Sample Coefficient Math:** Recalculating trigonometric biquad filter transfer functions (`sin`, `cos`, `alpha`) on every single audio sample (44,100 times per second) exhausts CPU cores.
3. **Digital Clipping from Positive Gain Boosts:** Boosting low frequencies (e.g. +12 dB bass) amplifies samples beyond the [-1.0, 1.0] float range, causing harsh digital clipping distortion.

## 2. Why Naive Workarounds Fail
1. **Instantaneous Coefficient Replacement:** Directly overwriting biquad delay buffers (`x1`, `x2`, `y1`, `y2`) creates instant step discontinuities in the output signal.
2. **Sample-Rate Coefficient Smoothing:** Calculating filter pole-zero placement on every sample introduces floating-point division and trig bottlenecks in the critical audio path.
3. **Fixed Preamp Attenuation:** Applying global volume reduction even when EQ gains are flat reduces signal dynamic range unnecessarily.

## 3. The Architecture
1. **Frame-Bounded Decimation (`128-Frame Block Rate`):** Coefficient interpolation runs strictly once every 128 audio frames (`~2.9ms` at 44.1kHz), reducing trigonometric calculation overhead by 99.2%.
2. **Geometric Slew-Rate Smoothing (`12% Convergence`):** Gains interpolate geometrically toward user targets (`*current += (target - *current) * 0.12`), ensuring seamless analog-like transitions with zero audible pops.
3. **Dynamic Preamp Compensation:** Computes peak negative gain offset (`eq_preamp`), automatically attenuating the input stage to preserve dynamic headroom and prevent clipping.

## 4. Benchmarks & Validation
| Audio Filter Transition Approach | Audible Audio Clicks | Coefficient CPU Usage | Headroom Clipping Defense |
|---|---|---|---|
| Direct Parameter Overwrite | Severe (Loud Digital Pops) | Low | None (Severe Clipping) |
| Per-Sample Linear Slew | Zero (Smooth) | Critical (44.1k Trig Evals/s) | Partial |
| **128-Frame Geometric Slew Rate** | **Zero (Imperceptible Smoothness)** | **Negligible (344 Evals/s)** | **Dynamic Preamp Headroom** |

## 5. Implementation
See production-grade implementation in [`src/biquad_slew_equalizer.rs`](./src/biquad_slew_equalizer.rs).
