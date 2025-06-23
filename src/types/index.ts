export interface Subject {
  name: string;
  credit: number;
}

export interface SemesterGrade {
  gradePoint: string;
}

export type AllSemesterGrades = Record<string, SemesterGrade[]>;
