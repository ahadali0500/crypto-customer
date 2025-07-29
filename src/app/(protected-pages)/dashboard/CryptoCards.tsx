import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import React from 'react';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CryptoCardProps {
  name: string;
  symbol: string;
  price: number;
  change: number;
  icon: string;
  sparkline: number[];
}

const CryptoCard: React.FC<CryptoCardProps> = ({
  name,
  symbol,
  price,
  change,
  icon,
  sparkline,
}) => {
  const isPositive = change >= 0;

const chartColor = isPositive ? '#10b981' : '#ef4444';

const chartOptions: ApexOptions = {
  chart: {
    type: 'area', // switched from 'line' to 'area'
    sparkline: { enabled: true },
  },
  stroke: {
    curve: 'smooth',
    width: 2,
    colors: [chartColor],
  },
  colors: [chartColor],
  tooltip: {
    enabled: false,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: [chartColor],
      opacityFrom: 0.5,
      opacityTo: 0,
      stops: [0, 100],
    }
  },
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 0,
  }
};


  return (
    <div className="  dark:bg-gray-800  p-4 rounded-xl shadow w-full  mt-6">
      <div className="flex items-center space-x-2 mb-3">
        <img src={icon} alt={name} className="w-5 h-5" />
        <span className=" text-sm">{name}</span>
      </div>
      <div className=" font-bold mb-1">${price.toLocaleString()}</div>
      <div className={`text-xs ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? '+' : ''}
        {change.toFixed(2)}% ({symbol.toUpperCase()})
      </div>
      <Chart options={chartOptions} series={[{ data: sparkline }]} type="area" height={50} />
    </div>
  );
};

export default CryptoCard;
