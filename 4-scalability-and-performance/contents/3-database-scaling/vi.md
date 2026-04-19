# title: Scale DB: Read Replica & Sharding chống giới hạn
# description: Khám phá bí kíp cuối cùng để bảo vệ Database gốc. Tách luồng Read/Write qua Replica và băm nhỏ dữ liệu bằng Sharding để thoát cảnh một cục cơ sở dữ liệu gánh còng lưng.
# body:

## I. Lời mở đầu (The Hook)

App của bạn đã có **Load Balancer** gánh tải CPU, và đã xài **Redis** chặn đứng các truy vấn đọc. Nhưng rồi công ty mở đợt siêu sale "điên rồ", không chỉ đổ xô vào xem, mà người ta đua nhau **đặt hàng**, **chốt đơn**, đăng ký liên tục. 
Tất cả những thao tác lưu trữ đó là **lệnh ghi (Write)** — nó không thể nhét tạm bợ vào Cache vì cần sống sót sau cú giật điện. Hàng trăm nghìn lệnh INSERT dội như mưa đá thẳng xuống con **PostgreSQL** Master duy nhất. Chẳng mấy chốc nó khóa nghẽn dữ liệu (**table lock**), nghẹt đường thở I/O đĩa cứng cứng, và bùm, app lại treo. 

Đến đây, nâng cấp CPU/RAM cho cái cục DB (Scale Up) đã đụng giới hạn thẻ tín dụng. Làm sao rẽ nhánh chảo lửa quá tải của "nồi cơm linh thiêng" duy nhất này, trút nó xuống nhiều máy mà không làm nát vụn cục data? Hôm nay chúng ta nã đại bác thẳng vào hai bài thuốc Scale DB sát thủ: **Read Replica** (tách luồng hớt bọt) và **Sharding** (băm nát xẻ thịt dữ liệu).

## II. Demo tư duy: Tháo gông cho kho chứa

### 1. Phép cắt lớp tải: Read Replica (Bản sao đọc)
Đa số ứng dụng hiện đại sống với tỷ lệ lệch thảm hại: **10 lần truy vấn đọc mới có 1 lệnh ghi**. 
Thay vì để chiếc DB lủi thủi vừa cày lệnh ghi vừa è cổ bới đồ phục vụ luồng đọc khổng lồ, ta dựng mô hình Primary-Replica:
- **Máy Primary (Master):** Chuyên tâm trị vì độc tôn. Chỉ gật đầu mở cửa tiếp nhận toàn bộ lệnh thay đổi (INSERT, UPDATE, DELETE).
- **Máy Replica (Read-only):** Đóng vai phó tướng liên tục nghe lén và đồng bộ dữ liệu chép lại từ Primary. Nó chỉ mở cửa riêng biệt dể hầu hạ dàn truy vấn SELECT của người dùng.
- Khi code App, bạn điêu khắc dòng dẩy lệnh: Ghi/sửa đơn hàng? Thả vô Primary. Mở list lịch sử tài khoản? Đá qua Replica.

Kết quả: Hiệu năng Primary bung lụa hết nấc vì được giải cứu hoàn toàn khỏi ma trận quét bảng tìm kiếm cồng kềnh.

### 2. Phép băm ngang dữ liệu: Sharding / Partitioning
Kể cả khi rẽ nhánh đọc, con Primary độc cô cầu bại vẫn sẽ bốc hỏa nếu lượng băng thông cày nát 100.000 lệnh ghi/giây hoặc khi bảng `users` béo mập tới hàng Terabyte.
Lúc này ta bung tuyệt kĩ cuốicùng **Sharding**: Ném chiếc bánh khổng lồ ra vạn dặm cất nhặt ở các kho nhà khác nhau.
- Máy Shard số 1: Kho đóng cửa dữ liệu của đám user ID từ 1 tới 1.000.000.
- Máy Shard số 2: Nhốt dữ liệu từ user ID trên 1 triệu.
- App trước khi đẩy số phải làm một lệnh dẫn đường Toán học (ví dụ: băm hash key `Hash(user_id) % số shard`) để định vị ném cục hàng trúng chóc vào rổ Shard mấy.

Kết quả mong đợi: Database vượt mọi ranh giới. Bạn càng ném thêm cụm máy vào, mớ dữ liệu tản mát càng nhuyễn nhẹ nhàng. Đổi lại, mọi tư duy thiết kế kho dữ liệu buộc phải đập đi xây lại.

## III. Giải thích nâng cao & Kết luận

### 1. Cuộc vật lộn với Replication Lag
Ám ảnh bám đuôi Read Replica nằm gọn ở **Replication Lag** (Độ trễ đồng bộ). Cái tick dữ liệu vừa ẩy vào Primary phải mất một thoáng qua rãnh chớp mili giây (hoặc kẹt xe mạng thì vài giây) mới chảy tới kịp Replica.
- **Vấn đề:** Khách hàng quệt the đổi mã PIN sờ sờ ở Primary, bấm tải F5 app nó lại cắm vô Replica rớt mạng, đọc cái ruột cũ rỉn vỗ mặt báo "mật khẩu sai".
- **Cách xử lý:** Những flow máu chốt cần **Strong Consistency** tuyệt đối (thanh toán, tài chính mỏng manh), bạn cứ ngạo nghễ đạp vô luồng đọc Primary cho kiên cố. Sân chơi Replica sinh ra cho những thứ khoan dung **Eventual Consistency** (có thể bao dung chậm trễ một tý xíu).

### 2. Bãi mìn rã tan tành mang tên Sharding
**Sharding** là cú nhảy vọt của những thế lực đại bàng (Twitter, Facebook băm ra theo châu lục đại lý), nhưng cạm bẫy lót đầy đường:
- **Hotspot (Nóng dồn ứ cục bộ):** Nếu bạn cắt bánh theo trọg lượng user mà trúng ngay góc máy nhốt đúng tay KOL đệ nhất Top 1 đang live thả mã sale? Cái Shard đó gồng mình nổ tung, trong khi chín mươi chín anh Shard kề bên mút tay cười chơi. Phải dồn mọi thứ trí tuệ chọn đúng nhãn **Shard Key** cho thật tinh vi.
- **Tuyệt mệnh rẽ nhánh JOIN:** Data người mua nằm Shard A, kho hàng địa chỉ vứt bên Shard B. Viết lệnh thần thánh SQL `JOIN` chọc thẳng là chuyện của thế kỷ trước. Muốn moi ra báo cáo thì buộc phải bê mớ hỗn mang lên tầng code Application mà thủ công tẩn mẩn vắt lại với nhau.

Database là thành lũy mỏng manh cuối cùng, chọc thủng là bục vỡ cả cơ đồ. Nhưng thiết nghĩ, tại sao không tẩn cho mấy luồng traffic phá hoại rớt rụng ngay ngoài biên cửa luôn đi trước khi nó lác mắt mò đường vào DB? Chốt sổ module với hai chiếc ô dù vệ sĩ vạm vỡ: **Rate Limiting và CDN**.
