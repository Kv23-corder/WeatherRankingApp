const express = require("express");
const router = express.Router();

const citiesData = require("../cities.json");
const cities = citiesData.List;
const weatherService = require("../services/weatherService");
const { calculateComfortIndex } = require("../services/comfortIndex");
const cacheManager = require("../cache/cacheManager");
const { checkJwt } = require("../middleware/authMiddleware");

// Set REQUIRE_AUTH=false in your environment while doing local testing
// without an Auth0 token. Keep it true for the real submission.
const authGuard =
  process.env.REQUIRE_AUTH === "false" ? (req, res, next) => next() : checkJwt;

// GET /api/comfort-scores
// Returns every city's weather, its Comfort Index score, and its rank,
//sorted from most comfortable to least comfortable.

router.get("/comfort-scores", authGuard, async (req, res) => {
  try {
    const results = await weatherService.getWeatherForCities(cities);

    const scored = results.map(({ cityName, weather }) => ({
      city: cityName,
      description: weather.weather[0].description,
      temperature: weather.main.temp,
      comfortScore: calculateComfortIndex(weather),
    }));

    scored.sort((a, b) => b.comfortScore - a.comfortScore);
    scored.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json(scored);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

//  GET /api/cache-status
//  Debug endpoint showing HIT/MISS for the last lookup of each city,
//  plus overall cache stats.

router.get("/cache-status", (req, res) => {
  res.json({
    perCity: cacheManager.getStatusLog(),
    stats: cacheManager.getStats(),
  });
});

module.exports = router;
