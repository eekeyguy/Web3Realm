import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomizedChartDualAxis from './CustomizedChartDualAxis';

const CACHE_KEY = 'NFTTradesData';
const CACHE_EXPIRATION = 6*60*60*1000; // 6 hours in milliseconds

const NftTradesByChain = () => {
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
          const response = await axios.get('https://api.dune.com/api/v1/query/2514217/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
          const rows = response.data.result.rows;

          // Transform the data to the desired format
          const transformedData = rows.reduce((acc, row) => {

            const { chain, time, number_of_trades } = row;
            const date = new Date(row.time).toISOString().split('T')[0];
            const existingData = acc.find(item => item.date === date);

            if (existingData) {
              existingData[chain] = number_of_trades;
            } else {
              acc.push({
                date: date,
                [chain]: number_of_trades,
              });
            }
            return acc;
          }, []);
          localStorage.setItem(CACHE_KEY, JSON.stringify(transformedData));
          localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());

          setData(transformedData);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  const dataKeysLeft = [
    { dataKey: 'ethereum', strokeColor: '#20E3B2', label: 'Ethereum' },
    { dataKey: 'polygon', strokeColor: '#F27935', label: 'Polygon' }
  ];
  const dataKeysRight =[
    { dataKey: 'bnb', strokeColor: '#E31B6D', label: 'Bnb' },
    { dataKey: 'optimism', strokeColor: '#F4E542', label: 'Optimism' },
    { dataKey: 'arbitrum', strokeColor: '#4D6CFA', label: 'Arbitrum' },
  ];

  return (
    <CustomizedChartDualAxis
      data={data}
      dataKeysLeft={dataKeysLeft}
      dataKeysRight={dataKeysRight}
      heading="NFT Trades per Blockchain"
    />
  );
};

export default NftTradesByChain;
