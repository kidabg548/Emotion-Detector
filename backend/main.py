from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware  # Import CORSMiddleware
import torch
import cv2
import numpy as np
from ultralytics import YOLO

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:8000", # Add this line if your backend also serves content
    "http://localhost:5173",  # Add your React frontend's origin
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173", # React can also sometimes run here
    # "*", # ONLY FOR DEVELOPMENT - VERY INSECURE FOR PRODUCTION
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)


# Load trained YOLO model
model = YOLO("detect/train/weights/best.pt")  # Update with your model path

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model.predict(img)[0]  # Get the first result from list of results

    detections = []
    if results.boxes:
        boxes = results.boxes
        for i in range(len(boxes)):
            xyxy = boxes.xyxy[i].tolist()  # Bounding box coordinates (xmin, ymin, xmax, ymax)
            confidence = boxes.conf[i].item()  # Confidence score
            class_id = int(boxes.cls[i].item())  # Class ID
            name = results.names[class_id]  # Class name

            detections.append({
                "xmin": xyxy[0],
                "ymin": xyxy[1],
                "xmax": xyxy[2],
                "ymax": xyxy[3],
                "confidence": confidence,
                "class_id": class_id,
                "name": name
            })

    return {"detections": detections}

@app.get("/")
def home():
    return {"message": "YOLO Object Detection API is running!"}