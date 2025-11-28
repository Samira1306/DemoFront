import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Buy groceries' })
  title?: string;

  @ApiPropertyOptional({ example: 'Milk, eggs, bread' })
  description?: string;

  @ApiPropertyOptional({ type: String, example: new Date().toISOString() })
  dueDate?: Date;

  @ApiPropertyOptional({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, example: TaskStatus.PENDING })
  status?: TaskStatus;
}
