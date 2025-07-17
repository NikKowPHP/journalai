import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ProficiencyChartProps {
  data: Array<{ date: string; score: number }>;
}

const scoreToCefrLevel = (score: number) => {
  if (score <= 20) return "A1";
  if (score <= 40) return "A2";
  if (score <= 60) return "B1";
  if (score <= 80) return "B2";
  if (score <= 100) return "C1";
  return "";
};

const yAxisTicks = [0, 20, 40, 60, 80, 100];

const formatDate = (tickItem: string) => {
  return new Date(tickItem).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const level = scoreToCefrLevel(score);
    const date = new Date(label).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return (
      <div className="p-2 bg-background border border-border rounded-lg shadow-lg">
        <p className="font-bold">{date}</p>
        <p className="text-sm text-muted-foreground">
          Score: {score.toFixed(0)} ({level})
        </p>
      </div>
    );
  }
  return null;
};

export function ProficiencyChart({ data }: ProficiencyChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            stroke="hsl(var(--foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--foreground))" }}
            tickFormatter={formatDate}
          />
          <YAxis
            stroke="hsl(var(--foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            tickLine={{ stroke: "hsl(var(--foreground))" }}
            domain={[0, 100]}
            ticks={yAxisTicks}
            tickFormatter={scoreToCefrLevel}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "hsl(var(--muted-foreground))" }} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            dot={{ fill: "hsl(var(--chart-1))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}