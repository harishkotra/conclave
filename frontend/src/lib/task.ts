export interface TaskData {
  title?: string;
  description?: string;
  rubric?: Record<string, string>;
}

export function parseTaskURI(uri: string): TaskData | null {
  if (!uri.startsWith("data:application/json,")) return null;
  try {
    const raw = decodeURIComponent(uri.slice("data:application/json,".length));
    return JSON.parse(raw) as TaskData;
  } catch {
    return null;
  }
}
