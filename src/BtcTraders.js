import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const CACHE_KEY = 'btcTradersData';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

const BtcTraders = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION) {
        // Use cached data if it exists and hasn't expired
        const parsedData = JSON.parse(cachedData);
        setData(parsedData);
      } else {
        const response = await axios.get('https://api.dune.com/api/v1/query/2617886/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
        let rows = response.data.result.rows;

        // Format the Date strings
        rows = rows.map(row => {
          const date = row.date.split('T')[0]; // Keep only the YYYY-MM-DD part
          return { ...row, date: date };
        });

        // Cache the fetched data
        localStorage.setItem(CACHE_KEY, JSON.stringify(rows));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());
        setData(rows);
      }
    };

    fetchData();
  }, []);

  const dataKeys = [
    { dataKey: 'total_buyers', strokeColor: '#20E3B2', label: 'Buyers' },
    { dataKey: 'total_sellers', strokeColor: '#E31B6D', label: 'Sellers' },
    { dataKey: 'total_traders', strokeColor: '#F4E542', label: 'Traders' }
  ];

  return (
    <CustomizedChart
      data={data}
      dataKeys={dataKeys}
      heading="Bitcoin NFTs: Buyers, Sellers and Traders"
    />
  );
};

export default BtcTraders;
