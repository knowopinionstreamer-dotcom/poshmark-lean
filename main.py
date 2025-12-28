import subprocess
import requests
import base64
import json

# Settings for your 8GB Laptop
OLLAMA_URL = "http://localhost:11434/api/generate"
VISION_MODEL = "qwen2.5vl:3b"
WRITER_MODEL = "llama3.2:3b"   

def encode_image(image_path):
    with open(image_path, "rb") as img:
        return base64.b64encode(img.read()).decode('utf-8')

def call_ollama(model, prompt, image=None):
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "keep_alive": 0  # CRITICAL: Forces RAM clear after every step
    }
    if image: payload["images"] = [image]

    try:
        response = requests.post(OLLAMA_URL, json=payload)
        return response.json().get("response", "Error: No AI response")
    except Exception as e:
        return f"AI Error: {e}"

def run_workflow(image_path):
    # STEP 1: IDENTIFY
    img_b64 = encode_image(image_path)
    print("Step 1: Identifying item...")
    id_prompt = "Identify this item. Return ONLY Brand, Model Name, and Style Code."
    identity = call_ollama(VISION_MODEL, id_prompt, image=img_b64)
    print(f"Found: {identity}")
    
    # STEP 2: SCRAPE PRICES
    print(f"Step 2: Checking market for {identity}...")
    try:
        # Calls the scraper.py file we just created
        scrape = subprocess.run(["python3", "scraper.py", identity], capture_output=True, text=True)
        market_data = scrape.stdout
    except:
        market_data = "No market data found."

    # STEP 3: WRITE LISTING
    print("Step 3: Writing listing...")
    prompt = f"""
    You are a professional Poshmark seller.
    Item: {identity}
    Market Data: {market_data}
    
    Task: Write a SEO-friendly Title and a Description.
    Format:
    TITLE: [Your Title Here]
    
    DESCRIPTION:
    [Your Description Here]
    
    PRICE SUGGESTION: [Based on market data]
    """
    final_listing = call_ollama(WRITER_MODEL, prompt)
    
    return final_listing