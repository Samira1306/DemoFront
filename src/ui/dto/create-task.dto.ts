import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'user-123' })
  userId!: string;

  @ApiProperty({ example: 'Buy groceries' })
  title!: string;

  @ApiProperty({ example: 'Milk, eggs, bread' })
  description!: string;

  @ApiProperty({ type: String, example: new Date().toISOString() })
  dueDate!: Date;

  @ApiProperty({ enum: TaskPriority, example: TaskPriority.MEDIUM })
  priority!: TaskPriority;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.PENDING })
  status!: TaskStatus;
}
