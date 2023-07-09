import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CustomizedChart from './CustomizedChart';
import Select from 'react-select';

const CACHE_KEY = 'TradesByPlatform';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const AVAILABLE_COLORS =
 [
     '#FF5733', // Vivid Orange
     '#FFEB3B', // Bright Yellow
     '#FF4081', // Hot Pink
     '#00BCD4', // Cyan
     '#FF9800', // Bright Orange
     '#8BC34A', // Lime Green
     '#E040FB', // Bright Purple
     '#F44336', // Red
     '#4CAF50', // Green
     '#FFC107', // Amber
     '#3F51B5', // Indigo
     '#CDDC39', // Lime
     '#9C27B0', // Deep Purple
     '#2196F3', // Bright Blue
     '#FF5252'  // Coral
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
