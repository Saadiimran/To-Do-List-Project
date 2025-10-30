import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import mysql from 'mysql2/promise';

@Injectable()
export class MYSQLService implements OnModuleInit, OnModuleDestroy {
  private pool: mysql.Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'RepairDesk1234@/',
      database: 'mydb',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  getPool() {
    return this.pool;
  }
}
