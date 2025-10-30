import { Module } from '@nestjs/common';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { MYSQLService } from 'src/database/mysql.service';

@Module({
  controllers: [TodosController],
  providers: [TodosService, MYSQLService],
  exports: [TodosService],
})
export class TodosModule {}
