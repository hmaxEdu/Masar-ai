import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import CustomTooltip from "./CustomTooltip";
import { BarChart3 } from "lucide-react";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

interface PriorityBarChartProps { data: Array<{ name: string; count: number }>; }

export function PriorityBarChart({ data }: PriorityBarChartProps) {
  return (
    <Card className="shadow-sm border-border/50 flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Tasks by Priority</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
        {data.length === 0 ? (
          <div className="flex flex-col items-center text-muted-foreground/60 gap-2">
            <BarChart3 className="h-8 w-8" />
            <span className="text-xs font-medium">No priorities assigned</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <RechartsTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}