import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { ItemsService } from './items.service';
import type { Item } from './items.service';
import { CreateItemDto } from './dto';
import { TimingGuard } from '../../common/guards';
import { ExecutionTimerInterceptor, ResponseTransformInterceptor } from '../../common/interceptors';
import { ParsePositiveIntPipe } from '../../common/pipes';

/**
 * ItemsController — Controller xử lý HTTP request cho domain Items.
 * Áp dụng đầy đủ lifecycle: Guard → Interceptor → Pipe → Controller → Service.
 * (EN: Controller handling HTTP requests for the Items domain.
 * Applies the full lifecycle: Guard → Interceptor → Pipe → Controller → Service.)
 *
 * Không chứa business logic — chỉ nhận request và ủy thác xuống ItemsService.
 * (EN: Contains NO business logic — only receives requests and delegates to ItemsService.)
 *
 * Thứ tự decorator trên controller (vào trước ra sau):
 *   @UseGuards(TimingGuard)                  ← vào trước
 *   @UseInterceptors(ExecutionTimerInterceptor, ResponseTransformInterceptor) ← bao ngoài
 * (EN: Decorator order on controller (first in, last out):
 *   @UseGuards — enters first
 *   @UseInterceptors — wraps outside)
 */
@Controller('items')
// Guard chạy trước interceptor — ghi nhận entry time
// (EN: Guard runs before interceptor — records entry time)
@UseGuards(TimingGuard)
// Interceptors chạy theo thứ tự: Timer bao ngoài, Transform bao trong
// (EN: Interceptors run in order: Timer wraps outside, Transform wraps inside)
@UseInterceptors(ExecutionTimerInterceptor, ResponseTransformInterceptor)
export class ItemsController {
  // NestJS inject ItemsService tự động — không dùng "new"
  // (EN: NestJS auto-injects ItemsService — no "new" keyword)
  constructor(private readonly itemsService: ItemsService) {}

  /**
   * GET /items — Trả về toàn bộ danh sách items.
   * Response sẽ được ResponseTransformInterceptor bọc thành { data, timestamp, requestId }.
   * (EN: GET /items — Returns the full list of items.
   * Response will be wrapped by ResponseTransformInterceptor into { data, timestamp, requestId }.)
   *
   * @returns Item[] — Danh sách items (được wrap bởi interceptor) (EN: list of items (wrapped by interceptor))
   */
  @Get()
  findAll(): Item[] {
    // Ủy thác hoàn toàn cho service — controller không tự truy cập data
    // (EN: Fully delegate to service — controller does not access data directly)
    return this.itemsService.findAll();
  }

  /**
   * GET /items/:id — Trả về item theo id sau khi validate qua ParsePositiveIntPipe.
   * (EN: GET /items/:id — Returns item by id after validation through ParsePositiveIntPipe.)
   *
   * Lifecycle đầy đủ của endpoint này:
   *   Middleware → Guard(TimingGuard) → Interceptor(Timer+Transform) → Pipe(ParsePositiveInt) → Handler → Service
   * (EN: Full lifecycle of this endpoint:
   *   Middleware → Guard(TimingGuard) → Interceptor(Timer+Transform) → Pipe(ParsePositiveInt) → Handler → Service)
   *
   * @param id - ID từ route param, đã được ParsePositiveIntPipe validate và convert sang number
   *             (EN: ID from route param, already validated and converted to number by ParsePositiveIntPipe)
   * @returns Item — Item tìm được (EN: found item)
   */
  @Get(':id')
  findOne(
    // Pipe chạy tại đây — validate 'id' là số nguyên dương trước khi vào handler body
    // (EN: Pipe runs here — validates 'id' is a positive integer before entering handler body)
    @Param('id', ParsePositiveIntPipe) id: number,
  ): Item {
    // Ủy thác cho service — controller không tự tìm kiếm data
    // (EN: Delegate to service — controller does not search data itself)
    return this.itemsService.findOne(id);
  }

  /**
   * POST /items — Tạo item mới từ request body đã được validate bởi ValidationPipe global.
   * (EN: POST /items — Creates a new item from the request body validated by the global ValidationPipe.)
   *
   * Lifecycle của endpoint này:
   *   Middleware → Guard → Interceptor → [ValidationPipe ← class-validator ← CreateItemDto] → Handler → Service
   * (EN: Lifecycle of this endpoint:
   *   Middleware → Guard → Interceptor → [ValidationPipe ← class-validator ← CreateItemDto] → Handler → Service)
   *
   * Nếu body không hợp lệ (thiếu field, sai type, vi phạm rule), ValidationPipe ném HTTP 400
   * với danh sách lỗi chi tiết trước khi request chạm đến handler.
   * (EN: If body is invalid (missing fields, wrong type, rule violations), ValidationPipe throws HTTP 400
   * with a detailed error list before the request reaches the handler.)
   *
   * @param dto - Body đã được transform và validate (EN: transformed and validated body)
   * @returns Item — Item vừa tạo (EN: newly created item)
   */
  @Post()
  // Trả về HTTP 201 Created thay vì 200 — convention chuẩn cho POST tạo mới tài nguyên
  // (EN: Return HTTP 201 Created instead of 200 — standard convention for POST creating a resource)
  @HttpCode(HttpStatus.CREATED)
  create(
    // @Body() + ValidationPipe global tự động:
    //   1. Đọc JSON body từ request
    //   2. class-transformer: plain object → CreateItemDto instance
    //   3. class-validator: validate decorators trên CreateItemDto
    //   4. Ném HTTP 400 nếu có lỗi, ngược lại truyền dto vào handler
    // (EN: @Body() + global ValidationPipe automatically:
    //   1. Reads JSON body from request
    //   2. class-transformer: plain object → CreateItemDto instance
    //   3. class-validator: validates decorators on CreateItemDto
    //   4. Throws HTTP 400 if errors, otherwise passes dto to handler)
    @Body() dto: CreateItemDto,
  ): Item {
    // Ủy thác cho service — dto đã sạch, không cần validate thêm ở đây
    // (EN: Delegate to service — dto is already clean, no extra validation needed here)
    return this.itemsService.create(dto);
  }
}
