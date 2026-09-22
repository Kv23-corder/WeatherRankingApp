const NodeCache = require('node-cache');

// stdTTL: 300 seconds = 5 minutes
const weatherCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Tracks the HIT/MISS outcome of the most recent lookup per city,
// used only by the /api/cache-status debug endpoint.
const cacheStatusLog = {};

function getCityCacheKey(cityCode) {
  return `weather_${cityCode}`;
}

function get(cityCode) {
  const key = getCityCacheKey(cityCode);
  const value = weatherCache.get(key);
  cacheStatusLog[cityCode] = value ? 'HIT' : 'MISS';
  return value;
}

function set(cityCode, data) {
  const key = getCityCacheKey(cityCode);
  weatherCache.set(key, data);
}

function getStatusLog() {
  return cacheStatusLog;
}

function getStats() {
  return weatherCache.getStats();
}

module.exports = { get, set, getStatusLog, getStats };
