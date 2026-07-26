export type QuestionType =
  | "short_text"
  | "long_text"
  | "multiple_choice"
  | "dropdown"
  | "email"
  | "number"
  | "yes_no"
  | "rating"
  | "file_upload";

export interface LogicRule {
  condition: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "is_filled";
  value?: any;
  destination_question_id: string; // Question UUID or "thank_you"
}

export interface QuestionProperties {
  options?: string[];
  placeholder?: string;
  min_value?: number;
  max_value?: number;
  rating_scale?: number; // 5 or 10
  allow_multiple?: boolean;
}

export interface Question {
  id: string;
  form_id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order_index: number;
  properties: QuestionProperties;
  logic: LogicRule[];
  created_at: string;
}

export interface FormTheme {
  primary_color: string;
  background_color: string;
  text_color: string;
  accent_color: string;
  font_family: string;
  preset: "light" | "dark" | "sunset" | "ocean" | "violet" | "warm";
}

export interface ThankYouScreen {
  title: string;
  description: string;
  button_text: string;
  redirect_url?: string;
}

export interface Form {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  status: "draft" | "published";
  share_id: string;
  theme: FormTheme;
  thank_you_screen: ThankYouScreen;
  created_at: string;
  updated_at: string;
  questions: Question[];
  response_count?: number;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string;
  share_id: string;
  theme: FormTheme;
  thank_you_screen: ThankYouScreen;
  questions: Question[];
}

export interface AnswerSubmit {
  question_id: string;
  answer_value: any;
}

export interface ResponseSubmit {
  completion_time_seconds?: number;
  answers: AnswerSubmit[];
}

export interface AnswerDetail {
  id: string;
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  answer_value: any;
}

export interface ResponseDetail {
  id: string;
  submitted_at: string;
  completion_time_seconds: number;
  status: "completed" | "partial";
  answers: AnswerDetail[];
}

export interface QuestionSummary {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  total_answers: number;
  breakdown: Record<string, number>;
  average_rating?: number | null;
  recent_text_answers: string[];
}

export interface FormSummary {
  form_id: string;
  form_title: string;
  total_responses: number;
  completion_rate: number;
  average_time_seconds: number;
  question_summaries: QuestionSummary[];
}
