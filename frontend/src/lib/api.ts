import { Account, AuthSession, clearStoredSession, getStoredSession, saveStoredSession } from "@/lib/auth-storage";

export type Department = { departmentId: number; departmentName: string; departmentDescription: string; isActive: boolean; projects?: Project[] };
export type Project = { projectId: number; projectName: string; description?: string; startDate: string; endDate?: string; status: number; departmentId: number; departmentName: string; isActive: boolean; createdDate?: string; tasks?: WorkTask[] };
export type Tag = { tagId: number; tagName: string; color?: string };
export type WorkTask = { taskId: number; title: string; description?: string; status: number; priority: number; dueDate?: string; projectId: number; projectName: string; createdDate?: string; modifiedDate?: string; createdById?: number; updatedById?: number; tags: Tag[] };
export type DepartmentInput = { departmentName: string; departmentDescription: string };
export type ProjectInput = { projectName: string; description?: string; startDate: string; endDate?: string | null; status: number; departmentId: number };
export type TaskInput = { title: string; description?: string; status: number; priority: number; dueDate?: string | null; projectId: number; tagIds: number[] };
export type TagInput = { tagName: string; color?: string | null };
export type AuthResponse = AuthSession;
export type RegisterInput = { fullName: string; email: string; password: string };
export type LoginInput = { email: string; password: string };
export type AccountInput = { fullName: string; role: number };

const DEFAULT_API_URL = process.env.NODE_ENV === "production"
  ? "https://qe190133-prn232-ass2-be.onrender.com"
  : "http://localhost:5000";
const API_URL = (process.env.NEXT_PUBLIC_QE190133_ASS2_API_URL || DEFAULT_API_URL).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

let refreshPromise: Promise<AuthSession> | null = null;

async function parseError(response: Response) {
  const body = await response.json().catch(() => ({}));
  const firstFieldError = body.errors ? Object.values(body.errors).flat().find(Boolean) : undefined;
  return String(body.message || body.title || firstFieldError || "Request failed");
}

async function refreshSession(current: AuthSession): Promise<AuthSession> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: current.refreshToken }),
    }).then(async (response) => {
      if (!response.ok) throw new ApiError(await parseError(response), response.status);
      const session = await response.json() as AuthSession;
      saveStoredSession(session);
      return session;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function refreshAuthSession(): Promise<AuthSession> {
  const current = getStoredSession();
  if (!current) throw new ApiError("No active session.", 401);
  try {
    return await refreshSession(current);
  } catch (error) {
    clearStoredSession();
    throw error;
  }
}

type RequestOptions = { authenticated?: boolean; retry401?: boolean };

async function request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, retry401 = true } = options;
  let session = authenticated ? getStoredSession() : null;
  const execute = (accessToken?: string) => fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers || {}),
    },
  });

  let response = await execute(session?.accessToken);
  if (response.status === 401 && authenticated && retry401 && session?.refreshToken) {
    try {
      session = await refreshSession(session);
      response = await execute(session.accessToken);
    } catch {
      clearStoredSession();
    }
  }

  if (!response.ok) {
    if (response.status === 401 && authenticated) {
      clearStoredSession();
      if (typeof window !== "undefined") {
        const returnUrl = `${window.location.pathname}${window.location.search}`;
        window.dispatchEvent(new CustomEvent("tasktrack:unauthorized", { detail: returnUrl }));
      }
    }
    throw new ApiError(await parseError(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const registerAccount = (data: RegisterInput) => request<Account>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }, { authenticated: false, retry401: false });
export const loginAccount = (data: LoginInput) => request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }, { authenticated: false, retry401: false });
export const logoutAccount = (refreshToken: string) => request<void>("/api/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken }) }, { authenticated: false, retry401: false });
export const getProfile = () => request<Account>("/api/profile");
export const updateProfile = (fullName: string) => request<Account>("/api/profile", { method: "PUT", body: JSON.stringify({ fullName }) });
export const changePassword = (currentPassword: string, newPassword: string) => request<void>("/api/profile/password", { method: "PUT", body: JSON.stringify({ currentPassword, newPassword }) });
export const getAccounts = () => request<Account[]>("/api/accounts");
export const updateAccount = (id: number, data: AccountInput) => request<Account>(`/api/accounts/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAccount = (id: number) => request<void>(`/api/accounts/${id}`, { method: "DELETE" });

export const getDepartments = () => request<Department[]>("/api/departments", {}, { authenticated: false });
export const getProjects = () => request<Project[]>("/api/projects", {}, { authenticated: false });
export const getProject = (id: string) => request<Project>(`/api/projects/${id}`, {}, { authenticated: false });
export const getDepartment = (id: string) => request<Department>(`/api/departments/${id}`, {}, { authenticated: false });
export const getTask = (id: string) => request<WorkTask>(`/api/tasks/${id}`, {}, { authenticated: false });
export const getTags = () => request<Tag[]>("/api/tags", {}, { authenticated: false });
export const searchTasks = (query: string) => request<WorkTask[]>(`/api/tasks/search${query ? `?${query}` : ""}`, {}, { authenticated: false });
export const createDepartment = (data: DepartmentInput) => request<Department>("/api/departments", { method: "POST", body: JSON.stringify(data) });
export const updateDepartment = (id: number, data: DepartmentInput) => request<Department>(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDepartment = (id: number) => request<void>(`/api/departments/${id}`, { method: "DELETE" });
export const createProject = (data: ProjectInput) => request<Project>("/api/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id: number, data: ProjectInput) => request<Project>(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProject = (id: number) => request<void>(`/api/projects/${id}`, { method: "DELETE" });
export const createTask = (data: TaskInput) => request<WorkTask>("/api/tasks", { method: "POST", body: JSON.stringify(data) });
export const updateTask = (id: number, data: TaskInput) => request<WorkTask>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTask = (id: number) => request<void>(`/api/tasks/${id}`, { method: "DELETE" });
export const createTag = (data: TagInput) => request<Tag>("/api/tags", { method: "POST", body: JSON.stringify(data) });
export const updateTag = (id: number, data: TagInput) => request<Tag>(`/api/tags/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteTag = (id: number) => request<void>(`/api/tags/${id}`, { method: "DELETE" });

export const statusLabels = ["Not Started", "In Progress", "Completed", "On Hold"];
export const taskStatusLabels = ["To Do", "In Progress", "Done", "Cancelled"];
export const priorityLabels = ["Low", "Medium", "High", "Critical"];
