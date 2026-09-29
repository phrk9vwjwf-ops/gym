import React from 'react';

type Point = { date: string; estimatedMax: number; weight: number | null; reps: number };

const ExerciseProgressChart: React.FC<{ series: Point[]; exerciseId: string }> = ({ series, exerciseId }) => {
  if (series.length === 0) {
    return <div className="chart-empty">Нет данных по упражнению</div>;
  }

  const width = 300;
  const height = 200;
  const padding = 40;

  const dates = series.map(p => new Date(p.date));
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  const maxValues = series.map(p => p.estimatedMax);
  const minMax = Math.min(...maxValues);
  const maxMax = Math.max(...maxValues);
  const range = maxMax - minMax || 1;

  const x = (date: Date) => padding + ((date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime())) * (width - 2 * padding);
  const y = (value: number) => height - padding - ((value - minMax) / range) * (height - 2 * padding);

  const linePoints = series.map(p => `${x(new Date(p.date))},${y(p.estimatedMax)}`).join(' ');

  return (
    <div className="chart-container">
      <h3>Прогресс по упражнению</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        {/* estimated max line */}
        <path d={`M${linePoints}`} fill="none" stroke="#5AA9F5" strokeWidth="2" />
        {/* actual reps as points? spec: line of estimated max and points of actual sets */}
        {series.map((p, i) => (
          <circle key={i} cx={x(new Date(p.date))} cy={y(p.estimatedMax)} r={3} fill="#4CC38A" />
        ))}
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        {/* labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#95A2AE">
          {minDate.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })} — {maxDate.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
        </text>
        <text x={10} y={height / 2} textAnchor="middle" transform="rotate(-90,10,${height / 2})" fontSize="12" fill="#95A2AE">
          {Math.round(minMax)} — {Math.round(maxMax)} кг
        </text>
      </svg>
    </div>
  );
};

export default ExerciseProgressChart;