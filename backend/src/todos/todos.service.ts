import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { Todo } from './todo.model';
import { CreateTodoDto } from './Dto/create-todo.dto';
import { UpdateTodoDto } from './Dto/update-todo.dto';
import { NotFoundException } from '@nestjs/common';
import { MYSQLService } from 'src/database/mysql.service';

@Injectable()
export class TodosService {
  constructor(private readonly db: MYSQLService) {}

  private mapRowToTodo(row: any): Todo {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      priority: row.priority,
      description: row.description,
      status: row.status,
      imageUrl: row.image_url ?? row.imageUrl ?? null,
      createdAt: row.created_at
        ? new Date(row.created_at).toISOString()
        : new Date().toISOString(),
      updatedAt: row.updated_at
        ? new Date(row.updated_at).toISOString()
        : new Date().toISOString(),
    } as Todo;
  }

  async create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    if (!userId) {
      throw new BadRequestException('Authenticated user id required');
    }

    try {
      const pool = this.db.getPool();
      const now = new Date();
      const [result]: any = await pool.query(
        `INSERT INTO tasks
         (title, priority, description, status, image_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          dto.title || '',
          dto.priority || 'medium',
          dto.description || '',
          dto.status || 'not-started',
          dto.imageUrl || null,
          now,
        ],
      );
      const insertId = result.insertId;
      const [rows]: any = await pool.query('SELECT * FROM todos WHERE id = ?', [
        insertId,
      ]);
      if (!rows || rows.length === 0)
        throw new InternalServerErrorException('Failed to fetch created todo');
      return this.mapRowToTodo(rows[0]);
    } catch (err) {
      throw err;
    }
  }

  async findAll(): Promise<Todo[]> {
    const pool = this.db.getPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC',
    );
    return (rows || []).map((r) => this.mapRowToTodo(r));
  }

  // FIND BY ID
  async findById(id: number): Promise<Todo> {
    const pool = this.db.getPool();
    const [rows]: any = await pool.query('SELECT * FROM tasks WHERE id = ?', [
      id,
    ]);
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Task with given id ${id} not found.`);
    }
    return this.mapRowToTodo(rows[0]);
  }

  // UPDATE (partial)
  async update(id: number, dto: UpdateTodoDto): Promise<Todo> {
    // ensure the record exists
    const existing = await this.findById(id); // will throw NotFoundException if not found

    // build dynamic SET clause and values array
    const fields: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      fields.push('title = ?');
      values.push(dto.title);
    }
    if (dto.priority !== undefined) {
      fields.push('priority = ?');
      values.push(dto.priority);
    }
    if (dto.description !== undefined) {
      fields.push('description = ?');
      values.push(dto.description);
    }
    if (dto.status !== undefined) {
      fields.push('status = ?');
      values.push(dto.status);
    }
    if (dto.imageUrl !== undefined) {
      fields.push('image_url = ?');
      values.push(dto.imageUrl);
    }

    if (fields.length === 0) {
      // nothing to update, return existing
      return existing;
    }

    fields.push('updated_at = ?');
    values.push(new Date());

    // add id for WHERE
    values.push(id);

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    const pool = this.db.getPool();
    await pool.query(sql, values);

    // return the fresh row
    return this.findById(id);
  }

  // REMOVE
  async remove(id: number): Promise<void> {
    const pool = this.db.getPool();
    const [result]: any = await pool.query('DELETE FROM todos WHERE id = ?', [
      id,
    ]);
    if (result.affectedRows === 0) {
      throw new NotFoundException('No such task with id ' + id);
    }
  }
}
