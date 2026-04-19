# title: Caching Cơ Bản: Giải Cứu Database Khỏi Tải Nặng
# description: Hiểu cơ chế hoạt động của Cache để giảm thiểu truy vấn trực tiếp vào Database, bứt tốc độ phản hồi và bẻ gãy nút thắt cổ chai phía lưu trữ.
# body:

## I. Lời mở đầu (The Hook)

App của bạn đã scale ra 20 instances. Mọi thứ mượt mà cho đến khi một celeb nổi tiếng đăng bài quảng cáo sản phẩm của bạn. Đùng một cái, 5 triệu request lao thẳng tới đòi xem... đúng **một** sản phẩm đó. Cả 20 instances hì hục gửi chung một truy vấn đọc Database y chang nhau: `SELECT * FROM product WHERE id = 123`. DB ngộp thở trong cái **lock** tìm kiếm, CPU đụng đỉnh 100%, và chết đứng cục bộ.

Tại sao phải bắt cái máy tính đi tính đi tính lại một phép toán nếu kết quả không khác gì một giây trước đó? Nếu thay thêm máy (**Scale App**) chỉ giải quyết tắc nghẽn xử lý CPU thì **Caching** chính là liều thuốc trợ tim khẩn cấp ngăn Database bị nướng xém bởi luồng đọc lặp đi lặp lại. Hệ thống xịn là hệ thống biết lúc nào nên lười biếng. Cùng vào bài phá băng.

## II. Demo tư duy: Cơ chế "Trí nhớ ngắn hạn"

### 1. Kịch bản không Cache (Hành xác DB)
Luồng tiêu chuẩn cổ điển: Request -> Application -> Gõ cửa DB -> DB cày vào đĩa cứng (disk) rồi trả lời. Quá trình đọc ổ đĩa DB cực kỳ chậm chạp và tốn I/O. Có 10.000 người vào xem bảng xếp hạng, DB phải còng lưng quét 10.000 lần một cái bảng thành tích y xì đúc.

### 2. Lắp Cache làm "người ghi sổ"
Cắm thẳng một **Redis** (DB siêu tốc trên RAM) bọc trước Database:
- **Lần 1 (Cache Miss):** Request số 1 hỏi giá sản phẩm. Redis check thấy trống không. App phải nhảy xuống đào dưới gầm DB thực. Lấy được giá xong, trước khi trả về, App chép nhẹ một bản copy vào Redis (`product:123` -> `{price: 50}`).
- **Lần 2 (Cache Hit):** 9.999 ông khách ngay theo sau ập tới. Đụng cửa Redis, hốt ngay mớ data ngon ăn `{price: 50}` ở bộ nhớ RAM tốc độ sấm sét rồi ném về luôn. DB gốc đang tắt đèn ngủ khò cũng chẳng bị quấy.

Kết quả mong đợi: Thời gian response vọt từ **100ms** (lên thiên đàng gọi DB) xuống sát sàn **2ms** (bốc ở RAM), vãn hồi an ninh cho kho chứa thật.

## III. Giải thích nâng cao & Kết luận

### 1. Tại sao cứ phải nhắc tới RAM?
**Database truyền thống** (MySQL, Postgres) đọc/ghi lưu bền vững bằng ổ đĩa cứng (Disk/SSD) nên sẽ gặp trần cổ chai vật lý của cổng I/O. **Cache** (Redis, Memcached) chứa toàn bộ trên RAM điện tử. RAM phản ứng nhanh khét nhưng hễ giật điện là xóa ký ức bay biến sạch. Vậy nên Cache sinh ra để làm "trí nhớ ngắn hạn", không phải két giữ tiền an toàn gốc.

### 2. Chiến lược giới hạn thời gian (TTL)
Data thực ở DB có thể bị đổi tên, đổi giá bán bất cứ lúc nào. Nếu cứ ốp mãi cái bản dập ở Cache cho khách xem thì gọi là dính dữ liệu hỏng cũ rỉn (Stale Data).
- **TTL (Time To Live):** Một con số hẹn giờ đếm ngược đời người. Gắn vào Redis lệnh: "Cái giá sản phẩm này chỉ sống đúng **60s**". Quá 60s, Redis phẩy tay gạch sổ. Request tới nữa sẽ lọt rớt thành **Cache Miss**, buộc App vòng về DB quét lấy đồ nóng hổi.

### 3. Vấn nạn khủng hoảng Cache 
Xài Cache sung thì sung nhưng dễ dính vố đắng chát khi ăn edge case trên production:
- **Cache Stampede (Hiệu ứng dẫm đạp):** Đúng đỉnh giờ vàng sale, cái món hàng hot dính khoảnh khắc TTL về 0, Cache xóa. Trăm ngàn luồng API đang đói khát hỏi vào chới với hụt Cache, ngay khoảnh khắc đó trào như vỡ đê vào móc chung xuống DB lấy số. DB nổ tức thì. *Cách xử lý: Locking một luồng đợt đầu, hoặc âm thầm sưởi nóng Cache bằng background job (Cache Warming).*
- **Cache Penetration (Bắn xuyên thủng):** Bọn hacker tinh quái cố ý bắn luồng truy vấn `productID` loạn xạ không có thực. Quá trình kiểm tra lủng trượt qua Cache và khoan thẳng cắm phập vào DB liên tiếp, mục đích săn trạng thái "vẫn không có báo không". *Cách xử lý: Chặn đầu bằng Bloom Filter hoặc ghim cả kết quả rỗng (cache "null").*

Cache là thanh kiếm cực bén chặt cụt 90% áp lực **traffic đọc**. Thế với những tập dữ liệu ngày càng khổng lồ dâng trào và các giao dịch **ghi dữ liệu** chen chúc nắn gân? Cuộc phẫu thuật kiến trúc phân thân DB chính thức bắt đầu ở bài sau qua đòn chẻ: **Read Replica & Sharding**.
