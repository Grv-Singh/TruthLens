from datetime import datetime

def generate_takedown_notice(victim_name: str, platform: str, url: str, evidence_hash: str):
    today = datetime.now().strftime('%Y-%m-%d %H:%M:%S IST')
    body = f"""To: Grievance Officer, {platform}
Date: {today}
Subject: IMMEDIATE REMOVAL NOTICE UNDER RULE 3(2)(b) OF IT RULES 2021 & SECTION 66E / 67A IT ACT 2000

Dear Grievance Officer,

I am writing on behalf of {victim_name} regarding non-consensual synthetic media (deepfake) circulating on your platform:
URL: {url}
Digital Evidence SHA-256: {evidence_hash}

This content constitutes:
1. Violation of Section 66E of the Information Technology Act, 2000 (Privacy violation).
2. Violation of Section 67A of the Information Technology Act, 2000 (Sexually explicit/morphed media).
3. Violation of Bharatiya Nyaya Sanhita (BNS) provisions protecting personal dignity.

Under Rule 3(2)(b) of the IT Rules 2021, intermediaries are mandated to act within 24 HOURS to disable access to non-consensual modified media.

Please confirm compliance within 24 hours. Failure forfeits statutory intermediary immunity under Section 79.

Registered on TruthLens Immutable Vault ID: TL-{evidence_hash[:12].upper()}
"""
    return {
        'subject': f'URGENT: Legal Takedown Notice under IT Act Sec 66E, 67A - Non-Consensual Deepfake',
        'target_platform': platform,
        'timestamp': today,
        'evidence_hash': evidence_hash,
        'legal_draft': body
    }
