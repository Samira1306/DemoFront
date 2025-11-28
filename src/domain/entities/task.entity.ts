export enum TaskPriority { LOW, MEDIUM, HIGH }
export enum TaskStatus { PENDING, COMPLETED }

export class Task {
  constructor(
    public id: string,
    public userId: string,
    public title: string,
    public description: string,
    public dueDate: Date,
    public priority: TaskPriority,
    public status: TaskStatus,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}
}
