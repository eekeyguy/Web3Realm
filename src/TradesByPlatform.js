import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';
import Select from 'react-select';

const CACHE_KEY = 'TradesByPlatform';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const AVAILABLE_COLORS =
 [
   '#F27935', // Vibrant Orange
   '#F4E542', // Bright Yellow
   '#E31B6D', // Pinkish Red
   '#20E3B2', // Turquoise
   '#57A0D3', // Sky Blue
   '#FF33FF', // Magenta
   '#33FF57', // Bright Green
   '#FF6E33', // Tangerine
   '#D633FF', // Bright Purple
   '#33FFD6', // Aqua
   '#D4FF33', // Lime
   '#FF5733', // Tomato Red
   '#F2F542', // Lemon
   '#42F4B6', // Mint Green
   '#7642F4'  // Indigo
 ];

const TradesByPlatform = () => {
  const [data, setData] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformColors, setPlatformColors] = useState({});
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION) {
        setData(JSON.parse(cachedData));
      } else {
        try {
          const { data: { result: { rows } } } = await axios.get('https://api.dune.com/api/v1/query/2646974/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');

          const transformedData = rows.reduce((acc, { Date, platform, 'Unique Traders': uniqueTraders }) => {
            const date = Date.split(' ')[0];
            if (!acc[Date]) {
              acc[Date] = {};
            }
            acc[Date][platform] = uniqueTraders;
            acc[Date].date = date;
            return acc;
          }, {});

          const formattedData = Object.values(transformedData);

          localStorage.setItem(CACHE_KEY, JSON.stringify(formattedData));
          localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());
          setData(formattedData);

        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data[0]) {
      const totalPlatforms = Object.keys(data[0]).filter(key => key !== 'date');
      setSelectedPlatforms(["opensea", "blur"]);

      const colors = totalPlatforms.reduce((acc, platform, index) => {
        acc[platform] = AVAILABLE_COLORS[index % AVAILABLE_COLORS.length];
        return acc;
      }, {});

      setPlatformColors(colors);
      setOptions(totalPlatforms.map(platform => ({ value: platform, label: platform })));
    }
  }, [data]);

  const handlePlatformChange = useCallback((selectedOptions) => {
    if (selectedOptions && selectedOptions.length <= 5) {
      setSelectedPlatforms(selectedOptions.map(option => option.value));
    }
  }, []);

  const selectedPlatformColors = selectedPlatforms.reduce((acc, platform) => {
    if (platformColors[platform]) {
      acc[platform] = platformColors[platform];
    }
    return acc;
  }, {});

  const dataKeys = Object.keys(selectedPlatformColors).map((platform) => ({
    dataKey: platform,
    strokeColor: selectedPlatformColors[platform],
    label: platform.charAt(0).toUpperCase() + platform.slice(1),
  }));

  return (
     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>
            <h2 style={{color: '#CCCCCC' }}>
                  Number of Trades by Platform
            </h2>
        </div>
        <div style={{ width: 500, margin: 'auto' }}>
          <Select
            isMulti
            options={options}
            value={selectedPlatforms.map(platform => ({ value: platform, label: platform }))}
            onChange={handlePlatformChange}
            maxMenuHeight={170}
            styles={{
                option: (provided) => ({
                    ...provided,
                    color: 'white', // Change color of text in dropdown
                }),
            }}
            closeMenuOnSelect={false}
            theme={(theme) => ({
                    ...theme,
                    borderRadius: 0,
                    colors: {
                      ...theme.colors,
                      primary25: '#20E3B2',
                      primary: 'white',
                      neutral0: '#2A2E42', // background color
                     },
                })}
          />
        </div>
        <CustomizedChart data={data} dataKeys={dataKeys} />
     </div>
  );

};

export default TradesByPlatform;
