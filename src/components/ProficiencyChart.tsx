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

const formatDate = (tickItem: string) => {
  return new Date(tickItem).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const formatTooltipLabel = (label: string) => {
  return new Date(label).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
          />
          <Tooltip
            labelFormatter={formatTooltipLabel}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
              color: "hsl(var(--foreground))",
            }}
          />
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