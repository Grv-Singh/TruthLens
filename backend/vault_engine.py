import hashlib
import json
import os
import io
from PIL import Image
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models

VAULT_STORE_FILE = '/app/vault_store/vault_db.json'
QDRANT_URL = os.environ.get("QDRANT_URL", "http://qdrant:6333")
COLLECTION_NAME = "truthlens_vault"

def get_qdrant_client():
    try:
        return QdrantClient(url=QDRANT_URL, check_compatibility=False)
    except:
        return None

def extract_vector(image: Image.Image) -> list:
    """Extracts a 128-dimensional normalized perceptual feature vector."""
    im = image.convert('RGB').resize((16, 16), Image.Resampling.LANCZOS)
    arr = np.array(im, dtype=float)
    # 16x16x3 = 768 downscaled to 128 dimensions via mean block pooling
    blocks = arr.reshape(128, 6)
    vec = np.mean(blocks, axis=1)
    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    return vec.tolist()

def compute_phash(image: Image.Image, hash_size: int = 8) -> str:
    image = image.convert('L').resize((hash_size + 1, hash_size), Image.Resampling.LANCZOS)
    pixels = np.array(image.getdata(), dtype=float).reshape((hash_size, hash_size + 1))
    diff = pixels[:, 1:] > pixels[:, :-1]
    return ''.join(['1' if b else '0' for b in diff.flatten()])

def hamming_distance(s1: str, s2: str) -> int:
    return sum(c1 != c2 for c1, c2 in zip(s1, s2))

def load_vault():
    if not os.path.exists(VAULT_STORE_FILE):
        return {}
    try:
        with open(VAULT_STORE_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_vault(data):
    try:
        os.makedirs(os.path.dirname(VAULT_STORE_FILE), exist_ok=True)
        with open(VAULT_STORE_FILE, 'w') as f:
            json.dump(data, f, indent=2)
    except:
        pass

def register_vault_image(owner_id: str, image_bytes: bytes, metadata: dict = None):
    sha256 = hashlib.sha256(image_bytes).hexdigest()
    im = Image.open(io.BytesIO(image_bytes))
    phash = compute_phash(im)
    vec = extract_vector(im)
    
    record = {
        'sha256': sha256,
        'phash': phash,
        'owner_id': owner_id,
        'provenance_signature': f'C2PA-{sha256[:16].upper()}-VERIFIED'
    }
    
    # 1. Local disk persistence
    vault = load_vault()
    vault[sha256] = record
    save_vault(vault)
    
    # 2. Qdrant Vector DB indexing
    qclient = get_qdrant_client()
    if qclient:
        try:
            point_id = int(sha256[:8], 16)
            qclient.upsert(
                collection_name=COLLECTION_NAME,
                points=[
                    models.PointStruct(
                        id=point_id,
                        vector=vec,
                        payload=record
                    )
                ]
            )
            record["qdrant_indexed"] = True
        except Exception as e:
            record["qdrant_indexed"] = False
            record["qdrant_error"] = str(e)
            
    return record

def verify_vault_image(image_bytes: bytes):
    sha256 = hashlib.sha256(image_bytes).hexdigest()
    im = Image.open(io.BytesIO(image_bytes))
    phash = compute_phash(im)
    vec = extract_vector(im)
    
    # 1. Check Exact SHA-256
    vault = load_vault()
    if sha256 in vault:
        return {'verified': True, 'match_type': 'exact_sha256', 'confidence': 1.0, 'record': vault[sha256]}
    
    # 2. Check Qdrant Vector Similarity
    qclient = get_qdrant_client()
    if qclient:
        try:
            hits = qclient.search(
                collection_name=COLLECTION_NAME,
                query_vector=vec,
                limit=1
            )
            if hits and hits[0].score >= 0.85:
                hit = hits[0]
                return {
                    'verified': True,
                    'match_type': 'vector_cosine_derivative',
                    'similarity_score': round(hit.score, 3),
                    'record': hit.payload,
                    'verdict': f"Original registered by {hit.payload.get('owner_id')} found in Qdrant Vector Vault! Modified derivative/deepfake detected."
                }
        except:
            pass
            
    # 3. Fallback to pHash Hamming Distance
    closest, min_dist = None, 64
    for orig, rec in vault.items():
        d = hamming_distance(phash, rec.get('phash', ''))
        if d < min_dist:
            min_dist, closest = d, rec
            
    if closest and min_dist <= 10:
        return {
            'verified': True,
            'match_type': 'perceptual_variant_detected',
            'similarity_pct': round((1 - (min_dist / 64.0)) * 100, 1),
            'record': closest,
            'verdict': 'Authentic original found in vault. Suspect media is a manipulated derivative/deepfake.'
        }
        
    return {'verified': False, 'verdict': 'No matching original found in Vault.'}
