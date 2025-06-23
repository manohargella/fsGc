import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type GpaDisplayProps = {
  sgpa: number;
  cgpa: number;
};

export default function GpaDisplay({ sgpa, cgpa }: GpaDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPA Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 border rounded-lg">
          <span className="text-muted-foreground">Semester GPA (SGPA)</span>
          <span className="text-2xl font-bold">{sgpa.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center p-4 border rounded-lg">
          <span className="text-muted-foreground">Cumulative GPA (CGPA)</span>
          <span className="text-2xl font-bold">{cgpa.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
