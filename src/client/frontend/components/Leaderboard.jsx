import React, { useState, useEffect } from 'react';

const Leaderboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://${window.location.hostname}:3004/leaderboard`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        // sort descending by score
        const sorted = result.sort((a, b) => b[1] - a[1]);
        setData(sorted);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading leaderboard…</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={{ padding: '10px' }}>
      <h1>Leaderboard</h1>
      <ol>
        {data.map(([username, score], index) => (
          <li key={index} style={{ marginBottom: '5px' }}>
            <strong>{username}</strong> — {score} pts
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;