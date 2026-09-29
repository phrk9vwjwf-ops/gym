import React from 'react';

type Point = { date: string; kg: number };

const WeightChart: React.FC<{ series: Point[] }> = ({ series }) => {
  if (series.length === 0) {
    return <div className="chart-empty">Нет данных о весе тела</div>;
  }

  const width = 300;
  const height = 200;
  const padding = 40;

  const dates = series.map(p => new Date(p.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const kgValues = series.map(p => p.kg);
  const minKg = Math.min(...kgValues);
  const maxKg = Math.max(...kgValues);
  const kgRange = maxKg - minKg || 1;

  const x = (date: Date) => padding + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * (width - 2 * padding);
  const y = (kg: number) => height - padding - ((kg - minKg) / kgRange) * (height - 2 * padding);

  const linePoints = series.map(p => `${x(new Date(p.date))},${y(p.kg)}`).join(' ');

  return (
    <div className="chart-container">
      <h3>Вес тела</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        <path d={`M${linePoints}`} fill="none" stroke="#5AA9F5" strokeWidth="2" />
        {/* area under line */}
        <path d={`M${linePoints} L${x(new Date(maxDate.getTime()))},${height - padding} L${x(new Date(minDate.getTime()))},${height - padding} Z`} fill="#5AA9F5" fillOpacity="0.1" />
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        {/* points */}
        {series.map((p, i) => (
          <circle key={i} cx={x(new Date(p.date))} cy={y(p.kg)} r={4} fill="#5AA9F5" />
        ))}
        {/* labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#95A2AE">
          {minDate.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} — {maxDate.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
        </text>
        <text x={10} y={height / 2} textAnchor="middle" transform="rotate(-90,10,${height / 2})" fontSize="12" fill="#95A2AE">
          {Math.round(minKg)} — {Math.round(maxKg)} кг
        </text>
      </svg>
    </div>
  );
};

export default WeightChart;