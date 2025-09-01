# utils/verify.py
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch
import os

# Load model and processor (first run downloads ~500MB, then works offline)
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name)
processor = CLIPProcessor.from_pretrained(model_name)

def matches_task(photo_path, task_text):
    """
    Uses local CLIP model to check if image matches the task description.
    Returns: {"verified": True/False, "confidence": 0.95, "reason": "..."}
    """
    if not os.path.exists(photo_path):
        return {"verified": False, "error": "Photo not found"}

    try:
        # Open image
        image = Image.open(photo_path).convert("RGB")

        # Define candidate labels based on task
        base_candidates = [
            "a photo of a water bottle",
            "a photo of shoes",
            "a photo of a person smiling",
            "a photo of a journal or notebook",
            "a photo of healthy food",
            "a photo of hands holding something",
            "a photo of sunlight through a window",
            "a photo of a phone on a table",
            "a photo of someone stretching",
            "a photo of a tree or plant"
        ]

        # Add task-specific candidate
        custom_candidate = f"a photo of {task_text.lower().replace('take a photo of ', '').replace('snap a picture of ', '')}"
        candidates = [custom_candidate] + base_candidates

        # Prepare inputs
        inputs = processor(
            text=candidates,
            images=image,
            return_tensors="pt",
            padding=True
        )

        # Forward pass
        with torch.no_grad():
            outputs = model(**inputs)
            logits_per_image = outputs.logits_per_image  # image-to-text similarity
            probs = logits_per_image.softmax(dim=1).squeeze().numpy()

        # Get best match
        best_idx = probs.argmax()
        best_match = candidates[best_idx]
        confidence = float(probs[best_idx])

        # Decide threshold
        THRESHOLD = 0.35  # Adjust based on testing
        verified = confidence > THRESHOLD and best_idx == 0  # Must match *its own* task best

        reason = f"Best match: '{best_match}' (confidence: {confidence:.3f})"

        return {
            "verified": verified,
            "confidence": round(confidence, 3),
            "best_match": best_match,
            "reason": reason
        }

    except Exception as e:
        print("Local verification error:", str(e))
        return {
            "verified": False,
            "error": str(e)
        }