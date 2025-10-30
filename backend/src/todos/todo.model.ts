export type TodoStatus = 'not-started' | 'in-progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  title: string;
  priority: TodoPriority;
  description: string;
  status: TodoStatus;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}
