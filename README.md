# YOLO Object Detection API (FastAPI)

This is a FastAPI-based backend for real-time object detection using the YOLO model.

## Features

*   Upload images and detect objects with bounding boxes.
*   Uses **YOLO** for object detection.
*   FastAPI for the backend.
*   CORS support for frontend integration.

## Requirements

*   Python 3.8+
*   FastAPI
*   Uvicorn
*   PyTorch
*   OpenCV
*   NumPy
*   Ultralytics YOLO

## Installation

1.  **Clone the repository**

    ```sh
    git clone https://github.com/your-username/your-backend-repo.git
    cd your-backend-repo
    ```

2.  **Create a virtual environment (recommended)**

    ```sh
    python -m venv .venv
    ```

3.  **Activate the virtual environment**

    *   **Linux/macOS:**

        ```sh
        source .venv/bin/activate
        ```

    *   **Windows:**

        ```sh
        .venv\Scripts\activate
        ```

4.  **Install the dependencies**

    ```sh
    pip install -r requirements.txt
    ```

## Configuration

*   **YOLO Model Path:** The path to your YOLO model (`best.pt` or another model file).  You can set this using the `MODEL_PATH` environment variable (see Deployment section) or by modifying the `MODEL_PATH` variable in `main.py`.

## Running the API

```sh
uvicorn main:app --reload
