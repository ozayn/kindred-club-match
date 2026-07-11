import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { AXES, type Axis } from '../data/clubs'

interface FitRadarProps {
  userScores?: Record<Axis, number>
  clubScores: Record<Axis, number>
  color: string
}

export function FitRadar({ userScores, clubScores, color }: FitRadarProps) {
  const data = AXES.map((axis) => ({
    axis: axis.label,
    ...(userScores ? { You: userScores[axis.key] } : {}),
    Club: clubScores[axis.key],
  }))

  return (
    <div className="w-full h-[280px] sm:h-[340px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <PolarGrid stroke="var(--line)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: 'var(--muted)', fontSize: 10 }}
            tickLine={false}
          />
        {userScores && (
          <Radar
            name="You"
            dataKey="You"
            stroke="var(--ink)"
            fill="var(--ink)"
            fillOpacity={0.08}
            strokeWidth={2}
          />
        )}
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
    </div>
  )
}
