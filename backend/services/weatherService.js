const axios = require('axios');
const cacheManager = require('../cache/cacheManager');

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetches weather data for a single city, using the cache first.
 * Only calls the real OpenWeatherMap API on a cache miss.
 */
async function getWeatherForCity(cityCode) {
  const cached = cacheManager.get(cityCode);
  if (cached) {
    return cached;
  }

  const url = `${BASE_URL}?id=${cityCode}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
  const response = await axios.get(url);
  cacheManager.set(cityCode, response.data);
  return response.data;
}

/**
 * Fetches weather for a list of cities in parallel.
 * Each city is {CityCode, CityName}.
 */
async function getWeatherForCities(cities) {
  return Promise.all(
    cities.map(async (city) => {
      const data = await getWeatherForCity(city.CityCode);
      return { cityName: city.CityName, weather: data };
    })
  );
}

module.exports = { getWeatherForCity, getWeatherForCities };
