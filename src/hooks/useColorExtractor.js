import { useState, useEffect } from 'react';

const useColorExtractor = (imageUrl) => {
  const [dominantColor, setDominantColor] = useState('rgba(34, 211, 238, 0.2)');

  useEffect(() => {
    if (!imageUrl || imageUrl.startsWith('linear-gradient')) {
      setDominantColor('rgba(34, 211, 238, 0.2)');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 10; // downsizing for speed
      canvas.height = 10;
      
      ctx.drawImage(img, 0, 0, 10, 10);
      const imageData = ctx.getImageData(0, 0, 10, 10).data;
      
      let r = 0, g = 0, b = 0;
      for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
      }
      
      const count = imageData.length / 4;
      const avgR = Math.round(r / count);
      const avgG = Math.round(g / count);
      const avgB = Math.round(b / count);
      
      setDominantColor(`rgba(${avgR}, ${avgG}, ${avgB}, 0.25)`);
    };

    img.onerror = () => {
      console.warn("Color extraction failed for image:", imageUrl);
      setDominantColor('rgba(34, 211, 238, 0.15)');
    };

  }, [imageUrl]);

  return dominantColor;
};

export default useColorExtractor;
