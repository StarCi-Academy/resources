# title: Scalability là gì? Nút thắt khi Traffic tăng
# description: Khái niệm cốt lõi về scalability. Tại sao hệ thống thường đứt ở database thay vì ứng dụng khi lượng người dùng đột ngột tăng cao.
# body:

## I. Lời mở đầu (The Hook)

Một ngày đẹp trời, chiến dịch marketing của công ty bạn thành công rực rỡ mang về lượng người dùng tăng gấp 10 lần. Và bùm — hệ thống **sập**. Bạn bị dựng dậy lúc 2h sáng, chắp vá bằng cách restart service, nhưng nó lại sập tiếp ngay sau đó. 

Khi phỏng vấn, câu hỏi "Nếu hệ thống tăng gấp 10 lần traffic, bạn làm gì?" luôn khiến nhiều ứng viên lúng túng. Hầu hết đều vội vàng trả lời "em thêm **RAM**" hoặc "em chạy thêm **instance**". Vậy nếu thêm machine xong mà hệ thống vẫn kẹt ở **database** thì sao? Bài học này sẽ giúp bạn nhìn ra bức tranh tổng quát: khi request tăng đột biến, hệ thống bị **đứt** ở đâu và tư duy để bắt đúng bệnh.

## II. Demo tư duy: Lần theo dấu vết luồng request

Vì đây là bài nền tảng, chúng ta không cần code. Hãy cùng vẽ một luồng **request** thường thấy để tìm điểm nghẽn bằng trực giác.

### 1. Kịch bản bình thường
Khi người dùng truy cập mua hàng, request đi từ điện thoại lên **API Server**, rồi tới **PostgreSQL** để kiểm tra tồn kho. Nếu có 100 người mua/phút, một con server ứng dụng vừa xử lý mượt mà tác vụ và phản hồi cực nhanh dưới mức **50ms**.

### 2. Kịch bản đợt bùng nổ (Traffic Spike)
Bây giờ có 10.000 người mua cùng lúc trong sự kiện Flash Sale:
- **API Server** bắt đầu nghẽn tính toán, CPU lên 100%. Request đứng chờ nhau gọi API.
- Các API gửi truy vấn dồn dập vào **PostgreSQL**, kết nối bị đầy sinh ra lỗi ngắt kết nối.
- Thời gian response từ **50ms** tụt thành **5000ms**, màn hình người dùng treo. 

Kết luận: Toàn bộ hệ thống sập. Vấn đề không chỉ nằm ở thiếu RAM máy chủ, mà tài nguyên nào là **stateful** (phải duy trì dữ liệu như database) thì nút thắt sẽ chạy tới đó. Đây là lúc chúng ta phải giải trực tiếp bài toán scalability.

## III. Giải thích nâng cao & Kết luận

### 1. Bản chất của Scalability
**Scalability** (Khả năng mở rộng) không chỉ là vung tiền thêm máy móc. Nó là khả năng một hệ thống duy trì hoặc cải thiện hiệu năng tỷ lệ thuận với nguồn tài nguyên được bơm thêm vào. Nếu bạn tăng sức mạnh phần cứng lên gấp đôi thiết kế tệ, lượng request thực tế chịu thêm được tối đa chỉ 20% — như thế gọi là **không scalable**.

- **Ví dụ 1:** Các dịch vụ **stateless** (không lưu trạng thái) thường dễ mở rộng ngang. Bạn cứ cấp thêm instance, tự động xử lý tiếp.
- **Ví dụ 2:** **Database** mang tính lưu giữ. Có thêm mười tầng Web Server mà cơ sở dữ liệu bị quá tải thao tác ghi, thì hệ thống vẫn tắc rịt vì **lock** của DB.

### 2. Scale Up vs Scale Out
Khi bị dồn ép tải trọng, bạn có hai lối thoát:
- **Scale Up (Vertical Scaling):** Nâng cấp chính cái máy hiện tại. Gắn thêm **RAM**, thay CPU. Nhanh gọn mà chả cần sửa code. Nhược điểm chí tử là nó **Single Point of Failure** (chết là sập luôn) và phần cứng có giới hạn.
- **Scale Out (Horizontal Scaling):** Mua hàng nghìn máy trạm phân tán rẻ tiền. Điểm mạnh vượt trội của thế giới phân tán. Nhưng rủi ro đổi lại là chi phí quản lý vận hành điều phối traffic giữa chúng cực kỳ nặng đầu.

Khép lại khái niệm, điều bạn cần chuẩn bị là đối phó bằng nghệ thuật điều phối — xem ngay giải pháp qua **Load Balancer** từ bài tiếp theo.
