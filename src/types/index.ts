export interface Subject {
  name: string;
  credit: number;
}

export interface EditableSubject extends Subject {
  isEditable: boolean;
}

export interface SemesterGrade {
  gradePoint: string;
}

export interface SemesterData {
  grades: SemesterGrade[];
  customSubjects?: Record<number, string>; // Maps subject index to custom name
}

export type AllSemesterGrades = Record<string, SemesterData>;
