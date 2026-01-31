"use client";

import React, { useState } from "react";

interface DataItem {
  date: string;
  count: number;
}

interface CellData {
  date: string;
  count: number;
  day: number;
  month: number;
  isCurrentYear: boolean;
}

interface HoveredCell extends CellData {
  x: number;
  y: number;
}

interface MonthLabel {
  month: string;
  weekIndex: number;
}

interface GitHubHeatmapProps {
  data?: DataItem[];
  startYear?: number;
  endYear?: number;
  colors?: string[];
  cellSize?: number;
  cellGap?: number;
  showMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  renderTooltip?: ((cell: HoveredCell) => string) | null;
  emptyColor?: string | null;
  className?: string;
}

const GitHubHeatmap = ({
  data = [],
  startYear = new Date().getFullYear(),
  endYear = new Date().getFullYear(),
  colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  cellSize = 12,
  cellGap = 3,
  showMonthLabels = true,
  showWeekdayLabels = true,
  renderTooltip = null,
  emptyColor = null,
  className = "",
}: GitHubHeatmapProps) => {
  const [hoveredCell, setHoveredCell] = useState<HoveredCell | null>(null);

  // Convert data array to map for quick lookup
  const dataMap = React.useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      map.set(item.date, item.count);
    });
    return map;
  }, [data]);

  // Get color based on count
  const getColor = (count: number) => {
    if (count === 0 || count === null || count === undefined) {
      return emptyColor || colors[0];
    }

    // Find max count for scaling
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    // Determine which color level (1-4)
    const level = Math.min(Math.ceil((count / maxCount) * 4), 4);

    return colors[level];
  };

  // Generate all weeks for the year range
  const generateYearData = () => {
    const years = [];

    for (let year = startYear; year <= endYear; year++) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);

      // Find the first Sunday before or on Jan 1
      const firstDay = new Date(startDate);
      firstDay.setDate(firstDay.getDate() - firstDay.getDay());

      // Find the last Saturday after or on Dec 31
      const lastDay = new Date(endDate);
      lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

      const weeks = [];
      let currentWeek = [];
      const currentDate = new Date(firstDay);

      while (currentDate <= lastDay) {
        const dateStr = currentDate.toISOString().split("T")[0];
        const count = dataMap.get(dateStr) || 0;
        const isCurrentYear = currentDate.getFullYear() === year;

        currentWeek.push({
          date: dateStr,
          count: count,
          day: currentDate.getDay(),
          month: currentDate.getMonth(),
          isCurrentYear: isCurrentYear,
        });

        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }

      years.push({ year, weeks });
    }

    return years;
  };

  const yearData = generateYearData();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Calculate month positions for labels
  const getMonthLabels = (weeks: CellData[][]): MonthLabel[] => {
    const monthLabels: MonthLabel[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find((day: CellData) => day.isCurrentYear);
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.month;
        if (month !== lastMonth && weekIndex > 0) {
          monthLabels.push({
            month: months[month],
            weekIndex: weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return monthLabels;
  };

  const defaultTooltip = (cell: HoveredCell) => {
    const date = new Date(cell.date);
    const formatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return `${cell.count} contributions on ${formatted}`;
  };

  const tooltipContent = hoveredCell
    ? renderTooltip
      ? renderTooltip(hoveredCell)
      : defaultTooltip(hoveredCell)
    : null;

  return (
    <div className={`github-heatmap ${className}`}>
      <style>{`
        .github-heatmap {
          display: block;
          width: max-content;
          min-width: 100%;
        }

        .heatmap-year {
          margin-bottom: 40px;
          width: max-content;
          min-width: 100%;
        }

        .heatmap-year:last-child {
          margin-bottom: 0;
        }

        .heatmap-title {
          font-size: 14px;
          font-weight: 600;
          color: #24292f;
          margin-bottom: 12px;
        }

        .heatmap-grid-wrapper {
          display: flex;
          gap: 12px;
          width: max-content;
          min-width: 100%;
        }

        .heatmap-weekday-labels {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          padding-right: 4px;
          margin-top: ${showMonthLabels ? "20px" : "0"};
          flex-shrink: 0;
        }

        .heatmap-weekday-label {
          font-size: 10px;
          color: #57606a;
          height: ${cellSize}px;
          display: flex;
          align-items: center;
          margin-bottom: ${cellGap}px;
        }

        .heatmap-weekday-label:last-child {
          margin-bottom: 0;
        }

        .heatmap-grid-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .heatmap-month-labels {
          display: flex;
          gap: ${cellGap}px;
          margin-bottom: 4px;
          height: 16px;
          position: relative;
        }

        .heatmap-month-label {
          font-size: 10px;
          color: #57606a;
          position: absolute;
          top: 0;
        }

        .heatmap-grid {
          display: flex;
          gap: ${cellGap}px;
          width: max-content;
        }

        .heatmap-week {
          display: flex;
          flex-direction: column;
          gap: ${cellGap}px;
        }

        .heatmap-cell {
          width: ${cellSize}px;
          height: ${cellSize}px;
          cursor: pointer;
          transition: all 0.1s ease;
        }

        .heatmap-cell:hover {
          outline: 2px solid rgba(0, 0, 0, 0.3);
          outline-offset: 0;
        }

        .heatmap-cell.out-of-range {
          opacity: 0.3;
        }

        .heatmap-tooltip {
          position: fixed;
          background: #24292f;
          color: white;
          padding: 8px 12px;
          font-size: 12px;
          pointer-events: none;
          z-index: 1000;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .heatmap-legend {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 8px;
          font-size: 11px;
          color: #57606a;
        }

        .heatmap-legend-label {
          margin-right: 4px;
        }

        .heatmap-legend-cell {
          width: ${cellSize}px;
          height: ${cellSize}px;
        }
      `}</style>

      {yearData.map(({ year, weeks }) => {
        const monthLabels = getMonthLabels(weeks);

        return (
          <div key={year} className="heatmap-year">
            <div className="heatmap-title">{year}</div>

            <div className="heatmap-grid-wrapper">
              {showWeekdayLabels && (
                <div className="heatmap-weekday-labels">
                  {weekdays.map((day, index) =>
                    index % 2 === 1 ? (
                      <div key={day} className="heatmap-weekday-label">
                        {day}
                      </div>
                    ) : (
                      <div
                        key={day}
                        className="heatmap-weekday-label"
                        style={{ visibility: "hidden" }}
                      >
                        {day}
                      </div>
                    ),
                  )}
                </div>
              )}

              <div className="heatmap-grid-container">
                {showMonthLabels && (
                  <div className="heatmap-month-labels">
                    {monthLabels.map(({ month, weekIndex }) => (
                      <div
                        key={`${month}-${weekIndex}`}
                        className="heatmap-month-label"
                        style={{
                          left: `${weekIndex * (cellSize + cellGap)}px`,
                        }}
                      >
                        {month}
                      </div>
                    ))}
                  </div>
                )}

                <div className="heatmap-grid">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="heatmap-week">
                      {week.map((cell) => (
                        <div
                          key={cell.date}
                          className={`heatmap-cell ${!cell.isCurrentYear ? "out-of-range" : ""}`}
                          style={{
                            backgroundColor: getColor(cell.count),
                          }}
                          onMouseEnter={(e) =>
                            setHoveredCell({
                              ...cell,
                              x: e.clientX,
                              y: e.clientY,
                            })
                          }
                          onMouseMove={(e) =>
                            setHoveredCell({
                              ...cell,
                              x: e.clientX,
                              y: e.clientY,
                            })
                          }
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {hoveredCell && (
        <div
          className="heatmap-tooltip"
          style={{
            left: hoveredCell.x + 10,
            top: hoveredCell.y - 30,
          }}
        >
          {tooltipContent}
        </div>
      )}

      {/* DO NOT DELETE - Legend hidden for now, uncomment to restore:
      <div className="heatmap-legend">
        <span className="heatmap-legend-label">Less</span>
        {colors.map((color, index) => (
          <div
            key={index}
            className="heatmap-legend-cell"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="heatmap-legend-label">More</span>
      </div>
      */}
    </div>
  );
};

// Demo component showing usage examples
const GitHubHeatmapDemo = () => {
  // Generate sample data
  // Static sample data for demo (a few representative dates)
  const sampleData = [
    { date: "2024-01-15", count: 5 },
    { date: "2024-02-20", count: 12 },
    { date: "2024-03-10", count: 3 },
    { date: "2024-04-05", count: 18 },
    { date: "2024-05-22", count: 7 },
    { date: "2024-06-14", count: 15 },
    { date: "2024-07-30", count: 9 },
    { date: "2024-08-18", count: 4 },
    { date: "2024-09-25", count: 11 },
    { date: "2024-10-12", count: 6 },
    { date: "2024-11-08", count: 14 },
    { date: "2024-12-20", count: 8 },
  ];

  // Custom color schemes
  const greenScheme = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];
  const blueScheme = ["#ebedf0", "#9ecbff", "#58a6ff", "#1f6feb", "#0d419d"];
  const purpleScheme = ["#ebedf0", "#d8b9ff", "#b794f6", "#9574e5", "#6e5494"];
  const orangeScheme = ["#ebedf0", "#ffd1a3", "#ffaa56", "#ff8811", "#d96700"];

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#0d1117",
        minHeight: "100vh",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        body {
          margin: 0;
          background: #0d1117;
        }
        
        .demo-section {
          background: #161b22;
          border-radius: 12px;
          padding: 32px;
          margin-bottom: 32px;
          border: 1px solid #30363d;
        }
        
        .demo-title {
          font-size: 24px;
          font-weight: 700;
          color: #f0f6fc;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        
        .demo-description {
          color: #8b949e;
          margin-bottom: 24px;
          line-height: 1.6;
        }
        
        .demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 32px;
        }
        
        .demo-card {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 24px;
        }
        
        .demo-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #f0f6fc;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      <div className="demo-section">
        <h1 className="demo-title">GitHub Heatmap Component</h1>
        <p className="demo-description">
          A fully customizable activity heatmap inspired by GitHub's
          contribution graph. Supports custom colors, tooltips, sizing, and
          multi-year displays.
        </p>

        <GitHubHeatmap
          data={sampleData}
          startYear={2024}
          endYear={2024}
          colors={greenScheme}
        />
      </div>

      <div className="demo-section">
        <h2 className="demo-title">Custom Color Schemes</h2>
        <p className="demo-description">
          Choose from predefined themes or create your own color palette.
        </p>

        <div className="demo-grid">
          <div className="demo-card">
            <div className="demo-card-title">Classic Green</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={greenScheme}
              cellSize={10}
              showMonthLabels={false}
            />
          </div>

          <div className="demo-card">
            <div className="demo-card-title">Ocean Blue</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={blueScheme}
              cellSize={10}
              showMonthLabels={false}
            />
          </div>

          <div className="demo-card">
            <div className="demo-card-title">Purple Dream</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={purpleScheme}
              cellSize={10}
              showMonthLabels={false}
            />
          </div>

          <div className="demo-card">
            <div className="demo-card-title">Sunset Orange</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={orangeScheme}
              cellSize={10}
              showMonthLabels={false}
            />
          </div>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="demo-title">Customization Options</h2>
        <p className="demo-description">
          Adjust cell size, gaps, and labels to fit your design.
        </p>

        <div className="demo-grid">
          <div className="demo-card">
            <div className="demo-card-title">Compact View</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={blueScheme}
              cellSize={8}
              cellGap={2}
            />
          </div>

          <div className="demo-card">
            <div className="demo-card-title">Large Cells</div>
            <GitHubHeatmap
              data={sampleData}
              startYear={2024}
              endYear={2024}
              colors={purpleScheme}
              cellSize={16}
              cellGap={4}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubHeatmap;
export { GitHubHeatmapDemo };
