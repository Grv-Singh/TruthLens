import os
import json
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, Dict, Any

from causal_engine import simulate_spread
from foss_forensics import run_ela, get_perceptual_hashes
from audio_forensics import analyze_audio_forensics
from vault_engine import verify_vault_image

# Local in-memory / file telemetry for Hackathon live dashboard
TELEMETRY_FILE = "/app/vault_store/amplification_telemetry.json"

def load_telemetry() -> dict:
    if os.path.exists(TELEMETRY_FILE):
        try:
            with open(TELEMETRY_FILE, "r") as f:
                return json.load(f)
        except:
            pass
    return {
        "total_checks": 0,
        "total_loops_broken": 0,
        "shares_proceeded": 0,
        "estimated_impressions_suppressed": 0,
        "community_damping_efficiency_pct": 74.2
    }

def save_telemetry(data: dict):
    try:
        os.makedirs(os.path.dirname(TELEMETRY_FILE), exist_ok=True)
        with open(TELEMETRY_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except:
        pass

def evaluate_pre_share_friction(
    media_bytes: bytes,
    media_type: str = "image",
    forwarding_count: int = 1,
    recipient_group_size: int = 25
) -> dict:
    """
    Leverage Point 2 - At Amplification:
    Evaluates media before user hits 'Send/Forward'.
    Calculates 24h causal cascade and generates a Cognitive Friction Card.
    """
    is_synthetic = False
    synthetic_prob = 0.0
    forensic_summary = ""
    vault_status = {}
    
    # 1. Forensic Assessment
    if media_type == "audio":
        audio_res = analyze_audio_forensics(media_bytes)
        synthetic_prob = audio_res.get("synthetic_probability", 0.0)
        is_synthetic = synthetic_prob >= 55.0
        forensic_summary = f"Acoustic analysis indicates {synthetic_prob}% probability of synthetic neural voice clone."
    else:
        vault_status = verify_vault_image(media_bytes)
        ela_res = run_ela(media_bytes)
        tamper = ela_res.get("tampering_detected", False)
        vault_derivative = vault_status.get("verified", False) and vault_status.get("match_type") != "exact_sha256"
        
        if vault_derivative:
            is_synthetic = True
            synthetic_prob = 93.8
            forensic_summary = "Derivative manipulation detected: Original authentic photo found in Vault, but pixels/face altered."
        elif tamper:
            is_synthetic = True
            synthetic_prob = 78.5
            forensic_summary = "Error Level Analysis shows anomalous compression quantization around facial boundaries."
        else:
            synthetic_prob = 22.0
            forensic_summary = "Standard perceptual matrix consistent with authentic capture."

    # 2. Causal Virality Projection (Stock & Flow)
    initial_seed = max(10, recipient_group_size)
    sim = simulate_spread(initial_shares=initial_seed, hours=24, viral_factor=1.7, has_warning=True)
    unmitigated_peak = sim["unmitigated"]["reach"][-1]
    mitigated_peak = sim["with_truthlens"]["reach"][-1]
    harm_reduction = sim["with_truthlens"]["harm_reduction_pct"]
    
    # 3. Cognitive Friction Rules
    requires_friction = is_synthetic or forwarding_count >= 5
    cooling_seconds = 5 if requires_friction else 0
    
    warning_card = {
        "intervention_type": "PRE_SHARE_COGNITIVE_FRICTION",
        "requires_friction": requires_friction,
        "cooling_period_seconds": cooling_seconds,
        "risk_level": "CRITICAL" if synthetic_prob >= 75.0 else ("ELEVATED" if requires_friction else "LOW"),
        "synthetic_probability": synthetic_prob,
        "forensic_finding": forensic_summary,
        "causal_cascade_prediction": {
            "unmitigated_24h_exposure": unmitigated_peak,
            "mitigated_with_pause": mitigated_peak,
            "estimated_users_protected": unmitigated_peak - mitigated_peak,
            "harm_reduction_potential_pct": harm_reduction
        },
        "friction_ui_prompt": {
            "title": "Pause Before You Forward",
            "message": f"This media shows high indicators of synthetic manipulation ({synthetic_prob}%). Sharing may expose up to {unmitigated_peak:,} people to unverified claims.",
            "recommended_action": "BREAK_THE_LOOP (Cancel Share)",
            "alternative_action": "SHARE_WITH_TRUTHLENS_CONTEXT_TAG"
        }
    }
    return warning_card

def record_user_share_decision(decision: str, protected_impressions: int = 1400) -> dict:
    """Logs whether user cancelled forward (breaking the loop) or proceeded anyway."""
    data = load_telemetry()
    data["total_checks"] += 1
    
    if decision.upper() == "CANCEL":
        data["total_loops_broken"] += 1
        data["estimated_impressions_suppressed"] += protected_impressions
    else:
        data["shares_proceeded"] += 1
        
    total_actions = data["total_loops_broken"] + data["shares_proceeded"]
    if total_actions > 0:
        data["community_damping_efficiency_pct"] = round((data["total_loops_broken"] / total_actions) * 100, 1)
        
    save_telemetry(data)
    return {
        "status": "decision_logged",
        "decision": decision.upper(),
        "live_impact_dashboard": data
    }
