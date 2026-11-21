import os
import io
import wave
import subprocess
import numpy as np
from scipy import signal, stats

def convert_to_pcm_wav(audio_bytes: bytes) -> bytes:
    """Uses ffmpeg to standardize incoming mp3/ogg/m4a/wav to 16-bit 22050Hz mono WAV."""
    try:
        proc = subprocess.Popen(
            ['ffmpeg', '-i', 'pipe:0', '-f', 'wav', '-ar', '22050', '-ac', '1', '-acodec', 'pcm_s16le', 'pipe:1'],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        out, _ = proc.communicate(input=audio_bytes)
        if proc.returncode == 0 and len(out) > 44:
            return out
    except:
        pass
    return audio_bytes

def analyze_audio_forensics(audio_bytes: bytes) -> dict:
    """
    100% Local FOSS Deep Audio Forensics:
    - Waveform Envelope Dynamics (Crest Factor, Attack Slopes)
    - Waveform Higher-Order Statistics (Skewness, Kurtosis for Glottal Pulse Asymmetry)
    - Spectral Cutoff & Vocoder Shelf Detection
    - Digital Silence vs Microphone Room-Tone Noise Floor
    - Normalized 100-Point Waveform Array for Frontend Visualization
    """
    try:
        wav_bytes = convert_to_pcm_wav(audio_bytes)
        bio = io.BytesIO(wav_bytes)
        
        with wave.open(bio, 'rb') as wf:
            sample_rate = wf.getframerate()
            n_frames = wf.getnframes()
            frames = wf.readframes(n_frames)
            
        data = np.frombuffer(frames, dtype=np.int16).astype(float)
        if len(data) == 0:
            return {"error": "Empty audio buffer", "synthetic_probability": 0.0}
            
        # Normalize to [-1.0, 1.0]
        peak_val = np.max(np.abs(data))
        if peak_val > 0:
            norm_data = data / peak_val
        else:
            norm_data = data
            
        duration_sec = round(len(data) / sample_rate, 2)
        
        # -------------------------------------------------------------
        # 1. WAVEFORM DYNAMICS & ENVELOPE ANALYSIS
        # -------------------------------------------------------------
        rms = np.sqrt(np.mean(norm_data**2))
        crest_factor_db = round(float(20 * np.log10(1.0 / (rms + 1e-6))), 2)
        
        # Waveform statistical moments (asymmetry of glottal pulse cycle)
        waveform_skew = round(float(stats.skew(norm_data)), 3)
        waveform_kurtosis = round(float(stats.kurtosis(norm_data)), 3)
        
        # Downsampled 100-point normalized waveform peaks for UI rendering
        chunk_size = max(1, len(norm_data) // 100)
        waveform_peaks = [
            round(float(np.max(np.abs(norm_data[i*chunk_size:(i+1)*chunk_size]))), 3)
            for i in range(min(100, len(norm_data) // chunk_size))
        ]
        
        # Envelope onset discontinuities (abrupt jumps typical of spliced neural TTS)
        diff_signal = np.abs(np.diff(norm_data))
        abrupt_jumps_count = int(np.sum(diff_signal > 0.45))
        
        # -------------------------------------------------------------
        # 2. SPECTRAL & VOCODER CUTOFF ANALYSIS
        # -------------------------------------------------------------
        freqs, times, Sxx = signal.spectrogram(norm_data, fs=sample_rate, nperseg=1024)
        mean_spec = np.mean(Sxx, axis=1)
        total_energy = np.sum(mean_spec)
        
        cum_energy = np.cumsum(mean_spec) / (total_energy + 1e-6)
        rolloff_idx = np.where(cum_energy >= 0.85)[0]
        rolloff_hz = float(freqs[rolloff_idx[0]]) if len(rolloff_idx) > 0 else 0.0
        
        high_freq_indices = np.where(freqs > 8000)[0]
        high_freq_ratio = float(np.sum(mean_spec[high_freq_indices]) / (total_energy + 1e-6)) if len(high_freq_indices) > 0 else 0.0
        
        has_vocoder_cutoff = rolloff_hz < 7200 or high_freq_ratio < 0.012
        
        # -------------------------------------------------------------
        # 3. DIGITAL SILENCE VS ROOM NOISE FLOOR
        # -------------------------------------------------------------
        rms_window = int(sample_rate * 0.05)
        n_windows = len(norm_data) // rms_window
        rms_values = [np.sqrt(np.mean(norm_data[i*rms_window:(i+1)*rms_window]**2)) for i in range(n_windows)]
        rms_arr = np.array(rms_values)
        
        digital_silence_count = np.sum(rms_arr < 0.0008)
        digital_silence_pct = round((digital_silence_count / (len(rms_arr) + 1e-4)) * 100, 1)
        
        # -------------------------------------------------------------
        # 4. SYNTHETIC PROBABILITY SCORE & INDICATORS
        # -------------------------------------------------------------
        synthetic_score = 0.0
        indicators = []
        
        # A. Waveform Dynamic Compression Check
        # Natural human speech has crest factor between 11dB - 18dB.
        # Over-compressed synthetic vocoders hover around 5dB - 9dB.
        if crest_factor_db < 9.5:
            synthetic_score += 30.0
            indicators.append({
                "metric": "Waveform Crest Factor",
                "value": f"{crest_factor_db} dB",
                "anomaly": True,
                "finding": "Unnaturally low dynamic crest factor typical of over-compressed neural vocoder synthesis."
            })
        else:
            indicators.append({
                "metric": "Waveform Crest Factor",
                "value": f"{crest_factor_db} dB",
                "anomaly": False,
                "finding": "Natural dynamic range consistent with organic vocal cords."
            })
            
        # B. Spectral Vocoder Shelf
        if has_vocoder_cutoff:
            synthetic_score += 35.0
            indicators.append({
                "metric": "Spectral Bandwidth Cutoff",
                "value": f"{round(rolloff_hz)} Hz",
                "anomaly": True,
                "finding": "Hard brickwall cutoff detected in upper frequencies (HiFi-GAN vocoder artifact)."
            })
        else:
            indicators.append({
                "metric": "Spectral Bandwidth Cutoff",
                "value": f"{round(rolloff_hz)} Hz",
                "anomaly": False,
                "finding": "Organic acoustic harmonics smoothly decay into high frequencies."
            })
            
        # C. Digital Silence Gaps
        if digital_silence_pct > 12.0:
            synthetic_score += 25.0
            indicators.append({
                "metric": "Inter-Syllabic Silence",
                "value": f"{digital_silence_pct}% digital zero",
                "anomaly": True,
                "finding": "Artificial non-ambient silence gaps devoid of physical room tone."
            })
            
        # D. Waveform Kurtosis (Peakiness)
        if waveform_kurtosis > 8.0 or waveform_kurtosis < -1.2:
            synthetic_score += 10.0
            indicators.append({
                "metric": "Waveform Kurtosis",
                "value": str(waveform_kurtosis),
                "anomaly": True,
                "finding": "Glottal pulse peak distribution deviates from human physiological vocal tract limits."
            })
            
        final_probability = min(98.5, max(4.0, round(synthetic_score, 1)))
        classification = "SYNTHETIC_VOICE_CLONE" if final_probability >= 55.0 else "NATURAL_HUMAN_RECORDING"
        
        return {
            "duration_seconds": duration_sec,
            "sample_rate_hz": sample_rate,
            "synthetic_probability": final_probability,
            "classification": classification,
            "waveform_forensics": {
                "crest_factor_db": crest_factor_db,
                "skewness": waveform_skew,
                "kurtosis": waveform_kurtosis,
                "abrupt_onset_jumps": abrupt_jumps_count,
                "waveform_peaks": waveform_peaks
            },
            "spectral_forensics": {
                "spectral_rolloff_hz": round(rolloff_hz, 1),
                "high_frequency_energy_ratio": round(high_freq_ratio, 4),
                "digital_silence_pct": digital_silence_pct
            },
            "forensic_indicators": indicators,
            "engine": "TruthLens Local Waveform & Spectral Analyzer (Zero Cloud Credits)"
        }
    except Exception as e:
        return {"error": str(e), "synthetic_probability": 0.0, "classification": "ERROR"}
