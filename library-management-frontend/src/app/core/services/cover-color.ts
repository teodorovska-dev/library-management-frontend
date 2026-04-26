import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoverColorService {
  private readonly fallbackColor = '#d8ddd2';

  extractDominantColor(imageUrl: string): Promise<string> {
    return new Promise(resolve => {
      if (!imageUrl) {
        resolve(this.fallbackColor);
        return;
      }

      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.src = imageUrl;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          resolve(this.fallbackColor);
          return;
        }

        canvas.width = 80;
        canvas.height = 120;

        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const color = this.getAverageColor(imageData);

        resolve(color);
      };

      image.onerror = () => resolve(this.fallbackColor);
    });
  }

  private getAverageColor(data: Uint8ClampedArray): string {
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = data[i + 3];

      if (alpha < 125) {
        continue;
      }

      const isTooWhite = r > 235 && g > 235 && b > 235;
      const isTooBlack = r < 25 && g < 25 && b < 25;

      if (isTooWhite || isTooBlack) {
        continue;
      }

      red += r;
      green += g;
      blue += b;
      count++;
    }

    if (count === 0) {
      return this.fallbackColor;
    }

    red = Math.round(red / count);
    green = Math.round(green / count);
    blue = Math.round(blue / count);

    return this.rgbToHex(red, green, blue);
  }

  private rgbToHex(red: number, green: number, blue: number): string {
    return '#' + [red, green, blue]
      .map(value => value.toString(16).padStart(2, '0'))
      .join('');
  }
}