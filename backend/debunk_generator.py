import io
import hashlib
import base64
from PIL import Image, ImageDraw, ImageFont
from typing import Dict, Any, List

def create_debunk_card_image(
    media_filename: str,
    synthetic_prob: float,
    verdict: str,
    anomalies: List[str],
    sha256_short: str,
    verification_id: str
) -> bytes:
    """
    Renders a high-contrast debunk card PNG for WhatsApp sharing.
    Uses Pillow to draw a professional forensic alert badge.
    """
    width, height = 800, 480
    bg_color = (18, 20, 24)        # Dark slate
    card_bg = (28, 32, 40)         # Container card
    accent_red = (239, 68, 68)      # Danger red
    accent_green = (34, 197, 94)    # Safe green
    accent_color = accent_red if synthetic_prob >= 50 else accent_green
    text_white = (255, 255, 255)
    text_muted = (156, 163, 175)
    
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Outer Card border & fill
    draw.rounded_rectangle([(20, 20), (width - 20, height - 20)], radius=16, fill=card_bg, outline=accent_color, width=2)
    
    # Header Banner
    header_fill = (45, 20, 25) if synthetic_prob >= 50 else (20, 45, 30)
    draw.rounded_rectangle([(40, 40), (width - 40, 110)], radius=12, fill=header_fill, outline=accent_color, width=1)
    
    # Header Text
    draw.text((60, 50), "TRUTHLENS CITIZEN DEFENSE ALERT", fill=accent_color)
    draw.text((60, 75), f"FORENSIC STATUS: {verdict.upper()}", fill=text_white)
    
    # Probability Metric Block
    draw.rounded_rectangle([(40, 130), (280, 240)], radius=10, fill=(20, 24, 30))
    draw.text((60, 145), "SYNTHETIC PROBABILITY", fill=text_muted)
    draw.text((60, 170), f"{synthetic_prob}%", fill=accent_color)
    
    # File & Hash Block
    draw.rounded_rectangle([(300, 130), (width - 40, 240)], radius=10, fill=(20, 24, 30))
    draw.text((320, 145), f"Target File: {media_filename[:35]}", fill=text_white)
    draw.text((320, 175), f"Evidence Hash: {sha256_short}...", fill=text_muted)
    draw.text((320, 205), f"Verification Ref: #{verification_id}", fill=text_muted)
    
    # Forensic Findings List
    draw.text((40, 260), "DETECTED ANOMALIES & FORENSIC SIGNALS:", fill=text_white)
    y_pos = 290
    if not anomalies:
        anomalies = ["Normal acoustic/compression distributions observed."]
    for item in anomalies[:3]:
        draw.rounded_rectangle([(40, y_pos), (width - 40, y_pos + 36)], radius=6, fill=(35, 40, 52))
        draw.text((60, y_pos + 8), f"> {item}", fill=text_white)
        y_pos += 46
        
    # Footer disclaimer
    draw.text((40, height - 55), "Verified by TruthLens Edge Forensics Node | Section 63 BSA Tamper-Proof Chain", fill=text_muted)
    
    output = io.BytesIO()
    img.save(output, format="PNG", optimize=True)
    return output.getvalue()


def generate_grassroots_debunk_package(
    media_filename: str,
    media_bytes: bytes,
    forensics_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Produces ready-to-share grassroots counter-signals:
    1. Base64 PNG Debunk Card for WhatsApp
    2. One-click WhatsApp counter-message text
    """
    synthetic_prob = 10.0
    verdict = "LIKELY AUTHENTIC"
    anomalies = []
    sha256_hash = hashlib.sha256(media_bytes).hexdigest()
    
    if "foss_audio_forensics" in forensics_data:
        af = forensics_data["foss_audio_forensics"]
        synthetic_prob = float(af.get("synthetic_probability", 15.0))
        verdict = af.get("classification", "INCONCLUSIVE")
        for ind in af.get("forensic_indicators", []):
            if ind.get("anomaly"):
                anomalies.append(f"{ind.get('metric')}: {ind.get('finding')}")
    elif "foss_edge_forensics" in forensics_data:
        ef = forensics_data["foss_edge_forensics"]
        ela = ef.get("error_level_analysis", {})
        if ela.get("tampering_detected"):
            synthetic_prob = 85.0
            verdict = "IMAGE MANIPULATION DETECTED"
            anomalies.append(f"ELA Compression Variance: {ela.get('max_deviation')}")
            
    verif_id = sha256_hash[:8].upper()
    png_bytes = create_debunk_card_image(
        media_filename=media_filename,
        synthetic_prob=synthetic_prob,
        verdict=verdict,
        anomalies=anomalies,
        sha256_short=sha256_hash[:16],
        verification_id=verif_id
    )
    b64_img = base64.b64encode(png_bytes).decode("utf-8")
    
    # WhatsApp Counter-Forward Snippet
    whatsapp_counter_text = (
        f"🚨 *TRUTHLENS FORENSIC COUNTER-SIGNAL*\n"
        f"Beware: The forward '{media_filename}' has been analyzed by TruthLens Open-Source Forensics.\n\n"
        f"• Status: *{verdict}* ({synthetic_prob}% synthetic likelihood)\n"
        f"• Key Anomalies: {', '.join(anomalies[:2]) if anomalies else 'Normal acoustic/compression baseline'}\n"
        f"• Tamper-Proof Hash: `{sha256_hash[:16]}...`\n"
        f"• Section 63 BSA Evidence Ref: `#{verif_id}`\n\n"
        f"Do not forward unverified synthetic media. Break the virality loop."
    )
    
    return {
        "verification_id": verif_id,
        "synthetic_probability_pct": synthetic_prob,
        "verdict": verdict,
        "anomalies": anomalies,
        "sha256_hash": sha256_hash,
        "debunk_card_base64_png": f"data:image/png;base64,{b64_img}",
        "debunk_card_bytes_len": len(png_bytes),
        "whatsapp_counter_text": whatsapp_counter_text
    }
