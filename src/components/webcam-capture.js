import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

export const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("No QR Code Found.");
  const [qrCodeData2, setQrCodeData2] = useState("No QR Code Found.");

  // initialize worker in background
  const qrWorker = new Worker("./workers/qr-worker.js");

  // convert base64 image to ImageData by using canvas 2D context getImageData method
  const imgToImageData = (dataUri) => {
    const canvas = document.getElementById("screenshotCanvas");
    const ctx = canvas.getContext("2d");

    const image = new Image();
    image.src = dataUri;
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      var imageData = ctx.getImageData(0, 0, 640, 480);
      setImgData(imageData);
    };
  };

  // convert base64 image to ImageData
  useEffect(() => {
    if (!imgSrc) return; // skip if no image was captured
    imgToImageData(imgSrc);
  }, [imgSrc]);

  // Read QR code using the jsQR library
  useEffect(() => {
    if (!imgData || !imgData.data) return; // skip if no image data

    const code = jsQR(imgData.data, 640, 480);

    if (code && code.data) {
      setQrCodeData("QR Code Found: " + code.data);
    } else {
      setQrCodeData("No QR Code Found.");
    }
  }, [imgData]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 50,
      }}
    >
      <h3>QR Code Scanning by Taking Pictures</h3>
      <Webcam
        width={640}
        height={480}
        ref={webcamRef}
        screenshotFormat="image/png"
        onUserMedia={(streamData) => {
          const track = streamData.getVideoTracks()[0];
          const trackSetting = track.getSettings();
          const canvas = document.getElementById("videoCanvas");
          canvas.height = trackSetting.height;
          canvas.width = trackSetting.width;
          const canvasContext = canvas.getContext("2d");

          // draw stream on a video element
          const video = document.getElementById("video");
          video.srcObject = streamData;
          video.play();

          // action when message is received
          qrWorker.addEventListener("message", ({ data }) => {
            if (data) {
              // Data from QR code available
              //
              // Handle a successful scan here.
              if (data && data.data) {
                setQrCodeData2("QR Code Found: " + data.data);
              } else {
                setQrCodeData2("No QR Code Found.");
              }
              tick();
            } else {
              // No QR code detected in this frame
              //
              // Feed the next frame to the QR worker
              // now (this code is introduced below).
              setQrCodeData2("No QR Code Found.");
              tick();
            }
          });

          // post message to qr worker
          const updateJsQr = () => {
            canvasContext.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvasContext.getImageData(
              0,
              0,
              canvas.width,
              canvas.height
            );
            qrWorker.postMessage({
              data: imageData,
              height: canvas.height,
              width: canvas.width,
            });
          };

          // trigger updateJsQr function
          const tick = () => requestAnimationFrame(updateJsQr);

          tick();
        }}
      />
      <button
        style={{
          marginTop: 30,
          width: 200,
        }}
        onClick={() => {
          // take screenshot
          const imageSrc = webcamRef?.current?.getScreenshot();
          setImgSrc(imageSrc);
        }}
      >
        Capture photo
      </button>
      <div
        style={{
          marginTop: 30,
          display: "flex",
          alignItems: "center",
        }}
      >
        {imgSrc && (
          <img src={imgSrc} width={200} height={200} alt="Screenshot" />
        )}
        <p
          style={{
            marginLeft: 20,
          }}
        >
          {qrCodeData}
        </p>
      </div>
      <canvas id="screenshotCanvas" width="640" height="480" hidden={true} />
      <canvas id="videoCanvas" width="640" height="480" hidden={true} />
      <h3>QR Code Scanning by Real Time Video</h3>
      <video id="video" width="640" height="480" />
      <p
        style={{
          marginTop: 20,
        }}
      >
        {qrCodeData2}
      </p>
    </div>
  );
};
