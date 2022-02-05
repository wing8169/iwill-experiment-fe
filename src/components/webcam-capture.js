import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";

export const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [qrCodeData, setQrCodeData] = useState("");

  // convert base64 image to ImageData by using canvas 2D context getImageData method
  const imgToImageData = (dataUri) => {
    const canvas = document.querySelector("canvas");
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
      setQrCodeData(code.data);
    } else {
      setQrCodeData("");
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
      <canvas width="640" height="480" hidden={true} />
    </div>
  );
};
