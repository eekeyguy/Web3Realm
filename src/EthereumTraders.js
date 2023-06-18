import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const EthereumTraders = () => {
  const [data, setData] = useState([]);

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
          return { ...row, date: date };
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

  const dataKeys = [
    { dataKey: 'Buyers', strokeColor: '#20E3B2', label: 'Buyers' },
    { dataKey: 'Sellers', strokeColor: '#E31B6D', label: 'Sellers' },
    { dataKey: 'Unique Traders', strokeColor: '#F4E542', label: 'Traders' },
  ];

  return (
    <CustomizedChart
      data={data}
      dataKeys={dataKeys}
      heading="Ethereum NFTs: Buyers, Sellers and Traders"
    />
  );
};

export default EthereumTraders;
