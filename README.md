# Weather Comfort Index

This is a full-stack weather analytics application. It fetches live weather data for a
list of cities, scores each city with a custom Comfort Index, and shows
the cities ranked from most comfortable to least comfortable. Access to
the dashboard is protected by Auth0 login with email-based MFA.

## What this project does

- Reads a list of cities from `cities.json`
- Fetches current weather for each city from the OpenWeatherMap API
- Calculates a Comfort Index score (0-100) for each city, using a formula
  I designed myself
- Ranks the cities from most comfortable to least comfortable
- Caches weather responses for 5 minutes so the app doesn't hit the
  OpenWeatherMap API on every request
- Only lets logged-in users see the dashboard (Auth0 + MFA)

## Tech stack

- **Frontend:** React
- **Backend:** Node.js + Express
- **Caching:** node-cache (in-memory, server-side)
- **Auth:** Auth0 (login, MFA, restricted signups)

## Project structure

```
weather-app/
├── backend/
│   ├── server.js                 # app entry point
│   ├── cities.json               # list of cities to fetch weather for
│   ├── routes/weather.js         # API endpoints
│   ├── services/weatherService.js # calls OpenWeatherMap, uses the cache
│   ├── services/comfortIndex.js  # the Comfort Index formula
│   ├── cache/cacheManager.js     # cache logic + HIT/MISS tracking
│   ├── middleware/authMiddleware.js # verifies the Auth0 token
│   └── tests/comfortIndex.test.js # unit tests for the formula
└── frontend/
    └── src/
        ├── components/           # CityCard, CityGrid, LoginButton
        ├── pages/Dashboard.js    # the protected dashboard page
        ├── services/api.js       # calls to the backend
        └── styles/App.css        # responsive styling
```

## Setup instructions

### 1. Backend

```bash
cd backend
npm install
cp .env
```

Open `.env` and fill in:

```
OPENWEATHER_API_KEY=your_openweathermap_api_key
PORT=5000
AUTH0_DOMAIN=your-tenant.us.auth0.com
AUTH0_AUDIENCE=https://your-api-audience
```

Then start it:

```bash
npm run dev
```

The backend runs on `http://localhost:5000`.

### 2. Frontend

Open a second terminal (the backend keeps running in the first one):

```bash
cd frontend
npm install
cp .env
```

Fill in `.env`:

```
REACT_APP_AUTH0_DOMAIN=your-tenant.us.auth0.com
REACT_APP_AUTH0_CLIENT_ID=your_client_id
REACT_APP_AUTH0_AUDIENCE=https://your-api-audience
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Then start it:

```bash
npm start
```

The frontend runs on `http://localhost:3000` and talks to the backend
automatically. Both servers need to be running at the same time, in two
separate terminals.

### 3. Auth0 setup

- Create an Application in Auth0 (type: Single Page Application) for the
  frontend, and set its Allowed Callback / Logout / Web Origin URLs to
  `http://localhost:3000`.
- Create an API in Auth0 with identifier `https://your-api-audience` (or
  whatever you set as `AUTH0_AUDIENCE`).
- Under that API's authorized applications, make sure your frontend
  application is authorized to request tokens for it.
- Turn on email-based MFA under Security -> Multi-factor Auth.
- Turn off public sign-ups under Authentication -> Database -> your
  connection, and add the test user manually under User Management.

## Testing

Run the unit tests for the Comfort Index formula:

```bash
cd backend
npm test
```

To check the cache is working, call the comfort-scores endpoint twice
within 5 minutes and confirm the second call shows `HIT`:

```bash
curl http://localhost:5000/api/cache-status
```

## The Comfort Index formula

I use four weather values: **temperature, humidity, wind speed, and
cloudiness**. Each one gets its own score from 0 to 100, based on how
close it is to what I consider an "ideal" value for that factor. Those
four scores are then combined into one final score using weights.

**Temperature score** - ideal point is 22C. The score drops by 4 points
for every degree away from that, in either direction.

**Humidity score** - ideal point is 50%. The score drops by 2 points for
every percentage point away from that.

**Wind score** - there's no ideal point here; more wind is simply less
comfortable. The score drops by 8 points for every 1 m/s of wind speed.

**Cloudiness score** - ideal point is 40% cloud cover (some shade,
without being fully overcast). The score drops by 1.5 points for every
percentage point away from that.

All four scores are clamped between 0 and 100, then combined like this:

```
comfortIndex = temperature * 0.4
             + humidity    * 0.3
             + wind        * 0.15
             + cloudiness  * 0.15
```

### Why these weights

Temperature and humidity are the two things people notice first when
they step outside, so they carry the most weight (40% and 30%). Wind and
cloudiness matter, but they're more of a secondary adjustment on top of
how hot or humid it already feels, so I gave them less weight (15% each).
The four weights add up to 1.0, so the result stays a proper 0-100 score.

### Trade-offs I considered

- I could have used more parameters (dew point, atmospheric pressure,
  visibility), but I kept it to four to keep the formula easy to reason
  about and explain.
- The "ideal" reference points (22C, 50% humidity, 40% cloud cover) are
  a general assumption about what most people find comfortable. They
  aren't tailored to any specific climate, so someone from a tropical
  country and someone from a cold country might disagree with where the
  ideal point should be.
- I chose linear penalties (a fixed number of points per unit) instead
  of anything more complex, because it's predictable and easy to verify
  by hand, even though real comfort probably isn't a straight line.

## Cache design

The backend caches each city's raw OpenWeatherMap response for 5 minutes,
keyed by city code. When a request comes in for a city's weather:

1. The cache is checked first.
2. If the data is there and hasn't expired, it's returned immediately -
   this counts as a cache **HIT**, and no external API call is made.
3. If it's missing or expired, the backend calls the OpenWeatherMap API,
   stores the result in the cache, and returns it - this counts as a
   **MISS**.

This keeps the app well within OpenWeatherMap's free-tier rate limits,
since repeated page loads or refreshes within the same 5 minutes don't
trigger new API calls. The `/api/cache-status` endpoint exists purely for
debugging, so you can see the HIT/MISS state per city without digging
through logs.

I chose an in-memory cache (`node-cache`) rather than something like
Redis, since this is a single-server assignment project - it's simpler
to set up and there's no need for the cache to survive a server restart
or be shared across multiple server instances.

## Known limitations

- The Comfort Index formula ignores dew point and atmospheric pressure.
- The "ideal" reference points are a general assumption, not tuned to
  any specific region or population.
- The cache is in-memory, so it resets every time the backend restarts,
  and it wouldn't work correctly if the backend were ever scaled to run
  as multiple instances behind a load balancer.
- The OpenWeatherMap free plan has rate limits, so fetching a large
  number of cities at once could still hit those limits if the cache
  were ever bypassed or cleared too often.
