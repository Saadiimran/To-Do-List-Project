import {
  Injectable,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { MYSQLService } from 'src/database/mysql.service';
import bcrypt from 'node_modules/bcryptjs';
import { SignUpDto } from 'src/auth/Dto/signup.dto';
import { SignInDto } from 'src/auth/Dto/signin.dto';

@Injectable()
export class UsersService {
  constructor(private readonly db: MYSQLService) {}

  private mapRowToUser(row: any) {
    if (!row) return null;
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    };
  }

  async findByEmail(email: string) {
    const pool = this.db.getPool();
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows && rows.length ? rows[0] : null;
  }

  async findById(id: number) {
    const pool = this.db.getPool();
    const [rows]: any = await pool.query(
      'SELECT id, first_name, last_name, email, created_at, updated_at FROM users WHERE id = ?',
      [id],
    );
    if (!rows || rows.length === 0) return null;
    return this.mapRowToUser(rows[0]);
  }

  async createUser(dto: SignUpDto) {
    const { firstName, lastName, email, password, confirmPassword } = dto;
    const pool = this.db.getPool();

    if (!email || !password || !confirmPassword) {
      throw new BadRequestException('Email and password are required');
    }

    if (password !== confirmPassword) {
      throw new BadRequestException(
        'Password and confirmPassword do not match',
      );
    }
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const now = new Date();
    const [result]: any = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hash, 'active', now, now],
    );

    const insertId = result.insertId;
    const [rows]: any = await pool.query(
      'SELECT id, first_name, last_name, email, status, created_at, updated_at FROM users WHERE id = ?',
      [insertId],
    );
    if (!rows || rows.length === 0) {
      throw new Error('Failed to fetch created user');
    }

    return this.mapRowToUser(rows[0]);
  }

  async signin(dto: SignInDto) {
    const user = await this.validateCredentials(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async validateCredentials(email: string, password: string) {
    const userRow = await this.findByEmail(email);
    if (!userRow) return null;
    const match = await bcrypt.compare(password, userRow.password_hash);
    if (!match) return null;
    return {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
    };
  }
}
