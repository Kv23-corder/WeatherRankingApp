import React from 'react';
import CityCard from './CityCard';

function CityGrid({ cities }) {
  if (!cities || cities.length === 0) {
    return <p>No weather data available.</p>;
  }

  return (
    <div className="city-grid">
      {cities.map((c) => (
        <CityCard
          key={c.city}
          city={c.city}
          description={c.description}
          temperature={c.temperature}
          comfortScore={c.comfortScore}
          rank={c.rank}
        />
      ))}
    </div>
  );
}

export default CityGrid;
