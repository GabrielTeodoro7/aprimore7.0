import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'Matemática', media: 8.2, cor: 'var(--stat-blue)' },
  { name: 'Português', media: 7.5, cor: 'var(--stat-green)' },
  { name: 'Ciências', media: 8.8, cor: 'var(--stat-orange)' },
  { name: 'História', media: 6.9, cor: 'var(--stat-purple)' },
  { name: 'Artes', media: 9.2, cor: 'var(--stat-pink)' },
];

export function ClassPerformanceChart() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">Desempenho Médio por Matéria</h3>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10 }}
              domain={[0, 10]}
            />
            <Tooltip 
              cursor={{ fill: 'var(--accent)', opacity: 0.4 }}
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            />
            <Bar dataKey="media" radius={[6, 6, 0, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
