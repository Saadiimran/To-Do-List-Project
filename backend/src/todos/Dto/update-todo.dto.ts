import { IsOptional, IsString, Length, IsIn, IsArray } from 'class-validator';
import type { Todo, TodoPriority } from '../todo.model';
import type { TodoStatus } from '../todo.model';

export class UpdateTodoDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  title?: string;

  @IsIn(['low', 'medium', 'high'])
  @IsOptional()
  priority?: TodoPriority;

  @IsOptional()
  @IsString()
  @Length(0, 1024)
  description?: string;

  @IsIn(['not-started', 'in-progress', 'completed'])
  @IsOptional()
  status?: TodoStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image_path?: string;
}
