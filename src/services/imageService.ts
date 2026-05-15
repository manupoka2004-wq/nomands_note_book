export const getPlaceImage = (type: 'hotel' | 'restaurant', seed: string) => {
  const hotelPhotos = [
    '1566073771259-6a8506099945',
    '1582719478250-c89cae4dd85b',
    '1542314831-068cd1dbfeeb',
    '1571896349842-33c89424de2d',
    '1564501049412-61c253912161'
  ];
  
  const restaurantPhotos = [
    '1517248135467-4c7edcad34c4',
    '1552566626-52f8b828add9',
    '1414235077428-338989a2e8c0',
    '1555396273-367ea4eb4db5',
    '1514933651103-005eec06c04b'
  ];

  const photos = type === 'hotel' ? hotelPhotos : restaurantPhotos;
  const photoId = photos[Math.abs(seed.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % photos.length];
  
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=800&q=80`;
};
