import axios from "axios";
import {
  Form,
  PublicForm,
  Question,
  QuestionType,
  QuestionProperties,
  LogicRule,
  FormTheme,
  ThankYouScreen,
  ResponseSubmit,
  ResponseDetail,
  FormSummary
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// --- FORMS ---

export async function fetchForms(creatorId: string = "default_creator"): Promise<Form[]> {
  const res = await api.get<Form[]>(`/forms`, { params: { creator_id: creatorId } });
  return res.data;
}

export async function createForm(title: string = "Untitled Form", description: string = "", creatorId: string = "default_creator"): Promise<Form> {
  const res = await api.post<Form>(`/forms`, { title, description, creator_id: creatorId });
  return res.data;
}

export async function fetchFormDetails(formId: string): Promise<Form> {
  const res = await api.get<Form>(`/forms/${formId}`);
  return res.data;
}

export async function updateFormDetails(
  formId: string,
  payload: {
    title?: string;
    description?: string;
    status?: "draft" | "published";
    theme?: FormTheme;
    thank_you_screen?: ThankYouScreen;
  }
): Promise<Form> {
  const res = await api.put<Form>(`/forms/${formId}`, payload);
  return res.data;
}

export async function deleteForm(formId: string): Promise<void> {
  await api.delete(`/forms/${formId}`);
}

export async function duplicateForm(formId: string): Promise<Form> {
  const res = await api.post<Form>(`/forms/${formId}/duplicate`);
  return res.data;
}

export async function togglePublishForm(formId: string): Promise<Form> {
  const res = await api.post<Form>(`/forms/${formId}/publish`);
  return res.data;
}

// --- QUESTIONS ---

export async function addQuestion(
  formId: string,
  type: QuestionType,
  title: string = "Untitled Question",
  properties: QuestionProperties = {}
): Promise<Question> {
  const res = await api.post<Question>(`/forms/${formId}/questions`, {
    type,
    title,
    properties,
    required: false
  });
  return res.data;
}

export async function updateQuestion(
  questionId: string,
  payload: {
    title?: string;
    description?: string;
    type?: QuestionType;
    required?: boolean;
    order_index?: number;
    properties?: QuestionProperties;
    logic?: LogicRule[];
  }
): Promise<Question> {
  const res = await api.put<Question>(`/questions/${questionId}`, payload);
  return res.data;
}

export async function deleteQuestion(questionId: string): Promise<void> {
  await api.delete(`/questions/${questionId}`);
}

export async function reorderQuestions(formId: string, questionIds: string[]): Promise<Question[]> {
  const res = await api.post<Question[]>(`/forms/${formId}/questions/reorder`, {
    question_ids: questionIds
  });
  return res.data;
}

// --- PUBLIC RESPONDENT ---

export async function fetchPublicForm(shareId: string): Promise<PublicForm> {
  const res = await api.get<PublicForm>(`/public/forms/${shareId}`);
  return res.data;
}

export async function submitPublicResponse(shareId: string, payload: ResponseSubmit): Promise<any> {
  const res = await api.post(`/public/forms/${shareId}/responses`, payload);
  return res.data;
}

// --- RESPONSES & ANALYTICS ---

export async function fetchFormResponses(formId: string): Promise<ResponseDetail[]> {
  const res = await api.get<ResponseDetail[]>(`/forms/${formId}/responses`);
  return res.data;
}

export async function fetchFormSummary(formId: string): Promise<FormSummary> {
  const res = await api.get<FormSummary>(`/forms/${formId}/responses/summary`);
  return res.data;
}

export function getCSVExportUrl(formId: string): string {
  return `${API_BASE_URL}/forms/${formId}/responses/export`;
}

// --- RE-SEED ---

export async function triggerReSeed(creatorId: string = "default_creator"): Promise<void> {
  await api.post(`/seed?creator_id=${encodeURIComponent(creatorId)}`);
}
