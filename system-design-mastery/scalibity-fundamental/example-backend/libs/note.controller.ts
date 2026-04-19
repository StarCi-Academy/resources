import { Body, Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hostname } from 'os';
import { Repository } from 'typeorm';
import { Note } from './note.entity';

/**
 * Controller chung cho cả hai app
 *
 * @remarks Trả kèm hostname để nhận diện pod nào phục vụ request.
 * (EN: Returns pod hostname so you can tell which pod handled the request.)
 */
@Controller('notes')
export class NoteController {
  // HOSTNAME trong K8s container == tên pod
  // (EN: HOSTNAME inside a K8s container equals the pod name)
  private readonly podName = process.env.HOSTNAME ?? hostname();

  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  /**
   * Tạo note mới
   *
   * @param body - `{ content: string }` nội dung (EN: note content)
   * @returns note đã lưu và pod đã xử lý
   */
  @Post()
  async create(@Body() body: { content: string }): Promise<{ pod: string; note: Note }> {
    // Lưu note kèm podName để quan sát phân bố ghi
    // (EN: persist with podName to observe write distribution)
    const note = await this.repo.save(
      this.repo.create({
        content: body.content ?? '(empty)',
        createdByPod: this.podName,
      }),
    );
    return { pod: this.podName, note };
  }

  /**
   * Liệt kê note
   *
   * @returns danh sách note + tổng số + pod đã phục vụ
   * @remarks postgres-app → mọi pod trả về cùng list; sqlite-app → mỗi pod list khác nhau.
   * (EN: postgres-app → every pod sees the same list; sqlite-app → each pod sees its own list.)
   */
  @Get()
  async list(): Promise<{ pod: string; count: number; notes: Note[] }> {
    const notes = await this.repo.find({ order: { id: 'DESC' }, take: 50 });
    return { pod: this.podName, count: notes.length, notes };
  }

  /**
   * Healthcheck cho liveness/readiness probe
   *
   * @returns `{ pod, ok: true }`
   */
  @Get('health')
  health(): { pod: string; ok: true } {
    return { pod: this.podName, ok: true };
  }
}
