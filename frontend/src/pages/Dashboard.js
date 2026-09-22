import React, { useEffect, useState } from 'react';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react';
import CityGrid from '../components/CityGrid';
import LoginButton from '../components/LoginButton';
import { fetchComfortScores } from '../services/api';

function Dashboard() {
  const { getAccessTokenSilently } = useAuth0();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchComfortScores(token);
        setCities(data);
      } catch (err) {
        setError('Failed to load weather data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [getAccessTokenSilently]);

  return (
    <div className="dashboard">
      <header>
        <h1>Weather Comfort Rankings</h1>
        <LoginButton />
      </header>

      {loading && <p>Loading weather data...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && <CityGrid cities={cities} />}
    </div>
  );
}

// Only logged-in users can reach this page; unauthenticated users are
// redirected to the Auth0 login screen automatically.
export default withAuthenticationRequired(Dashboard, {
  onRedirecting: () => <p>Redirecting to login...</p>,
});
