import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { type Period, getRevenueData } from "@/lib/dashboard-data";

interface RevenueChartProps {
  period: Period;
  onPeriodChange: (p: Period) => void;
}

export function RevenueChart({ period, onPeriodChange }: RevenueChartProps) {
  const data = getRevenueData(period);

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Venituri vs Timp</CardTitle>
        <Select value={period} onValueChange={(v) => onPeriodChange(v as Period)}>
          <SelectTrigger className="w-28 h-8 text-xs" aria-label="Selectează perioada">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Azi</SelectItem>
            <SelectItem value="week">Săptămâna</SelectItem>
            <SelectItem value="month">Luna</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
              <RTooltip
                contentStyle={{
                  backgroundColor: "hsl(217, 33%, 12%)",
                  border: "1px solid hsl(217, 33%, 20%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(210, 40%, 98%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue ($)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
