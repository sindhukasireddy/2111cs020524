const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876; // Updated port
const WINDOW_SIZE = 10; // Window size
const API_BASE_URL = 'http://20.244.56.144/test/'; // Base URL for the test server

let storedNumbers = [];

app.use(express.json());

const fetchNumbers = async (type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}${type}`, { timeout: 500 }); // 500ms timeout
    return response.data.numbers;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timed out');
    } else {
      console.error('Error fetching numbers:', error);
    }
    return [];
  }
};

const calculateAverage = (numbers) => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return (sum / numbers.length).toFixed(2);
};

app.get('/numbers/:numberid', async (req, res) => {
  const numberId = req.params.numberid;
  if (!['p', 'f', 'e', 'r'].includes(numberId)) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  let newNumbers = await fetchNumbers(numberId);
  newNumbers = [...new Set(newNumbers)]; // Remove duplicates

  if (storedNumbers.length >= WINDOW_SIZE) {
    storedNumbers.shift(); // Remove oldest number
  }

  storedNumbers = [...new Set([...storedNumbers, ...newNumbers])]; // Add new numbers

  const windowPrevState = storedNumbers.slice(0, Math.max(storedNumbers.length - newNumbers.length, 0));
  const windowCurrState = storedNumbers;
  const avg = calculateAverage(windowCurrState);

  res.json({
    windowPrevState,
    windowCurrState,
    numbers: newNumbers,
    avg
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
