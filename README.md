😷 Face Mask Detection API

A FastAPI-based deep learning API that detects whether a person is wearing a face mask in an image using a trained Keras/TensorFlow model.

🚀 Features
Upload image and get mask detection result
Returns confidence score
Simple REST API with FastAPI
CORS enabled for frontend integration
Automatic model loading on startup
Health check & model info endpoints
🧠 Tech Stack
FastAPI
TensorFlow / Keras
NumPy
Pillow (PIL)
Uvicorn
📁 Project Structure
Face-Mask-Detection-AI/
│
├── backend/
│   ├── main.py              # FastAPI app (your code)
│   ├── face-mask.keras     # Saved model
│   ├── my-model.weights.h5 # Model weights (optional)
│   ├── config.json         # Model architecture config (optional)
│
├── requirements.txt
└── README.md
⚙️ Installation
1. Clone repository
git clone https://github.com/your-username/Face-Mask-Detection-Ai-Model.git
cd Face-Mask-Detection-Ai-Model
2. Create virtual environment
python -m venv venv
3. Activate environment

Windows:

venv\Scripts\activate

Mac/Linux:

source venv/bin/activate
4. Install dependencies
pip install -r requirements.txt
▶️ Run the API
uvicorn main:app --reload --port 8001
🌐 API Endpoints
🟢 Health Check
GET /health

Response:

{
  "status": "healthy",
  "model_loaded": true,
  "time": "2026-05-09 12:00:00"
}
🧠 Detect Mask
POST /detect

Form Data:

file → image file

Response:

{
  "success": true,
  "mask_detected": true,
  "confidence": 0.92,
  "confidence_percentage": 92.0,
  "threshold": 0.5,
  "time": "2026-05-09 12:00:00"
}
ℹ️ Model Info
GET /info
🏠 Root
GET /
🧪 Example (cURL)
curl -X POST "http://localhost:8000/detect" \
-F "file=@test.jpg"
🧠 Model Details
Input Size: 224 x 224
Framework: TensorFlow / Keras
Classes:
Mask 😷
No Mask ❌
Confidence threshold: 0.5
⚠️ Notes
Do NOT upload venv/ or large model binaries to GitHub
Use .gitignore properly
Model files should be handled carefully due to size
📌 Author

Built for Face Mask Detection using Deep Learning + FastAPI 🚀
