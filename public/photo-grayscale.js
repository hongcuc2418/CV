// Same luminance weights as the SVG preview's feColorMatrix.
export function grayscalePixels(pixels) {
  for (let i = 0; i < pixels.length; i += 4) {
    const gray = Math.round(
      0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2],
    );
    pixels[i] = pixels[i + 1] = pixels[i + 2] = gray;
  }
  return pixels;
}
export async function grayscalePhoto(source) {
  const response = await fetch(source);
  const bitmap = await createImageBitmap(await response.blob());
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context)
      throw Error(
        "Không tạo được ảnh đen trắng. Hãy thử lại hoặc tắt chế độ đen trắng.",
      );
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0);
    const frame = context.getImageData(0, 0, canvas.width, canvas.height);
    grayscalePixels(frame.data);
    context.putImageData(frame, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.94);
  } finally {
    bitmap.close();
  }
}
