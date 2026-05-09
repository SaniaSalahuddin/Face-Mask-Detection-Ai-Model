from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io
import keras
import logging
import os
import json
from datetime import datetime

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- App ----------------
app = FastAPI(
    title="Face Mask Detection API",
    description="Professional Face Mask Detection Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Config ----------------
MODEL_PATH = "face-mask.keras"
MODEL_WEIGHTS_PATH = "my-model.weights.h5"
MODEL_CONFIG_PATH = os.path.join("..", "config.json")

INPUT_SIZE = 224
CONFIDENCE_THRESHOLD = 0.5

model = None


# ---------------- Model Manager ----------------
class ModelManager:

    @staticmethod
    def load_model():
        global model

        if model is not None:
            return model

        try:
            logger.info("Loading model...")

            if os.path.exists(MODEL_PATH):
                model = keras.models.load_model(MODEL_PATH)

            elif os.path.exists(MODEL_WEIGHTS_PATH) and os.path.exists(MODEL_CONFIG_PATH):
                with open(MODEL_CONFIG_PATH, "r", encoding="utf-8") as f:
                    model_config = json.load(f)

                model = keras.models.model_from_json(json.dumps(model_config))
                model.load_weights(MODEL_WEIGHTS_PATH)

            else:
                raise FileNotFoundError("Model files not found")

            logger.info("Model loaded successfully")
            return model

        except Exception as e:
            logger.error(f"Model loading failed: {e}")
            model = None
            return None

    @staticmethod
    def preprocess_image(image: Image.Image):

        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize((INPUT_SIZE, INPUT_SIZE), Image.Resampling.LANCZOS)

        img_array = np.array(image, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        return img_array


# ---------------- Startup ----------------
@app.on_event("startup")
async def startup_event():
    try:
        ModelManager.load_model()
        logger.info("Startup completed")
    except Exception as e:
        logger.error(f"Startup error: {e}")


# ---------------- Health ----------------
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "time": str(datetime.now())
    }


# ---------------- Detect ----------------
@app.post("/detect")
async def detect(file: UploadFile = File(...)):

    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        processed = ModelManager.preprocess_image(image)

        global model
        if model is None:
            model = ModelManager.load_model()

        if model is None:
            raise HTTPException(status_code=503, detail="Model not loaded")

        prediction = model.predict(processed, verbose=0)
        confidence = float(prediction[0][0])

        mask_detected = confidence > CONFIDENCE_THRESHOLD

        return {
            "success": True,
            "mask_detected": bool(mask_detected),
            "confidence": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 2),
            "threshold": CONFIDENCE_THRESHOLD,
            "time": str(datetime.now())
        }

    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------- Model Info ----------------
@app.get("/info")
def info():

    return {
        "model": "Face Mask Detector",
        "input_size": [INPUT_SIZE, INPUT_SIZE],
        "classes": ["No Mask", "Mask"],
        "framework": "TensorFlow/Keras"
    }


# ---------------- Root ----------------
@app.get("/")
def root():
    return {
        "message": "Face Mask Detection API Running",
        "docs": "/docs"
    }


# ---------------- Run ----------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)