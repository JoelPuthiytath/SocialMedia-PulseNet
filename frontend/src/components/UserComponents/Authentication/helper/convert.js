// image into base64/.
import pako from "pako";
// export default function convertTobase64(file) {
//   return new Promise((resolve, reject) => {
//     const fileReader = new FileReader();
//     fileReader.readAsDataURL(file);
//     fileReader.onload = () => {
//       resolve(fileReader.result);
//     };

//     fileReader.onerror = (error) => {
//       reject(error);
//     };
//   });
// }
// export default function convertTobase64(file, maxWidth, maxHeight) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     const fileReader = new FileReader();

//     fileReader.onload = (e) => {
//       img.onload = () => {
//         const canvas = document.createElement("canvas");
//         const ctx = canvas.getContext("2d");

//         // Adjust the canvas size based on the desired output size
//         const scaleFactor = Math.min(
//           maxWidth / img.width,
//           maxHeight / img.height
//         );

//         canvas.width = img.width * scaleFactor;
//         canvas.height = img.height * scaleFactor;

//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

//         resolve(canvas.toDataURL("image/jpeg"));
//       };

//       img.src = e.target.result;
//     };

//     fileReader.onerror = (error) => {
//       reject(error);
//     };

//     fileReader.readAsDataURL(file);
//   });
// }

export default function convertToBase64(file, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const minSize = Math.min(img.width, img.height);

        // Set canvas size to the specified size
        canvas.width = size;
        canvas.height = size;

        // Draw the image on the canvas
        ctx.drawImage(
          img,
          (img.width - minSize) / 2,
          (img.height - minSize) / 2,
          minSize,
          minSize,
          0,
          0,
          size,
          size
        );

        // Create a new canvas for the rounded image
        const roundedCanvas = document.createElement("canvas");
        const roundedCtx = roundedCanvas.getContext("2d");

        // Set the dimensions of the rounded canvas
        roundedCanvas.width = size;
        roundedCanvas.height = size;

        // Draw the rounded image on the new canvas
        roundedCtx.beginPath();
        roundedCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
        roundedCtx.closePath();
        roundedCtx.clip();
        roundedCtx.drawImage(canvas, 0, 0, size, size);

        // Resolve with the rounded image data URL
        resolve(roundedCanvas.toDataURL("image/jpeg"));
      };

      img.src = e.target.result;
    };

    fileReader.onerror = (error) => {
      reject(error);
    };

    fileReader.readAsDataURL(file);
  });
}
