import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { AXES, type Axis } from '../data/clubs'

interface FitRadarProps {
  userScores: Record<Axis, number>
  clubScores: Record<Axis, number>
  color: string
}

export function FitRadar({ userScores, clubScores, color }: FitRadarProps) {
  const data = AXES.map((axis) => ({
    axis: axis.label,
    You: userScores[axis.key],
    Club: clubScores[axis.key],
  }))

  return (
    <ResponsiveContainer width="100%" height={340}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="var(--line)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: 'var(--muted)', fontSize: 11 }}
          tickLine={false}
        />
        <Radar
          name="You"
          dataKey="You"
          stroke="var(--ink)"
          fill="var(--ink)"
          fillOpacity={0.08}
          strokeWidth={2}
        />
        <Radar
          name="Club"
          dataKey="Club"
          stroke={color}
          fill={color}
          fillOpacity={0.22}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
