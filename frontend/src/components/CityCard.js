import React from 'react';

function CityCard({ city, description, temperature, comfortScore, rank }) {
  return (
    <div className="city-card">
      <span className="rank">#{rank}</span>
      <h2>{city}</h2>
      <p className="description">{description}</p>
      <p className="temperature">{Math.round(temperature)}°C</p>
      <div className="score">{comfortScore}/100</div>
    </div>
  );
}

export default CityCard;
