import axios from 'axios';

export const generateQRCode = async (data: string): Promise<string> => {
  // Using a public QR code API
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
};

export const scanQRCode = async (imageUrl: string): Promise<string | null> => {
  try {
    const response = await axios.get(`https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(imageUrl)}`);
    return response.data[0]?.symbol[0]?.data || null;
  } catch (error) {
    console.error('QR Scan Error:', error);
    return null;
  }
};
