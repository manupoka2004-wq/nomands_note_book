export const estimatePrice = (type: 'hotel' | 'restaurant') => {
  if (type === 'hotel') {
    // ₹800 – ₹4000 per night
    return 800 + Math.floor(Math.random() * 3200);
  } else {
    // ₹200 – ₹1000 per person
    return 200 + Math.floor(Math.random() * 800);
  }
};

export const generateRating = () => {
  return parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
};
