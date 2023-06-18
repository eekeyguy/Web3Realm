import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const DuneDataChart = () => {
  const [data, setData] = useState([]);
  const windowWidth = window.innerWidth;

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem('duneData');
      const lastFetchTime = localStorage.getItem('lastFetchTime');
      const currentTime = new Date().getTime();

      // Fetch new data if not in cache or cache is older than 12 hours
      if (!cachedData || !lastFetchTime || currentTime - lastFetchTime > 6 * 60 * 60 * 1000) {
        const response = await axios.get('https://api.dune.com/api/v1/query/2192307/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
        let rows = response.data.result.rows;

        // Format the Date strings
        rows = rows.map(row => {
          const date = row.Date.split(' ')[0]; // Keep only the YYYY-MM-DD part
          return { ...row, Date: date };
        });
        localStorage.setItem('duneData', JSON.stringify(rows));
        localStorage.setItem('lastFetchTime', currentTime);
        setData(rows);
      } else {
        let cachedRows = JSON.parse(cachedData);
        // Format the Date strings
        cachedRows = cachedRows.map(row => {
          const date = row.Date.split(' ')[0]; // Keep only the YYYY-MM-DD part
          return { ...row, Date: date };
        });
        setData(cachedRows);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 20, color: '#CCCCCC' }}>
        Unique Buyers, Sellers and Traders per Day
      </h2>
      <div style={{ display: 'inline-block', marginLeft: 'auto', marginRight: 'auto' }}>
        <LineChart
          width={windowWidth - 100} // subtracting 100 to allow more margin on the sides
          height={500}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
          <XAxis
            dataKey="Date"
            stroke="#CCCCCC"
            tick={{ fill: '#CCCCCC' }}
          />
          <YAxis stroke="#CCCCCC" tick={{ fill: '#CCCCCC' }} />
          <Tooltip contentStyle={{ background: '#333333', borderColor: '#444444' }} itemStyle={{ color: '#CCCCCC' }} />
          <Legend wrapperStyle={{ color: '#CCCCCC' }} />
          <Line type="monotone" dataKey="Buyers" stroke="#20E3B2" activeDot={{ r: 3 }} dot={{ r: 1 }} />
          <Line type="monotone" dataKey="Sellers" stroke="#E31B6D" dot={{ r: 1 }} />
          <Line type="monotone" dataKey="Unique Traders" stroke="#F4E542" dot={{ r: 1 }} />
        </LineChart>
        </div>
      </div>
  );
};

export default DuneDataChart;
