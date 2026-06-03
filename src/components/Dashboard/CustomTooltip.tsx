// Reusable custom tooltip for charts
  function CustomTooltip ({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md bg-card px-3 py-2 shadow-md">
        <p className="text-sm font-medium">{label || payload[0].name}</p>
        <p className="text-xs text-muted-foreground">{payload[0].value} tasks</p>
      </div>
    );
  }
  return null;
};
export default CustomTooltip;