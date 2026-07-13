import os
import requests
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("download_model")

MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model_bge_large")
POOLING_DIR = os.path.join(MODEL_DIR, "1_Pooling")

# Create directories
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(POOLING_DIR, exist_ok=True)

BASE_URL = "https://hf-mirror.com/BAAI/bge-large-en-v1.5/resolve/main"

FILES = [
    "config.json",
    "config_sentence_transformers.json",
    "model.safetensors",
    "modules.json",
    "sentence_bert_config.json",
    "special_tokens_map.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.txt",
    "1_Pooling/config.json"
]

def download_file(filename: str):
    url = f"{BASE_URL}/{filename}"
    
    if filename.startswith("1_Pooling/"):
        target_path = os.path.join(POOLING_DIR, filename.split("/")[-1])
    else:
        target_path = os.path.join(MODEL_DIR, filename)

    logger.info(f"Downloading {filename}...")
    
    # Support range requests for resuming interrupted large downloads
    downloaded = 0
    headers = {}
    mode = "wb"
    if os.path.exists(target_path) and filename == "model.safetensors":
        downloaded = os.path.getsize(target_path)
        if downloaded > 0:
            logger.info(f"Resuming download from byte offset {downloaded}...")
            headers["Range"] = f"bytes={downloaded}-"
            mode = "ab" # Append binary mode

    try:
        response = requests.get(url, headers=headers, stream=True, timeout=30)
        if response.status_code not in [200, 206]:
            logger.error(f"Failed to download {filename}: HTTP {response.status_code}")
            return False
            
        total_size = int(response.headers.get('content-length', 0))
        if response.status_code == 206:
            total_size += downloaded
            
        chunk_size = 1024 * 1024  # 1MB
        
        with open(target_path, mode) as f:
            for chunk in response.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
                    downloaded += len(chunk)
                    if total_size > 0:
                        pct = (downloaded / total_size) * 100
                        # Log progress every 20MB
                        if downloaded % (chunk_size * 20) == 0 or downloaded == total_size:
                            logger.info(f"Progress for {filename}: {pct:.1f}% ({downloaded / (1024*1024):.1f}MB / {total_size / (1024*1024):.1f}MB)")
                    
        logger.info(f"Finished downloading {filename} -> {target_path}")
        return True
    except Exception as e:
        logger.error(f"Error downloading {filename}: {e}")
        return False

def main():
    logger.info("Starting direct model download from mirror...")
    for f in FILES:
        success = download_file(f)
        if not success:
            logger.error("Download failed! Aborting.")
            return
    logger.info("All model files downloaded successfully!")

if __name__ == "__main__":
    main()
