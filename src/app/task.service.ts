import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../domain/entities/task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectModel('Task') private taskModel: Model<Task>) {}
//ensayo de commits
  async findAll() { return this.taskModel.find().exec(); }
  async findOne(id: string) { return this.taskModel.findById(id).exec(); }
  async create(data: Partial<Task>) { const task = new this.taskModel(data); return task.save(); }
  async update(id: string, data: Partial<Task>) { return this.taskModel.findByIdAndUpdate(id, data, { new: true }); }
  async remove(id: string) { return this.taskModel.findByIdAndDelete(id); }
}
