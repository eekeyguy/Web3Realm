import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';

const BtcUsersDataFetcher = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const lastFetchTime = localStorage.getItem('BtcUsersLastFetchTime');
      const currentTime = new Date().getTime();

      // Check if data is in cache and less than 6 hours old
      if (lastFetchTime && currentTime - lastFetchTime < 6 * 60 * 60 * 1000) {
        const cachedData = localStorage.getItem('BtcUsersCachedData');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
          return;
        }
      }

      // Fetch new data
      const response = await axios.get('https://api.dune.com/api/v1/query/2505673/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
      let rows = response.data.result.rows;

      // Format the Date strings
      rows = rows.map(row => {
        const time = row.time.split(' ')[0]; // Keep only the YYYY-MM-DD part
        return { ...row, date: time };
      });

      // Update state with new data
      setData(rows);
      localStorage.setItem('BtcUsersCachedData', JSON.stringify(rows));
       localStorage.setItem('BtcUsersLastFetchTime', currentTime);
    };

    fetchData();
  }, []);

  const dataKeys = [
    { dataKey: 'users', strokeColor: '#20E3B2', label: 'Bitcoin Users' },
  ];

  return (
    <CustomizedChart
      data={data}
      dataKeys={dataKeys}
      heading="Bitcoin Active Addresses"
    />
  );
};

export default BtcUsersDataFetcher;
