# title: Bảo vệ biên: Rate Limiting & CDN làm lá chắn
# description: Khám phá cách chẻ gãy đợt tấn công từ chối dịch vụ hay chặn đứng lượng request spam đột ngột bằng Rate Limiting. Đồng thời tăng tốc tài nguyên tĩnh siêu việt nhờ mạng lưới CDN toàn cầu.
# body:

## I. Lời mở đầu (The Hook)

Hệ thống của bạn đã scale hoàn mỹ từ Load Balancer chẻ tải, đắp Redis lót đường, cho đến Sharding xẻ thịt Database. Nhưng nửa đêm hôm đó, bảng giám sát báo đỏ choét: một gã hacker rỗi việc dùng tool bắn tung tóe 1 triệu request mỗi giây thẳng vào API Login để "dò pass" brute-force. Thế là dàn server đắt tiền của bạn lại vật vã cày cuốc luồng mã hóa bảo mật, tài nguyên bốc hơi sạch bách, đánh sập nhịp sống của khách hàng thật.

Bạn không thể cứ hếch mũi mua thêm server vung tiền để phục vụ các đợt request rác rưởi vô tri. Trí thông minh tối thượng của hệ thống phân tán nằm ở chỗ: Kẻ thù hay traffic điên loạn phải bị đập chết từ ngoài cổng thành, tuyệt đối không cho chạm móng chân vào bãi cỏ Application hay Database. Xin giới thiệu hai tấm khiên vệ sĩ cứng cáp nhất thế giới mạng: **Rate Limiting** (bóp cổ tốc độ) và **CDN** (mạng phân phối đánh dư ảnh).

## II. Demo tư duy: Rào chắn và lưới siêu tốc

### 1. Bóp nghẹt kẻ phá hoại: Rate Limiting
Thay vì cắn răng gánh vác xử lý mọi cuộc gọi tới tấp, ta cắm một chốt biên phòng **Rate Limiter** ngay mép lối vào (thường gắn trên **API Gateway** hoặc Load Balancer):
- Khách A truy cập bình thường lạch cạch vài chạm: Trạm gác đếm "À, anh này tốn 2 quyền truy cập trong phút này. Cho qua".
- Hacker B xả súng liên thanh móp phím: "Tay IP này đã pump 100 request trong 5 giây. Vượt ngưỡng bạo lực!". Lập tức trạm gác tát thẳng cái tát mã HTTP `429 Too Many Requests` đập thẳng mặt, và vứt bỏ packet tin xuống địa ngục tức thì. App Server bên trong chẳng hề hấn hay sứt móng tay.

Kết quả mong đợi: Hệ thống không bị "đứt" trước những đợt DDOS điên loạn lớp ứng dụng. Đời sống anh em kĩ sư bình yên trở lại.

### 2. Khoán gọn đồ nhẹ cho tay sai: CDN (Content Delivery Network)
Tưởng tượng server gốc cắm sâu ở bên bờ Tây nước Mỹ, nhưng khách hàng ở Việt Nam truy cập web lôi về ba cái ảnh banner JPG tổ chảng tốn tới 2 giây chui hầm cáp quang Thái Bình Dương. Vô duyên ở chỗ, đồ tĩnh không mang logic tính toán, nhưng nó luộc sạch băng thông đường ống.
- Bạn giao phó trọn gói cho mạng lưới **CDN** (như Cloudflare, AWS CloudFront).
- CDN vốn rải hàng ngàn máy trạm phủ khắp bản phủ thế giới (Edge servers). Lần đầu tiên ai đó đòi tấm hình, CDN xồng xộc chạy qua Mỹ chép lại. Về sau, khi hàng khu phố ở Việt Nam gọi tấm hình đó, cái trạm Edge biên phòng đứng cạnh mép nhà mạng địa phương sẽ nhè luôn tấm hình rớt vô mặt khách trong đúng **10ms**.

Kết quả mong đợi: Khách load hệ thống tĩnh lột xác bay trong chớp mắt. Server gốc ngủ êm trút đi 90% chi phí hóa đơn cước băng thông đắt đỏ.

## III. Giải thích nâng cao & Kết luận

### 1. Thuật toán của Rate Limiting
Bạn không thể vểnh mỏ đếm bằng ngón tay. Rate Limiter gồng mình tính toán bằng toán logic thường bám trên luồng **Redis**:
- **Token Bucket (Xô đựng xu):** Phát cho hệ thống một cái xô giữ 5 token (năng lực bạo phát tối đa). Cứ 1 giây nhỏ giọt thả vô rào rào 1 token phuc hồi. Khách gọi 1 phát phá đi 1 token. Rỗng xô là sập đát chém chặn lại 100%. Là thuật ngữ kinh điển thỏa mãn khách thi thoảng bùng nổ theo cụm chớp nhoáng (burst).
- **Fixed Window / Sliding Window:** Đếm mộc mạc theo đồng hồ đúng từng khung (từ 0:00 -> 0:01 có 100 hit). Bao vây ngây thơ và rất nhẹ, nhưng lỡ ôm bom dính đợt lướt khách xả khùng điên ở cửa thời trang lấn múi thì dễ lật thuyền x2 thông lượng trôi vào.

### 2. Quyền năng tột bậc (Edge Caching) của CDN
**CDN** về bản chất chính xác là một con quái vật Cache địa lý khổng lồ bao lấy Trái Đất.
Bí kíp của nó là mượn đạo "ở gần chém lẹ bỏ qua đi xa". Thay vì căng xác scale băng thông hệ thống máy chủ tổng bộ Mỹ, bạn phân tán copy toàn file nhẹ nhàng cắm xung quanh cổng chốt khách hàng.
Tuy nhiên, cấu hình file đính trên **CDN** dính ngay nhược điểm như mọi Caching: Xóa file củ chuối. File code `app.js` sửa rồi cập bến Production khét lẹt mà khách vẫn miệt mài xài app cũ, gọi lên tổng đài vì con CDN ương bướng chưa quét nhả Invalidation cache.

***

**Kết luận module Scale and Performance:**
Chúng ta đã nhặt nhạnh lắp ráp từ việc đẻ chi chít máy (Horizontal Scaling), rải quân gánh việc (Load Balancer), che giấu bớt gánh nặng bằng bộ não ngắn hạn (Caching), chẻ gáy tách cốt cục tạ gốc (Database Sharding & Replica), cho đến kéo lô bọc lưới thép biên giới để rủn kẻ địch (Rate Limiting & CDN).
Hãy ngẩng cao đầu! Hệ thống không còn là củ hành bị tắc họng đứt gánh rớt đài bí ẩn, mà đã chia ô thành các cửa ải thông tắc vật lý — châm ngòi sẵn kĩ năng sống sót và bước tiếp vào tầng thượng thừa bền bỉ Reliability ở phần kế hoạch tiếp theo!
