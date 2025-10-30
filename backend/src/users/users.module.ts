import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MYSQLService } from 'src/database/mysql.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, MYSQLService],
})
export class UsersModule {}
