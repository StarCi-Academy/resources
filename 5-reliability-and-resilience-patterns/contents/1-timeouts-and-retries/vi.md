# title: Bóp cổ chờ đợi: Timeout và nghệ thuật Retry
# description: Khống chế các lời gọi API lửng lơ ngâm giấm bằng lưỡi dao Timeout. Học cách Retry kết hợp cơ chế lùi bước hàm mũ để cứu vớt tình hình mà không bóp sập người đồng đội đang kiệt sức.
# body:

## I. Lời mở đầu (The Hook)

Service Thanh toán của bạn đang vẫy tay gọi qua Service Ngân hàng để trừ tiền ví. Hành trình bình thường lướt nhẹ 100ms. Nhưng chớ trêu, hôm nay vỉa hè đào xới làm cái cáp quang méo móp rỉ máu. Thằng Service Ngân hàng không gãy hẳn, nhưng lếch thếch tốn chẵn 10 phút mới cày xong lệnh trả lời.
Điểm mù cắm ngập dao là thư viện web client mặc định bạn lôi trên mạng (bất kì hệ nào) đôi khi bị... **quên béng mốc timeout** (hoặc vứt rác tận mốc 120 giây). Thế là hàng vạn giao dịch nộp tiền dồn ứ lại, tóm chặt cổ sợ dây kết nối không buông, nuốt cạn hàng nghìn Thread linh hồn máy chủ của bạn. Màn hình điện thoại văng xoay tít không đáy. Kết cục, tự bản thân cái Service Thanh toán của bạn nứt tung họng bộ nhớ vì quá tải đứt dây đàn dù ngó vô chả có một dòng bug code nào.

Lạc bộ giữa sa mạc phân tán, thói do dự và "đứng chờ mù quáng" đồng nghĩa với hành huyết. Bài toán hất thẳng sự lì lợm bằng lưỡi hái **Timeout**, và nếu lỡ hụt thì nặn bài **Retry** sao cho tử tế.

## II. Demo tư duy: Nhát chém đứt hơi và ủ mưu gọi lén

### 1. Phán quyết lạnh lùng: Timeout
Từ nay, mọi bước ra đòn gọi mạng chui hầm nào (gọi API nội bộ, gọi chọc DB, nhá cái rờ Redis) **TUYỆT ĐỐI BẮT BUỘC** phải có mốc thòng lọng thời gian.
- **Để ngỏ Timeout:** Code trây ỳ, treo cứng họng 2 phút xé nát 500 tiến trình đồng đội.
- **Kẹp chốt Timeout = 3s:** Phát lệnh gọi. Cái đồng hồ tíc tắc nhẩm đúng 3 mi-li-second. Ko ai ậm ừ bắt máy? Tiêm thẳng một mũi lỗi `Request Timeout` rẹt rẹt cắt cầu, ói trả mặt bộ đệm RAM với vòng chạy CPU lao đi gánh vác việc cho khách hàng khác liền.

### 2. Sự ngây thơ tàn bạo của vòng xoáy Retry
Ăn rát lỗi Timeout, dân "gà trẩu" cắm luôn chiếc lặp miệt mài:
```javascript
while(fails) { fireApi(); }
```
Con vòng lặp máy móc này xui rủi hóa thân thành vũ khí **DDOS tàn sát** vỗ mặt đối thủ. Nếu dàn Server bên Ngân hàng đang điêu đứng thẫn thờ vì hụt RAM hụt thở, bạn nã vô vàn súng 10.000 cú Retry vào đầu nó trong vòng một phút — nó tắt điện sập ngõ chánh thức vĩnh viễn.

