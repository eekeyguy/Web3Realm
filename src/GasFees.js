import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChartDualAxis from './CustomizedChartDualAxis';

const CACHE_KEY = 'GasFees';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const GasFees = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION) {
        // Use cached data if it exists and hasn't expired
        setData(JSON.parse(cachedData));
      } else {
        try {
          const response = await axios.get('https://api.dune.com/api/v1/query/2632688/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
          const rows = response.data.result.rows;

          // Format the Date strings
          const formattedRows = rows.map(row => {
            const date = new Date(row.time).toISOString().split('T')[0]; // Keep only the YYYY-MM-DD part
            return { ...row, date: date };
          });

          // Cache the fetched data
          localStorage.setItem(CACHE_KEY, JSON.stringify(formattedRows));
          localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());

          setData(formattedRows);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  const dataKeysLeft = [
    { dataKey: 'ethereum_gas_usd', strokeColor: '#E31B6D' , label: 'Ethereum Gas (USD)' }
  ];

  const dataKeysRight = [
    { dataKey: 'polygon_gas_usd', strokeColor: '#20E3B2', label: 'Polygon Gas (USD)' }
  ];

  return (
    <CustomizedChartDualAxis
      data={data}
      dataKeysLeft={dataKeysLeft}
      dataKeysRight={dataKeysRight}
      heading="Ethereum & Polygon : Average Gas Per Transaction"
    />
  );
};

export default GasFees;
