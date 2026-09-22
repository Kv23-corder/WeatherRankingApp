function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function scoreTemperature(tempCelsius) {
  // Ideal point: 22C. Score drops 4 points per degree away from it.
  return clamp(100 - Math.abs(tempCelsius - 22) * 4, 0, 100);
}

function scoreHumidity(humidityPercent) {
  // Ideal band: around 50%. Score drops 2 points per % away from it.
  return clamp(100 - Math.abs(humidityPercent - 50) * 2, 0, 100);
}

function scoreWind(windSpeedMs) {
  // Higher wind speed reduces comfort steadily.
  return clamp(100 - windSpeedMs * 8, 0, 100);
}

function scoreCloudiness(cloudPercent) {
  // Ideal point: 40% cloud cover (some shade, not fully overcast).
  return clamp(100 - Math.abs(cloudPercent - 40) * 1.5, 0, 100);
}

/**
 * Computes the 0-100 Comfort Index Score for a single OpenWeatherMap
 * "current weather" response object.
 */
function calculateComfortIndex(weatherData) {
  const tempScore = scoreTemperature(weatherData.main.temp);
  const humidityScore = scoreHumidity(weatherData.main.humidity);
  const windScore = scoreWind(weatherData.wind.speed);
  const cloudScore = scoreCloudiness(weatherData.clouds.all);

  const comfortIndex =
    tempScore * 0.4 +
    humidityScore * 0.3 +
    windScore * 0.15 +
    cloudScore * 0.15;

  return Math.round(comfortIndex);
}

module.exports = {
  calculateComfortIndex,
  scoreTemperature,
  scoreHumidity,
  scoreWind,
  scoreCloudiness,
};