### 3. Vầng thái dương Exponential Backoff (Giãn nhịp hàm mũ)
Người mưu trí thiết kế hệ tĩnh nhả rải thảm theo đà **Exponential Backoff**.
- Cú táng 1: Sập lưới. Hít thở ngừng bắn 1 giây rồi nhả đạn.
- Cú táng 2: Khựng lỗi tiếp. Á chà bên kia yếu máu thật. Dừng giãn thưa ra 2 giây hẵng tới.
- Cú táng 3: Lùi lại nằm chờ 4 giây.
- Cú táng 4: Buông tới mốc 8 giây xa xăm.
Kết quả mong đợi: Cách thiết kế lỏng mở ra cái "khoảng thở" cực quý giá cho server đầu kia vuốt mặt dọn rác nhặt nhịp sống lại, chặn đứng lối đi ôm xăng đổ phụ vào tòa nhà cháy.

## III. Giải thích nâng cao & Kết luận

### 1. Chiếc bẫy ngọt dẻo của dao Timeout
- Chọc Timeout sao cho trúng? Khép vội 500ms thì quá bạo tay, khách thẻ chưa kịp lướt mạng qua ngân hàng đã tát mặt kêu sập mạng. Nhưng dông dài 10 giây ôm ấp thì lại ôm bom nổ bộ nhớ.
- **Luật chơi tiêu chuẩn (Rule of thumb):** Đo số liệu lấy tham số `p99` metrics kinh điển (99% số phận request mướt mải sẽ chạy gọn gàng nằm mốc tầm bao lâu). Nếu ngó thấy 99% thường chạy loanh quanh mốc 200ms, thì mỏ neo mốc Timeout xông xênh đặt 1 giây là tuyệt phẩm trọn vị nhất.

### 2. Nghệ thuật hóa giải dẫm đạp: Jitter (Gây nhiễu rung)
Cảnh tượng mười nghìn cái máy giật mạng vỡ lúc 20:00:00. Cái app cài chấu ngu ngốc `Retry sau 5s`. Nghĩa là đúng giây thứ 5, toàn bộ sư đoàn mười nghìn request đồng loạt phất cờ sống dậy xục sập vỡ mặt cục server gồng yếu ngay một tíc tắc mili-giây chung đụng. Hiện tượng xô đổ đó mang tên Đàn Thú Vỡ Trận (*Thundering Herd*).
- **Thả nhiễu loạn Jitter:** Bộ khung lùi bước ko phang đóng đinh `4s` nữa, mà cài thêm cục lò xo rung `4s + Random(0s tới 1s)`. Khách A dội đạn vô lúc 4.1s, Khách nữ B xộc vào lúc 4.8s. Đội quân chằng chịt bị xẻ lẻ tải rụng thưa tớt ra mỏng dính. Máy chủ thong dong rỉa nốt nhịp nhàng.

### 3. Lời thề độc mang tên Idempotency
Bạn chọt lệnh trừ ví 500 ngàn. Trễ **Timeout** đứt đoạn. Bạn xanh mặt tưởng xịt nên dỏng dạc nhả **Retry** bồi thêm cho chắc cú. Nhưng trời ạ... đằng ruột sâu máy chủ kia nó đã lẳng lặng cào trừ máu chót lọt nãy rồi, chỉ là xui mạng xé vỡ vụn mất tin "Thành công" đi về không báo mặt. Bụp phát, hóa ra bạn vặt lông móc ví đúp hai nháy của một anh dân nghèo đen đủi.
Bất kỳ cá nhân nông nổi nào vẽ cái lõi gọi **Retry** dồn dập mà đường đi ko xẻ lối chuẩn **Idempotency** (Gọi 1 hít hay nhào gọi 100 lần kết tủa chung cục vẫn thản nhiên gây duy nhất 1 lần thay đổi chốt như dao trích) — thì dọn tủ giấy đuổi cổ lên thớt ngồi ngay chiều đó.

Gọi lui tới mòn mỏi **Retry** 3 đợt vẫn chết nghẻo mà chẳng hồi âm, bạn tính sượng sùng níu áo khăng khăng tới tột cùng? Mắc chi mà khờ thế. Chuẩn bị phóng tay kéo sập cái cầu dao ác liệt để chia cách nhát gươm hỏa thiêu: Giáp lá cà với ngón **Circuit Breaker**.
