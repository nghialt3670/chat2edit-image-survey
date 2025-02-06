export interface SurveyResult {
  fullName: string;
  email: string;
  order: number[];
  result: Record<string, string>[];
}
