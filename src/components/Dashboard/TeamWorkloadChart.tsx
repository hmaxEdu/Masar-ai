import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";
import { Users } from "lucide-react";

interface TeamWorkloadChartProps { data: Array<{ name: string; activeTasks: number }>; }

export function TeamWorkloadChart({ data }: TeamWorkloadChartProps) {
  return (
    <Card className="shadow-sm border-border/50 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Active Team Workload</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center">
        {data.length === 0 ? (
          <div className="flex flex-col items-center text-muted-foreground/60 gap-2">
            <Users className="h-8 w-8" />
            <span className="text-xs font-medium">No team workload data</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
              <RechartsTooltip cursor={{ fill: "var(--muted)", opacity: 0.4 }} content={<CustomTooltip />} />
              <Bar dataKey="activeTasks" fill="var(--chart-2)" radius={[0, 4, 4, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}