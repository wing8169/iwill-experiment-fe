importScripts("./jsqr/dist/jsQR.js");
// import jsQR from "jsqr";

self.addEventListener("message", (e) => {
  const { data, width, height } = e.data;
  // perform QR scanning
  const qrData = jsQR(data.data, width, height);
  // post message
  self.postMessage(qrData);
});
