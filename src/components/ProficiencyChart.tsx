import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { date: '2023-01', score: 45 },
  { date: '2023-02', score: 52 },
  { date: '2023-03', score: 60 },
  { date: '2023-04', score: 58 },
  { date: '2023-05', score: 65 },
  { date: '2023-06', score: 70 },
]

export function ProficiencyChart() {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            stroke="#888888"
            fontSize={12}
          />
          <YAxis 
            stroke="#888888"
            fontSize={12}
            domain={[0, 100]}
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}