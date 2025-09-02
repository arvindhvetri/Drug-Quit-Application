# utils/sobriety.py

import cv2
import numpy as np
import os
from datetime import datetime

# Path to Haar Cascade file (only face needed)
CASCADE_DIR = os.path.join(os.path.dirname(__file__), "haar_cascades")
FACE_CASCADE_PATH = os.path.join(CASCADE_DIR, "haarcascade_frontalface_default.xml")

# Load face detector
face_cascade = cv2.CascadeClassifier(FACE_CASCADE_PATH)

if face_cascade.empty():
    raise FileNotFoundError(f"Could not load face cascade from {FACE_CASCADE_PATH}")

# Thresholds
REDNESS_THRESHOLD = 0.55        # Normalized redness score (0–1)
DROOP_THRESHOLD_RATIO = 0.35    # Width/height ratio: higher = droopier
MIN_EYE_WIDTH = 20              # Minimum valid eye width (px)


def analyze_sobriety(image_path: str):
    """
    Analyze sobriety using only OpenCV:
    - Detect face with Haar Cascade
    - Estimate eye positions based on face region
    - Analyze eye redness and droop
    Returns: {
        "is_sober": bool,
        "flags": list,
        "image_analysis": dict
    }
    """
    # Read image
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Could not load image"}

    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = image.shape[:2]

    # ——————————————————————
    # 1. Detect Face
    # ——————————————————————
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(100, 100)
    )
    if len(faces) == 0:
        return {"error": "No face detected"}

    # Use largest face
    x, y, w_face, h_face = max(faces, key=lambda f: f[2] * f[3])

    # ——————————————————————
    # 2. Estimate Eye Regions (Proportional to Face)
    # ——————————————————————
    # Eyes are typically between 35% and 50% down the face
    eye_top_start = int(y + 0.35 * h_face)
    eye_bottom_end = int(y + 0.50 * h_face)
    eye_h = eye_bottom_end - eye_top_start

    if eye_h < 10:
        return {"error": "Face too small for eye analysis"}

    # Horizontal positions (approx: left at 25%, right at 65% of face width)
    left_eye_x = x + int(0.25 * w_face)
    right_eye_x = x + int(0.65 * w_face)
    eye_w = int(0.20 * w_face)

    if eye_w < MIN_EYE_WIDTH:
        return {"error": "Face too small for reliable analysis"}

    flags = []
    analysis = {}

    # Loop over both eyes
    for eye_name, eye_x in [("left", left_eye_x), ("right", right_eye_x)]:
        # Define ROI for this eye
        ex1 = eye_x
        ey1 = eye_top_start
        ex2 = eye_x + eye_w
        ey2 = eye_bottom_end
        eye_roi = image[ey1:ey2, ex1:ex2]

        if eye_roi.size == 0:
            continue

        # ——————————————————————
        # 3. Redness Detection (Red vs Green/Blue)
        # ——————————————————————
        red = eye_roi[:, :, 2].astype(np.float32)
        green = eye_roi[:, :, 1].astype(np.float32)
        blue = eye_roi[:, :, 0].astype(np.float32)

        # Avoid division by zero
        total = red + green + blue + 1e-5
        red_ratio = np.mean(red / total)  # Relative red intensity
        redness_score = min(red_ratio * 2.0, 1.0)  # Normalize to ~0–1

        # ——————————————————————
        # 4. Droop Detection (Width vs Height Ratio)
        # ——————————————————————
        droop_ratio = eye_w / (eye_h + 1e-5)

        # ——————————————————————
        # Store Results
        # ——————————————————————
        analysis[f"{eye_name}_redness"] = float(round(redness_score, 2))      # ← float()
        analysis[f"{eye_name}_droop_ratio"] = float(round(droop_ratio, 2))    # ← float()

        if redness_score > REDNESS_THRESHOLD:
            flags.append(f"{eye_name}_red_eye")
        if droop_ratio > DROOP_THRESHOLD_RATIO:
            flags.append(f"{eye_name}_droopy_eye")

    # ——————————————————————
    # Final Decision: Sober if no flags
    # ——————————————————————
    is_sober = len(flags) == 0

    return {
        "is_sober": is_sober,
        "flags": list(set(flags)),  # Remove duplicates
        "image_analysis": {
            "total_faces_detected": len(faces),
            "face_region": [int(x), int(y), int(w_face), int(h_face)],  # ← int()
            **analysis
        }
    }