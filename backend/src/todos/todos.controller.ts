import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './Dto/create-todo.dto';
import { UpdateTodoDto } from './Dto/update-todo.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateTodoDto, @Req() req: any) {
    const userId = Number(req.user?.id ?? req.user?.sub);
    return this.todosService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Req() req) {
    const userId = req.user?.id; // depends on your auth guard
    return this.todosService.findAll(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.todosService.remove(id);
    return { success: true };
  }
}
