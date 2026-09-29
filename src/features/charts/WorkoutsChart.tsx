import React from 'react';

type WeekData = Record<string, number>; // weekStartDate -> count

const WorkoutsChart: React.FC<{ data: WeekData }> = ({ data }) => {
  if (Object.keys(data).length === 0) {
    return <div className="chart-empty">Нет данных о тренировках</div>;
  }

  const width = 300;
  const height = 200;
  const padding = 40;
  const barWidth = 25;
  const weeks = Object.keys(data).sort();
  const maxCount = Math.max(...Object.values(data));

  return (
    <div className="chart-container">
      <h3>Тренировки по неделям</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="chart-svg">
        {weeks.map((weekStart, i) => {
          const count = data[weekStart] || 0;
          const x = padding + i * (barWidth + 10);
          const barHeight = ((count / maxCount) * (height - 2 * padding)) || 0;
          const y = height - padding - barHeight;
          return (
            <React.Fragment key={weekStart}>
              <rect x={x} y={y} width={barWidth} height={barHeight} fill="#5AA9F5" />
              <text x={x + barWidth / 2} y={height - padding + 15} textAnchor="middle" fontSize="10" fill="#95A2AE">
                {new Date(weekStart).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' })}
              </text>
            </React.Fragment>
          );
        })}
        {/* axes */}
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#95A2AE" strokeWidth="1" />
        {/* max label */}
        <text x={padding - 10} y={padding} textAnchor="end" fontSize="10" fill="#95A2AE">
          {maxCount}
        </text>
      </svg>
    </div>
  );
};

export default WorkoutsChart;