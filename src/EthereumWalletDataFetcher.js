import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const EthereumWalletDataFetcher = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const lastFetchTime = localStorage.getItem('walletLastFetchTime');
      const currentTime = new Date().getTime();

      // Check if data is in cache and less than 6 hours old
      if (lastFetchTime && currentTime - lastFetchTime < 6 * 60 * 60 * 1000) {
        const cachedData = localStorage.getItem('walletCachedData');
        if (cachedData) {
          setData(JSON.parse(cachedData));
          return;
        }
      }

      // Fetch new data
      const response = await axios.get("https://api.dune.com/api/v1/query/2644593/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ");
      let rows = response.data.result.rows;

      // Format the Date strings
      rows = rows.map(row => {
        const date = row.time.split(' ')[0]; // Keep only the YYYY-MM-DD part
        return { ...row, date: date };
      });

      // Update state with new data
      setData(rows);

      // Update cache with new data and current time
      localStorage.setItem('walletCachedData', JSON.stringify(rows));
      localStorage.setItem('walletLastFetchTime', currentTime);
    };

    fetchData();
  }, []);

  const dataKeys = [
    { dataKey: 'ethereum_addresses', strokeColor: '#20E3B2', label: 'Ethereum' },
        { dataKey: 'polygon_addresses', strokeColor: '#E31B6D', label: 'Polygon' },
        { dataKey: 'arbitrum_addresses', strokeColor: '#F4E542', label: 'Arbitrum' },
        { dataKey: 'optimism_addresses', strokeColor: '#F27935', label: 'Optimism' },
  ];

  return (
    <CustomizedChart
      data={data}
      dataKeys={dataKeys}
      heading="Ethereum & L2 Active Addresses"
    />
  );
};

export default EthereumWalletDataFetcher;
