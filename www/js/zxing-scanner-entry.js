import { BrowserCodeReader } from "@zxing/browser";
import { Code39Reader } from "@zxing/library";

const recoverableDecodeErrors = new Set([
  "NotFoundException",
  "ChecksumException",
  "FormatException"
]);

window.Code39Scanner = {
  async start(video, onResult, onError) {
    const reader = new BrowserCodeReader(new Code39Reader(), new Map(), {
      delayBetweenScanAttempts: 80,
      delayBetweenScanSuccess: 500
    });
    return reader.decodeFromStream(video.srcObject, video, (result, error) => {
      if (result) {
        onResult(result.getText());
      } else if (error && !recoverableDecodeErrors.has(error.getKind?.())) {
        onError(error);
      }
    });
  },

  async decodeImage(dataUrl) {
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
      image.src = dataUrl;
    });
    const reader = new BrowserCodeReader(new Code39Reader());
    const result = await reader.decodeFromImageElement(image);
    return result.getText();
  }
};
