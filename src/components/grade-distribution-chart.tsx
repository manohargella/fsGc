import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type GradeDistributionChartProps = {
  gpa: number;
};

export default function GradeDistributionChart({ gpa }: GradeDistributionChartProps) {
  const getGpaMeterColor = () => {
    if (gpa >= 9) return "bg-chart-1";
    if (gpa >= 7) return "bg-chart-2";
    return "bg-destructive";
  };
  
  const gpaPercentage = (gpa / 10) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cumulative GPA Meter</CardTitle>
        <CardDescription>Visual representation of your CGPA.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
            <div
                className={`h-4 rounded-full transition-all duration-500 ${getGpaMeterColor()}`}
                style={{ width: `${gpaPercentage}%` }}
            ></div>
        </div>
        <div className="text-center mt-2 text-sm text-muted-foreground">
            {gpa.toFixed(2)} / 10.00
        </div>
      </CardContent>
    </Card>
  );
}
