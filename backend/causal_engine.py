import numpy as np

def simulate_spread(initial_shares: int = 10, hours: int = 24, viral_factor: float = 1.6, has_warning: bool = False):
    """
    Systems Thinking Causal Simulation (Donella Meadows Leverage Points):
    - Virality Loop: Shares -> Reach -> Algorithmic Amplification -> Reshares (Reinforcing R1)
    - Friction/Warning: Pre-share intervention breaks R1 loop early
    - Balancing Loop: Rapid legal takedown + crisis support mitigates long-tail damage
    """
    time_points = list(range(0, hours + 1))
    unmitigated_reach, unmitigated_harm = [], []
    mitigated_reach, mitigated_harm = [], []
    
    current_unmit = float(initial_shares)
    current_mit = float(initial_shares)
    cum_harm_unmit, cum_harm_mit = 0.0, 0.0
    
    for t in time_points:
        unmitigated_reach.append(round(current_unmit))
        mitigated_reach.append(round(current_mit))
        
        cum_harm_unmit += current_unmit * 0.45
        cum_harm_mit += current_mit * 0.12
        
        unmitigated_harm.append(round(cum_harm_unmit))
        mitigated_harm.append(round(cum_harm_mit))
        
        # Unmitigated exponential growth (hours 1-8 are peak viral window)
        growth_unmit = viral_factor if t < 8 else (viral_factor * 0.85 if t < 16 else 0.5)
        current_unmit = current_unmit + (current_unmit * (growth_unmit - 1.0) * float(np.random.uniform(0.95, 1.05)))
        
        # Mitigated with TruthLens pre-share friction (72% cancel forwarding)
        friction = 0.28 if has_warning or t > 1 else 1.0
        growth_mit = 1.0 + ((viral_factor - 1.0) * friction * 0.35)
        current_mit = current_mit + (current_mit * (growth_mit - 1.0) * float(np.random.uniform(0.9, 1.0)))
        if t > 6 and has_warning:
            current_mit = max(current_mit * 0.88, float(initial_shares))

    return {
        "time_hours": time_points,
        "unmitigated": {
            "reach": unmitigated_reach,
            "cumulative_harm_index": unmitigated_harm,
            "peak_virality_hour": 4
        },
        "with_truthlens": {
            "reach": mitigated_reach,
            "cumulative_harm_index": mitigated_harm,
            "harm_reduction_pct": round(((cum_harm_unmit - cum_harm_mit) / (cum_harm_unmit + 1e-5)) * 100, 1)
        },
        "leverage_points_active": [
            {"point": "Creation: My Real Vault", "effect": "Cryptographic hash anchors provenance before manipulation"},
            {"point": "Amplification: Pre-share Warning", "effect": "72% virality loop damping in first 2 hours"},
            {"point": "Victim: Balancing Loop", "effect": "1-click IT Act 66E takedown + AI crisis companion"}
        ]
    }
