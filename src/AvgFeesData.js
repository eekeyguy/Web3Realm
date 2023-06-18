import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';


const CACHE_KEY = 'AvgFeeData';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000 ; // 6 hours in milliseconds

const AvgFeesData = () => {
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
          const response = await axios.get('https://api.dune.com/api/v1/query/2643482/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
          const rows = response.data.result.rows;

          // Format the Date strings
          const formattedRows = rows.map(row => {
            const date =row.day.split(' ')[0]; // Keep only the YYYY-MM-DD part
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
      { dataKey: 'avg_fee_per_transactions', strokeColor: '#20E3B2', label: 'BTC fees (USD)' },
    ];

    return (
      <CustomizedChart
        data={data}
        dataKeys={dataKeys}
        heading="Bitcoin : Average Fees Per Transaction"
      />
    );
};

export default AvgFeesData;
