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

@Controller('task')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateTodoDto, @Req() req: any) {
    const userId = req.user?.id;

    return this.todosService.create(dto, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll() {
    return this.todosService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.findById(id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTodoDto) {
    return this.todosService.update(id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('id')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.todosService.remove(id);
    return { success: true };
  }
}
