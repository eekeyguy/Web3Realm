import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Select from 'react-select';
import CustomizedChart from './CustomizedChart';

const CACHE_KEY = 'LowestSalePrices';
const OPTIONS_CACHE_KEY = 'LowestSalePriceOptions';
const CACHE_EXPIRATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
const AVAILABLE_COLORS = [
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

const NftLowestSalePrices = () => {
  const [data, setData] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [nameColors, setNameColors] = useState({});
  const [options, setOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = localStorage.getItem(CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`);
      const currentTime = new Date().getTime();

      if (cachedData && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < CACHE_EXPIRATION) {
        setData(JSON.parse(cachedData));
        const optionNames = JSON.parse(localStorage.getItem(OPTIONS_CACHE_KEY));
        setOptions(optionNames.map(key=>({value: key, label: key})));
      } else {
        try {
          const { data: { result: { rows } } } = await axios.get('https://api.dune.com/api/v1/query/2647766/results?api_key=piyMny0VjuHCs1Mk5KLTXCwOpclpXcvQ');
          let optionNames = [];
          const transformedData = rows.reduce((acc, { time, name, Lowest_sale_price }) => {
            const date = time.split(' ')[0];
            if (!acc[date]) {
              acc[date] = {};
            }
            acc[date][name] = Lowest_sale_price;
            if(!optionNames.includes(name)){
                optionNames = [
                    ...optionNames,
                    name
                ];
            }
            acc[date].date = date;
            return acc;
          }, {});

          const formattedData = Object.values(transformedData);
          localStorage.setItem(OPTIONS_CACHE_KEY, JSON.stringify(optionNames));
          localStorage.setItem(CACHE_KEY, JSON.stringify(formattedData));
          localStorage.setItem(`${CACHE_KEY}_timestamp`, currentTime.toString());
          setData(formattedData);
          setOptions(optionNames.map(key=>({value: key, label: key})));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (data[0]) {
      const totalNames = Object.keys(data[0]).filter(key => key !== 'date');
      setSelectedNames(['Azuki']);

      const colors = totalNames.reduce((acc, name, index) => {
        acc[name] = AVAILABLE_COLORS[index % AVAILABLE_COLORS.length];
        return acc;
      }, {});

      setNameColors(colors);
    }
  }, [data]);

  const handleNameChange = useCallback((selectedOptions) => {
    if (selectedOptions.length <= 5) {
      setSelectedNames(selectedOptions.map(option => option.value));
    }
  }, []);

  const selectedNameColors = selectedNames.reduce((acc, name) => {
    if (nameColors[name]) {
      acc[name] = nameColors[name];
    }
    return acc;
  }, {});

  const dataKeys = selectedNames.map((name) => ({
    dataKey: name,
    strokeColor: selectedNameColors[name],
    label: name.charAt(0).toUpperCase() + name.slice(1),
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div>
            <h2 style={{color: '#CCCCCC' }}>
              Lowest Sale Price of Top Collection
            </h2>
        </div>
        <div style={{ width: 500, margin: 'auto', height: 50 }}>
        <Select
          isMulti
          options={options}
          value={selectedNames.map(name => ({ value: name, label: name }))}
          onChange={handleNameChange}
          maxMenuHeight={170}
          styles={{
            option: (provided) => ({
              ...provided,
              color: 'white'
            })
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

export default NftLowestSalePrices;
