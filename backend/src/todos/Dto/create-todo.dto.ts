import { IsIn, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import type { TodoPriority } from '../todo.model';
import type { TodoStatus } from '../todo.model';

export class CreateTodoDto {
  @IsNumber()
  userId: number;

  @IsString()
  @Length(1, 100)
  title?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: TodoPriority;

  @IsOptional()
  @IsString()
  @Length(0, 1024)
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsIn(['not-started', 'in-progress', 'completed'])
  status?: TodoStatus;
}
