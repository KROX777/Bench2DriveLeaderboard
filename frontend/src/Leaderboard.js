// Leaderboard page component

import React, { useState, useEffect } from 'react';

import axios from 'axios';

import {

  useReactTable,

  getCoreRowModel,

  getSortedRowModel,

  flexRender,

} from '@tanstack/react-table';

import './AutodeskStyles.css';

function Leaderboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTrack, setActiveTrack] = useState('map');
  const [sorting, setSorting] = useState([]);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5001/api/leaderboard?track=${activeTrack}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data');
        setLoading(false);
      });
  }, [activeTrack]);

  const fetchLeaderboardData = () => {
    setLoading(true);
    axios.get(`http://localhost:5001/api/leaderboard?track=${activeTrack}`)
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data');
        setLoading(false);
      });
  };

  const columns = React.useMemo(
    () => [
      {
        accessorKey: 'rank',
        header: 'Rank',
        cell: info => {
          const rank = info.getValue();
          return (
            <div className="rank-cell">
              <span className="rank-number">#{rank}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'entry',
        header: 'Entry / Model',
        cell: info => (
          <div className="entry-cell">
            <div className="model-name">{info.getValue()}</div>
          </div>
        ),
      },
      {
        accessorKey: 'score',
        header: 'Score',
        cell: info => (
          <div className="score-cell">
            <span className="score-value">{info.getValue().toFixed(2)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'driving_score',
        header: 'Driving Score',
        cell: info => (
          <div className="metric-cell">
            {info.getValue().toFixed(2)}
          </div>
        ),
      },
      {
        accessorKey: 'route_completion',
        header: 'Route Completion',
        cell: info => (
          <div className="metric-cell">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${info.getValue()}%`}}
              ></div>
            </div>
            <span className="metric-value">{info.getValue().toFixed(1)}%</span>
          </div>
        ),
      },
      {
        accessorKey: 'infraction_penalty',
        header: 'Infraction Penalty',
        cell: info => (
          <div className="metric-cell">
            <span className={`penalty-value ${info.getValue() > 0 ? 'penalty-high' : 'penalty-low'}`}>
              {info.getValue().toFixed(2)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'submissions',
        header: 'Submissions',
        cell: info => (
          <div className="metric-cell">
            {info.getValue()}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) return (
    <div className="page-content">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="page-content">
      <div className="error-container">
        <h3>Data Loading Error</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  return (
    <div className="page-content">
      {/* Hero Section */}
      <div className="leaderboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Bench2Drive Leaderboard
          </h1>
          <p className="hero-subtitle">
            Discover top-performing autonomous driving models in our comprehensive benchmark
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">{data.length}</div>
              <div className="stat-label">Models</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">220</div>
              <div className="stat-label">Routes</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">2</div>
              <div className="stat-label">Tracks</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="circuit-pattern"></div>
        </div>
      </div>

      {/* Controls */}
      <div className="leaderboard-controls">
        <div className="track-selector">
          <button 
            className={`track-btn ${activeTrack === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTrack('map')}
          >
            Map Track
          </button>
          <button 
            className={`track-btn ${activeTrack === 'sensor' ? 'active' : ''}`}
            onClick={() => setActiveTrack('sensor')}
          >
            Sensor Track
          </button>
        </div>
        <button onClick={fetchLeaderboardData} className="refresh-btn" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Table */}
      <div className="leaderboard-table-container">
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: `header-cell ${header.column.getCanSort() ? 'sortable' : ''}`,
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          <span className="header-text">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="sort-icon">
                              {{
                                asc: '↑',
                                desc: '↓',
                              }[header.column.getIsSorted()] ?? '↕'}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr key={row.id} className={`table-row ${index < 3 ? 'top-three' : ''}`}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
