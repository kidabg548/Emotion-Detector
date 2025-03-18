# AI-Powered Emotion Detection System

This project is an AI-powered Emotion Detection System consisting of a FastAPI backend and a React (Vite) frontend. The backend uses YOLO (You Only Look Once) for object detection and runs on FastAPI, while the frontend is a modern React app that allows users to upload images and receive real-time detection results. The system processes images, detects emotions, and returns labeled bounding boxes around detected faces. It is designed for speed, accuracy, and ease of use, making it suitable for emotion analysis and real-time applications. The backend is deployed on Render, while the frontend is hosted on Vercel.

## Frontend Setup

This section guides you through setting up and running the React frontend for the Emotion Detection System.

1.  **Clone the repository**

    First, clone the frontend repository from GitHub:

    ```sh
    git clone https://github.com/kidabg548/Emotion-Detector.git
    ```

2.  **Navigate to the project directory**

    Change your current directory to the `face-emotion-detection` folder:

    ```sh
    cd face-emotion-detection
    ```

3.  **Navigate to the frontend directory**

    Change your current directory to the `face-emotion-detection` folder:

    ```sh
    cd frontend
    ```

4.  **Install the dependencies**

    Install all required npm packages using:

    ```sh
    npm install
    ```

    This command reads the `package.json` file and installs all listed dependencies, including React, Vite, and other necessary libraries.

4.  **Run the development server**

    Start the React development server using:

    ```sh
    npm run dev
    ```

    This command starts the Vite development server, which typically runs on `http://localhost:5173`. The server provides hot-reloading, so changes in the code will be automatically reflected in the browser.

5.  **Accessing the Application**

    Once the development server is running, open your web browser and navigate to the address provided by the command line (usually `http://localhost:5173`). You should now see the Emotion Detection frontend.

## Backend Guide: YOLO Object Detection API (FastAPI)

This is a FastAPI-based backend for real-time object detection using the YOLO model.

### Features

*   Upload images and detect objects with bounding boxes.
*   Uses **YOLO** for object detection.
*   FastAPI for the backend.
*   CORS support for frontend integration.

### Requirements

*   Python 3.8+
*   FastAPI
*   Uvicorn
*   PyTorch
*   OpenCV
*   NumPy
*   Ultralytics YOLO

### Installation

1.  **Clone the repository**

    ```sh
    git clone https://github.com/kidabg548/Emotion-Detector.git
    ```

2.  **Navigate to the project directory**

    ```sh
    cd face-emotion-detection
    ```

3.  **Navigate to the backend directory**

    ```sh
    cd backend
    ```

4.  **Create a virtual environment (recommended)**

    ```sh
    python -m venv .venv
    ```

5.  **Activate the virtual environment**

    *   **Linux/macOS:**

        ```sh
        source .venv/bin/activate
        ```

    *   **Windows:**

        ```sh
        .venv\Scripts\activate
        ```

6.  **Install the dependencies**

    ```sh
    pip install -r requirements.txt
    ```

### Running the API

```sh
uvicorn main:app --reload
