import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import CustomTooltip from "./CustomTooltip";
import { PieChart as PieChartIcon } from "lucide-react";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

interface StatusPieChartProps { data: Array<{ name: string; value: number }>; }

export function StatusPieChart({ data }: StatusPieChartProps) {
  return (
    <Card className="shadow-sm border-border/50 flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Task Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
        {data.length === 0 ? (
          <div className="flex flex-col items-center text-muted-foreground/60 gap-2">
            <PieChartIcon className="h-8 w-8" />
            <span className="text-xs font-medium">No active statuses</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} cornerRadius={10} outerRadius={100} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((_, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}