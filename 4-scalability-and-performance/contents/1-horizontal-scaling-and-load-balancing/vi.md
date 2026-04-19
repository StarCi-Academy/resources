# title: Scale ngang & Load Balancer: Phân chia tải
# description: Hiểu cách nhân bản service thành nhiều replicas (horizontal scaling) và dùng Load Balancer để phân phối request đồng đều, tránh hệ thống quá tải cục bộ.
# body:

## I. Lời mở đầu (The Hook)

Bạn đã quyết định mua thêm server để giải quyết bài toán tải trọng ở bài trước. Giờ bạn có 5 cái con app server chạy mượt. Vậy làm sao để cái điện thoại của khách hàng biết gọi request vào máy nào? Gọi ngẫu nhiên? Đổ dồn luân phiên? Nếu server số 3 bị chết đứt giữa chừng thì sao? 

Một trong những sai lầm chết người nhất là kẹp trực tiếp domain vào một instance cứng cựa. Một mạng lưới server không chỉ cần **có mặt** đông — chúng phải có một chiến lược **điều phối** đứng chặn ở trước, tỉnh táo biết server nào nghẽn, máy nào lỗi để chia việc nhịp nhàng. Hôm nay chúng ta đào sâu bộ đôi song hành làm nòng cốt: **Horizontal Scaling** (nhân bản phân tán) và **Load Balancer** (người điều phối chỉ huy).

## II. Demo tư duy: Từ một máy đến cụm máy

### 1. Scale Out: Bơm thêm Replicas
Hãy tưởng tượng hệ thống giỏ hàng e-commerce. Lúc đầu chạy duy nhất `Cart-Service-A`. Khi giật lag do CPU cháy khét, ta đắp thêm `Cart-Service-B` và `Cart-Service-C`. Quá trình dàn quân này là **Horizontal Scaling** (nhân bản lên 3 node). 
Nhưng khổ nỗi, nếu app điện thoại vẫn gọi khư khư vào chiếc port của instance A, thì B và C đứng rảnh uống trà!

### 2. Lắp Load Balancer cầm trịch
Chúng ta bệ một trụ **Load Balancer** gác ở cửa 3 node đó:
- Tất cả request từ bên ngoài nã đúng 1 đường vào **Load Balancer**.
- LB soi vào cấu hình và tự chia lạch: anh thứ 1 vào node A, anh 2 sang B, anh 3 vào C theo thuật toán công bằng nhất.

Kết quả mong đợi: Khách luôn thấy ping thấp giật mình, dù sau tấm màn là mười con instance đang mệt lả đổi kíp trực cho nhau. Kiến trúc chịu lỗi **stateless** đã thiết lập xong.

## III. Giải thích nâng cao & Kết luận

### 1. Vì sao App bắt buộc phải là Stateless?
**Horizontal Scaling** chỉ thành công khi ứng dụng tuân thủ luật **stateless** (không giữ trạng thái). Nếu API đăng nhập của bạn cất session ở RAM của node A, bữa sau LB lái request mua hàng của người đó sang node B -> ứng dụng sẽ tát `Unauthorized` chửi khách chưa login.
- **Cách xử lý:** Giải thoát trạng thái khỏi cục RAM app server. Ném thông tin định danh vào một token JWT hoặc dịch nguyên chùm ra một kho cache dùng chung (như **Redis**).

### 2. Thuật toán chia rẽ của Load Balancer
**Load Balancer** không ném request đi loạn xạ. Tuỳ đặc tính luồng, nó bám sát:
- **Round Robin:** Chuyền tay đều tăm tắp (A -> B -> C -> về A). Cơ bản, công bằng, an toàn sinh mạng.
- **Least Connections:** Quăng việc cho anh nào đang rảnh (ít kết nối nhất). Cực phù hợp với kiến trúc có request "chôn chân" chạy CPU hồi lâu không nhả.

### 3. Layer 4 vs Layer 7 Load Balancing
- **Layer 4 (Transport):** Thuần tuý chọc vào tầng giao vận thao tác IP và Port, nhanh xé gió vì chả cần mổ xẻ gói tin HTTP. Rất lý tưởng cho điều phối sỉ cước độ trễ cực nhỏ tại biên mạng.
- **Layer 7 (Application):** Nắm rõ ruột gan gói HTTP. Nó đọc path URL, biết tỏng bạn gọi cộc `/api/images` để ném về chùm server trữ ảnh, hay request `/api/payment` để luân chuyển về server tính tiền bảo mật.

Khi Application layer mở rộng ngang hàng nghìn server qua **Load Balancer**, cái kim tự tháp lộn ngược lại dồn cả tỷ lượng truy vấn trỏ ngược móc vào một cái Database cũ mèm gánh vác ở cuối cùng. Vậy đó, nút nghẽn cổ chai thần thánh lại nảy sinh tại DB. Bài cứu hoả cấp tốc? Xin giới thiệu ứng cử viên đầu bảng: **Caching**.
