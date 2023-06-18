import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const CACHE_KEY = 'TransactionData';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const TransactionData = () => {
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
          const response = await axios.get('https://api.dune.com/api/v1/query/2526230/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
          const rows = response.data.result.rows;
          // Format the Date strings
          const formattedRows = rows.map(row => {
            const date = new Date(row.Day).toISOString().split('T')[0]; // Keep only the YYYY-MM-DD part
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
    { dataKey: 'non_Odrdinal_Tx', strokeColor: '#20E3B2', label: 'Non-Ordinary ' },
    { dataKey: 'BRC20_Tx', strokeColor: '#E31B6D', label: 'BRC20' },
    { dataKey: 'non_BRC20_Ordi_Tx', strokeColor: '#F4E542', label: 'Non-BRC20 Ordinary' },
  ];

  return (
    <div>
      <CustomizedChart
        data={data}
        dataKeys={dataKeys}
        heading="Bitcoin & Ordinal transactions"
      />
    </div>
  );
};

export default TransactionData;
