const {
  calculateComfortIndex,
  scoreTemperature,
  scoreHumidity,
  scoreWind,
  scoreCloudiness,
} = require('../services/comfortIndex');

describe('scoreTemperature', () => {
  test('returns 100 at the ideal temperature (22C)', () => {
    expect(scoreTemperature(22)).toBe(100);
  });

  test('decreases as temperature moves away from ideal', () => {
    expect(scoreTemperature(30)).toBeLessThan(scoreTemperature(25));
  });

  test('never goes below 0', () => {
    expect(scoreTemperature(80)).toBe(0);
  });
});

describe('scoreHumidity', () => {
  test('returns 100 at 50% humidity', () => {
    expect(scoreHumidity(50)).toBe(100);
  });

  test('penalizes very high humidity', () => {
    expect(scoreHumidity(95)).toBeLessThan(scoreHumidity(55)); // 95-50=45*2=90 -> 10; 55-50=5*2=10 -> 90
  });
});

describe('scoreWind', () => {
  test('returns 100 at zero wind speed', () => {
    expect(scoreWind(0)).toBe(100);
  });

  test('never goes below 0 for very high wind', () => {
    expect(scoreWind(50)).toBe(0);
  });
});

describe('scoreCloudiness', () => {
  test('returns 100 at 40% cloud cover', () => {
    expect(scoreCloudiness(40)).toBe(100);
  });
});

describe('calculateComfortIndex', () => {
  test('returns a value between 0 and 100 for a mild sample', () => {
    const sample = {
      main: { temp: 22, humidity: 50 },
      wind: { speed: 0 },
      clouds: { all: 40 },
    };
    const score = calculateComfortIndex(sample);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBe(100); // all factors at their ideal point
  });

  test('scores a hot, humid, windy city lower than a mild city', () => {
    const hotHumid = {
      main: { temp: 38, humidity: 90 },
      wind: { speed: 12 },
      clouds: { all: 90 },
    };
    const mild = {
      main: { temp: 23, humidity: 55 },
      wind: { speed: 1 },
      clouds: { all: 35 },
    };
    expect(calculateComfortIndex(hotHumid)).toBeLessThan(calculateComfortIndex(mild));
  });

  test('matches the sample response shape from the assignment PDF', () => {
    // Based on the Cairns sample response in the assignment document
    const sample = {
      main: { temp: 25.97, humidity: 73 }, // 299.12K converted to Celsius
      wind: { speed: 2.57 },
      clouds: { all: 100 },
    };
    const score = calculateComfortIndex(sample);
    expect(typeof score).toBe('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
