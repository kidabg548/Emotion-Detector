import React, { useState, useCallback, useRef, useEffect } from "react";
import { Camera, Upload, AlertCircle, RefreshCw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios"; // Import axios

type EmotionType =
  | "Happy"
  | "Neutral"
  | "Surprised"
  | "Sad"
  | "Angry"
  | "Disgust"
  | "Fear";

interface EmotionData {
  emotion: EmotionType;
  color: string;
  percentage: string;
  box?: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
  };
}

const EmotionDetector = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<EmotionData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null); // Ref for the displayed image

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImage(URL.createObjectURL(file));
        setError(null);
        setPrediction(null);
        // console.log("uploaded file",file)
      }
    },
    []
  );

  const handleTakePicture = useCallback(() => {
    setIsCameraOpen(true);
  }, []);

  const captureImageFromCamera = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl);
      setIsCameraOpen(false);
      setPrediction(null);
    }
  }, []);

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  const resetDetection = () => {
    setImage(null);
    setPrediction(null);
    setError(null);
  };

  const detectEmotions = async () => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    if (!image) {
      setError("Please upload or take a picture first.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();

      // Convert the data URL to a File object
      const response = await fetch(image);
      const blob = await response.blob();
      const file = new File([blob], "image.jpg", { type: "image/jpeg" });

      formData.append("file", file);

      const API_URL =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
          ? "http://127.0.0.1:8000"
          : "https://emotion-detector-1-bhg7.onrender.com";

      const result = await axios.post(`${API_URL}/predict/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const detections = result.data.detections;
      console.log("detections", detections);

      // Process detections into EmotionData format, using the backend response
      const processedPredictions: EmotionData[] = detections.map(
        (detection: any) => {
          let emotion: EmotionType = "Neutral"; // Default
          let color = "bg-gray-500"; // Default

          const percentage = (detection.confidence * 100).toFixed(2) + "%";

          // Mapping based on `name` from backend, NOT `class_id` (as `name` is more readable)
          if (detection.name === "happy") {
            // Use detection.name
            emotion = "Happy";
            color = "bg-green-500";
          } else if (detection.name === "surprise") {
            // Use detection.name
            emotion = "Surprised";
            color = "bg-purple-500";
          } else if (detection.name === "sad") {
            emotion = "Sad";
            color = "bg-red-500";
          } else if (detection.name === "angry") {
            emotion = "Angry";
            color = "bg-yellow-500";
          } else if (detection.name === "disgust") {
            emotion = "Disgust";
            color = "bg-orange-500";
          } else if (detection.name === "fear") {
            emotion = "Fear";
            color = "bg-gray-700";
          } else {
            emotion = "Neutral"; // Default if no match
            color = "bg-gray-500";
          }

          return {
            emotion,
            color,
            percentage,
            box: {
              // Store bounding box coordinates
              xmin: detection.xmin,
              ymin: detection.ymin,
              xmax: detection.xmax,
              ymax: detection.ymax,
            },
          };
        }
      );

      setPrediction(processedPredictions);
    } catch (err: any) {
      console.error("Error during prediction:", err);
      setError("Failed to analyze image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        setError("Failed to access camera. Please check your permissions.");
      }
    }

    if (isCameraOpen) {
      enableCamera();
    } else if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [isCameraOpen]);

  const drawBoundingBoxes = useCallback(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !prediction) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image on the canvas
    ctx.drawImage(img, 0, 0, img.width, img.height);

    // Draw bounding boxes
    prediction.forEach((item) => {
      if (item.box) {
        const { xmin, ymin, xmax, ymax } = item.box;

        // Draw rectangle
        ctx.strokeStyle = item.color; // Use color associated with the emotion
        ctx.lineWidth = 3;
        ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin);

        // Draw label
        ctx.fillStyle = item.color;
        ctx.font = "16px sans-serif";
        const label = `${item.emotion} (${item.percentage})`;
        ctx.fillText(label, xmin, ymin - 5);
      }
    });
  }, [prediction]);

  useEffect(() => {
    if (image && prediction) {
      drawBoundingBoxes();
    }
  }, [image, prediction, drawBoundingBoxes]); // Trigger redraw on image or prediction change

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Object Detection
          </h1>
          <p className="text-gray-600 text-lg">
            Upload a photo or take a picture to detect objects instantly
          </p>
        </motion.div>

        <div className="bg-white rounded-3xl p-8 shadow-xl backdrop-blur-lg bg-opacity-90">
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 transition-all duration-300 bg-gradient-to-br from-blue-50 to-purple-50 group"
              >
                <div className="flex flex-col items-center justify-center p-8 group-hover:transform group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-12 h-12 mb-4 text-blue-500 group-hover:text-blue-600" />
                  <p className="mb-2 text-lg text-gray-600">
                    <span className="font-semibold text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG or JPEG (MAX. 2MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </motion.label>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleTakePicture}
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer hover:border-purple-400 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 group"
              >
                <Camera className="w-12 h-12 mb-4 text-purple-500 group-hover:text-purple-600 transition-colors duration-300" />
                <p className="text-lg text-gray-600 group-hover:text-purple-600 transition-colors duration-300">
                  Take a Picture
                </p>
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {isCameraOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6 relative rounded-2xl overflow-hidden shadow-xl w-96 mx-auto"
              >
                <video
                  ref={videoRef}
                  autoPlay
                  className="w-full h-full object-cover rounded-2xl"
                ></video>
                <canvas ref={canvasRef} className="hidden"></canvas>
                <div className="absolute top-4 right-4 space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={captureImageFromCamera}
                    className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg text-lg"
                  >
                    Capture
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={closeCamera}
                    className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg text-lg"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {image && !isCameraOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-xl max-w-md mx-auto">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    ref={imageRef} // Attach the ref to the image
                    onLoad={() => {
                      if (prediction) {
                        drawBoundingBoxes(); // Draw boxes once the image is loaded
                      }
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none", // Ensure canvas doesn't block image interaction
                    }}
                  />

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={resetDetection}
                    className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all duration-300 shadow-lg"
                  >
                    <RefreshCw className="w-6 h-6 text-gray-700" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!image || isLoading}
              onClick={detectEmotions}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300 flex items-center space-x-3 text-lg"
            >
              <Sparkles className="w-6 h-6" />
              <span>{isLoading ? "Analyzing..." : "Detect Objects"}</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {prediction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-xl"
              >
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">
                  Analysis Results
                </h3>
                <div className="space-y-5">
                  {prediction.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center"
                    >
                      <div className="w-28 text-lg font-medium text-gray-700">
                        {item.emotion}
                      </div>
                      <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: item.percentage }}
                          transition={{ duration: 0.7, delay: index * 0.1 }}
                          className={`h-full ${item.color}`}
                        />
                      </div>
                      <div className="w-20 text-right text-lg font-medium text-gray-700">
                        {item.percentage}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-5 p-5 bg-red-50 text-red-700 rounded-2xl flex items-center shadow-md"
              >
                <AlertCircle className="w-6 h-6 mr-3 text-red-500" />
                <span className="text-lg">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Analysis",
              description:
                "Get instant emotion detection results within seconds",
              icon: "⚡",
            },
            {
              title: "High Accuracy",
              description: "Advanced AI model trained on diverse datasets",
              icon: "🎯",
            },
            {
              title: "Multiple Emotions",
              description: "Detect various emotions with confidence scores",
              icon: "🎭",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5 }}
              className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-lg bg-opacity-90"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmotionDetector;
