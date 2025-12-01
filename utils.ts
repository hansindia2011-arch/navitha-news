// utils.ts

/**
 * Compresses an image file to a base64 data URL.
 * @param file The image file to compress.
 * @param maxWidth The maximum width for the output image. Height will be scaled proportionally.
 * @param quality The compression quality (0 to 1).
 * @returns A Promise that resolves with the compressed image as a base64 data URL.
 */
export function compressImage(file: File, maxWidth: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: ProgressEvent<FileReader>) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context.'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to base64 JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}


/**
 * Generates a random placeholder image as a base64 data URL.
 * @param width The width of the placeholder image.
 * @param height The height of the placeholder image.
 * @param text The text to display on the placeholder.
 * @returns A base64 data URL of the generated image.
 */
export function generateRandomPlaceholderImage(width: number, height: number, text: string = 'Placeholder'): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return '';
    }

    // Random background color
    ctx.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
    ctx.fillRect(0, 0, width, height);

    // Text
    ctx.font = `${Math.floor(height / 8)}px Arial`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);

    return canvas.toDataURL('image/png');
}