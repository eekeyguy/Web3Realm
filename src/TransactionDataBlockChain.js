import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const CACHE_KEY = 'TransactionDataBlockChain';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const TransactionDataBlockChain = () => {
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
          const response = await axios.get('https://api.dune.com/api/v1/query/2632324/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
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

  const dataKeys = [
    { dataKey: 'ethereum_transactions', strokeColor: '#20E3B2', label: 'Ethereum' },
    { dataKey: 'polygon_transactions', strokeColor: '#E31B6D', label: 'Polygon' },
    { dataKey: 'arbitrum_transactions', strokeColor: '#F4E542', label: 'Arbitrum' },
    { dataKey: 'optimism_transactions', strokeColor: '#F27935', label: 'Optimism' },
  ];

  return (
    <CustomizedChart
    data={data}
    dataKeys={dataKeys}
    heading="Ethereum & L2 transactions"/>
      );
};

export default TransactionDataBlockChain;
