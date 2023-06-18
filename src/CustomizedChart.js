import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const CustomizedChart = ({ data, dataKeys, heading }) => {

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ marginBottom: 0, color: '#CCCCCC', textAlign: 'left' }}>
          <p className="label" style={{ margin: 0 }}>{`Date: ${label}`}</p>
          {payload.map((entry, index) => (
            <p className="data" key={index} style={{ margin: 0 }}>
              <span className="name">{entry.name}: </span>
              <span className="value">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ marginBottom: 20, color: '#CCCCCC' }}>
        {heading}
      </h2>
      <div style={{ display: 'inline-block', marginLeft: 'auto', marginRight: 'auto' }}>
        <LineChart
          width={600}
          height={300}
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#444444" />
          <XAxis
            dataKey="date" // Assuming the x-axis data key is "date"
            stroke="#CCCCCC"
            tick={{ fill: '#CCCCCC' }}
          />
          <YAxis stroke="#CCCCCC" tick={{ fill: '#CCCCCC' }} />
          <Tooltip
            content={<CustomTooltip />}
            position={{ y: -10 }}
          />
          <Legend wrapperStyle={{ color: '#CCCCCC' }} />
          {dataKeys.map((key, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={key.dataKey}
              stroke={key.strokeColor}
              activeDot={{ r: 3 }}
              dot={{ r: 1 }}
              name={key.label}
            />
          ))}
        </LineChart>
      </div>
    </div>
  );
};

export default CustomizedChart;
