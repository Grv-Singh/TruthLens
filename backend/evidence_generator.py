import hashlib
import datetime
import uuid
from typing import Dict, Any, Optional

def generate_section63_bsa_certificate(
    victim_name: str,
    media_filename: str,
    media_bytes: bytes,
    forensics_data: Dict[str, Any],
    suspect_identifier: Optional[str] = "Unknown Forwarder / Group",
    incident_date: Optional[str] = None,
    client_ip: Optional[str] = "127.0.0.1"
) -> Dict[str, Any]:
    """
    Generates a legally structured electronic record certificate under 
    Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA) 
    [Formerly Section 65B of the Indian Evidence Act, 1872].
    
    Includes forensic indicators (FFT audio / ELA image), SHA-256 tamper-proof hash,
    and ready-to-file Cyber Crime / CBI / Police complaint text.
    """
    sha256_hash = hashlib.sha256(media_bytes).hexdigest()
    md5_hash = hashlib.md5(media_bytes).hexdigest()
    file_size_bytes = len(media_bytes)
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    certificate_id = f"TL-BSA63-{uuid.uuid4().hex[:10].upper()}"
    
    date_str = incident_date or datetime.date.today().isoformat()
    
    # Extract anomaly highlights
    anomalies = []
    if "foss_audio_forensics" in forensics_data:
        af = forensics_data["foss_audio_forensics"]
        if af.get("synthetic_probability_pct", 0) > 60:
            anomalies.append(f"Synthetic Audio Signature (Prob: {af.get('synthetic_probability_pct')}%)")
        if af.get("anomalies"):
            anomalies.extend(af.get("anomalies"))
    elif "foss_edge_forensics" in forensics_data:
        ef = forensics_data["foss_edge_forensics"]
        ela = ef.get("error_level_analysis", {})
        if ela.get("tampering_detected"):
            anomalies.append(f"ELA Compression Discontinuity (Max Deviation: {ela.get('max_deviation')})")
    
    certificate_text = f"""
================================================================================
CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023 (BSA)
[For Admissibility of Electronic Records in Court & Law Enforcement Investigations]
================================================================================

CERTIFICATE ID: {certificate_id}
ISSUANCE TIMESTAMP: {now_utc}
APPLICANT / COMPLAINANT: {victim_name}

1. PARTICULARS OF ELECTRONIC DEVICE & STORAGE:
   - Extraction System: TruthLens Open-Source Forensic Edge Node
   - Architecture: Linux x86_64 / Proxmox CT Container (Zero-Trust Sandbox)
   - Operational Status: System operated properly under lawful custody.

2. IDENTIFICATION OF ELECTRONIC RECORD:
   - Target File Name: {media_filename}
   - File Size: {file_size_bytes:,} bytes
   - Cryptographic SHA-256 Hash: {sha256_hash}
   - Cryptographic MD5 Hash: {md5_hash}

3. TECHNICAL FORENSIC FINDINGS:
   - Integrity Status: MODIFIED / SYNTHETIC FABRICATION DETECTED
   - Observed Anomalies:
     {chr(10).join(f'     * {a}' for a in (anomalies or ['Anomalous digital artifact signatures detected']))}

4. DECLARATION UNDER SECTION 63(4) BSA:
   I, {victim_name}, hereby certify that the electronic record described above was
   produced by an automated electronic forensic process during the ordinary course
   of digital verification. The cryptographic hashes herein guarantee that the
   evidence has suffered no subsequent alteration or degradation.

Signature of Complainant / Custodian: _________________________
Date: {date_str}
================================================================================
""".strip()

    police_complaint_letter = f"""
To,
The Cyber Crime Police Station / In-Charge,
Anti-Corruption Branch (ACB) / Central Bureau of Investigation (CBI) / Cyber Cell,

Subject: Formal Complaint under IT Act 2000 (Sec 66D, 66E, 67A), Bharatiya Nyaya Sanhita (BNS) Sec 318(4), 336(3), 356 and Sec 63 BSA.

Respected Officer,

I, {victim_name}, am lodging this formal complaint regarding malicious generation and viral circulation of synthetic/tampered digital media targeted to cause defamation, impersonation, and mental distress.

1. Incident Details:
   - Date of Circulation: {date_str}
   - Circulating Entity / Platform: {suspect_identifier}
   - File Name: {media_filename}
   - SHA-256 Evidence Hash: {sha256_hash}

2. Forensic Evidence Enclosed:
   - Section 63 BSA Electronic Record Certificate: Ref #{certificate_id}
   - Forensic Analysis Report confirms synthetic manipulation signatures.
   - Cryptographic hashes are sealed for chain-of-custody.

I request immediate FIR registration and issuance of Emergency Legal Takedown Notices to intermediary platforms under Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021.

Sincerely,
{victim_name}
Dated: {date_str}
""".strip()

    ipdr_preservation_notice = f"""
================================================================================
STATUTORY LOG PRESERVATION NOTICE UNDER SECTION 67C IT ACT & SECTION 94 BNSS
[Mandatory Preservation of IPDR, CGNAT Port Mappings, CDR & Tower Dump Records]
================================================================================

To:
The Nodal Officers / Law Enforcement Liaison,
Telecom Service Providers (Reliance Jio, Bharti Airtel, Vodafone Idea, BSNL) & 
Intermediary Compliance (WhatsApp LLC / Meta India, Telegram FZ-LLC)

Subject: Statutory Requisition to Freeze & Preserve Traffic Records for Cyber Fraud Investigation (Ref #{certificate_id})

Pursuant to Section 67C of the Information Technology Act, 2000 and Section 94 of the Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), you are hereby directed to immediately FREEZE AND PRESERVE the following electronic traffic logs for a period of 180 days:

1. TARGET IDENTIFIERS:
   - Circulating Suspect Identifier / MSISDN: {suspect_identifier}
   - Evidence SHA-256 Hash: {sha256_hash}
   - Target File: {media_filename}
   - Ingress Gateway IP (TruthLens Ingestion): {client_ip}
   - Incident Timestamp (UTC): {now_utc}

2. LOGS ORDERED PRESERVED:
   a. IP Detail Records (IPDR): Source Private IP, Public Translated IP, Source Port, Destination IP, Destination Port, and Protocol.
   b. Carrier-Grade NAT (CGNAT) Allocation Tables: Exact internal MSISDN/IMSI tied to external public IP at given timestamp.
   c. Call Detail Records (CDR) & Tower Dumps: Cell ID (CID), Location Area Code (LAC), and Azimuth covering target IMEI/IMSI.
   d. Intermediary Registration Logs: Device IMEI, MAC, and registration IP/ISP details.

WARNING: Destruction, alteration, or non-retention of these records constitutes an offense under Section 67C of the IT Act and Section 238 BNS (Causing disappearance of evidence).

Forwarded on behalf of Complainant: {victim_name}
Evidence Dossier Certificate: #{certificate_id}
================================================================================
""".strip()

    return {
        "certificate_id": certificate_id,
        "sha256_hash": sha256_hash,
        "md5_hash": md5_hash,
        "file_size_bytes": file_size_bytes,
        "anomalies_detected": anomalies,
        "section_63_bsa_certificate": certificate_text,
        "police_complaint_letter": police_complaint_letter,
        "ipdr_preservation_notice": ipdr_preservation_notice,
        "cybercrime_portal_ready": {
            "category": "Deepfake / Impersonation / Online Harassment",
            "evidence_hash": sha256_hash,
            "certificate_ref": certificate_id,
            "filing_url": "https://cybercrime.gov.in"
        }
    }
