# title: Báo động và cứu hỏa: Alerting & Incident Response
# description: Chuyển từ việc ngây ngô dán mắt vào bảng điều khiển 24/7 sang nghệ thuật thiết lập các luật lệ báo động tự động. Chỉ bị đánh thức khi hệ thống thực sự lâm nguy!
# body:

## I. Lời mở đầu (The Hook)

Công ty bạn vừa thiết lập xong tấm bảng Dashboard grafana tuyệt đẹp với 4 Golden Signals cực chất. Thế nhưng, bạn không thể ép 1 kĩ sư ngồi trợn trừng mắt nhìn chằm chằm vô cái màn hình đó suốt 24 tiếng mỗi ngày, 7 ngày một tuần. 
Nếu hệ thống đột quỵ vào lúc 3 giờ sáng và bạn đang ngủ say, tấm Dashboard hiển thị một dải đỏ lòm cũng trở thành phế thải. Khách hàng vẫn chửi, sếp vẫn nổi trận lôi đình. Bạn chẳng giải quyết được gì nếu bạn không được gọi dậy kịp thời.

Giám sát (Monitoring) giỏi tới đâu mà thiếu **Cảnh báo (Alerting)** thì vẫn chỉ là gã bù nhìn rơm. Bạn phải thiết kế một cỗ máy biết tự rống lên, giật chuông và gọi tự động vào điện thoại của kĩ sư trực (On-call) ngay khi có mồi lửa đầu tiên.

## II. Demo tư duy: Ngủ ngon cùng chuông báo cháy

### 1. Cạm bẫy của việc "Báo động rác" (Alert Fatigue)
Hãy tưởng tượng hệ thống cứ lâu lâu rớt mạng cỡ 1 giây. Bạn setup chuông báo: "Bất cứ lúc nào rớt 1 cái lỗi, nhá chuông!". 
Hậu quả: Điện thoại bạn kêu tít tít 500 lần trong chuỗi 8 tiếng. Lần 1 bạn giật mình mở máy xem. Lần 2 bạn rên rỉ kiểm tra sơ sịa. Qua lần thứ 20, não bạn tự động xem âm báo đó là tiếng dế kêu, bạn bấm Im Lặng và đi ngủ tiếp. 
Khi một bão lỗi thật sự quét tới cướp trắng tỷ đồng, bạn vẫn ngủ say. Hiện tượng tê liệt vì báo động dỏm gọi là **Alert Fatigue**.

### 2. Thiết lập quy tắc báo động đáng tiền (Actionable Alerts)
Luật bất thành văn: Còi chỉ được réo nếu và chỉ nếu Lỗi đó đụng vào miếng cơm manh áo của Khách hàng. Đừng báo lỗi nếu bạn không thể làm gì để sửa nó ngay lập tức.
Thay vì báo động: "CPU đột ngột lên 90% nhe". (Có khi nó chỉ đang chạy một cái cron job nén ảnh nhảm nhí nào đó).
Mẫu báo động sắc bén: **"Trong 5 phút gần nhất, tỉ lệ khách thanh toán thẻ thành công (Golden Signal) bị rớt đài tận 5%, vượt ngưỡng an toàn. DẬY ĐI!"**

Cái tin nhắn này lập tức kích hoạt adrenaline, chỉ rõ vùng nào đang rụng máu để bạn nhảy vào chữa cháy (Incident Response).

## III. Giải thích nâng cao & Kết luận

### 1. Phân chia cấp bậc gọi trực (On-call Escalation)
Hệ thống báo qua đâu? PagerDuty, Opsgenie, hoặc bèo nhất cũng là quất bot Telegram. Luật tiếp nhận:
- P1 (Critical): App sập họng, không mua bán được. Bot gọi giật liên hồi thẳng vô số điện thoại gối đầu giường kĩ sư. Nó hú liên tiếp 5 phút, nếu kĩ sư ngủ chết không bấm "Acknowledge", còi tự động nhảy cóc nhá đúp sang gọi đập cửa ông Tech Lead / CTO.
- P2 (Warning): CPU hơi căng, hoặc vài ngàn request chậm do nhà mạng dở chứng. Gửi một cái message Telegram nhẹ nhàng vô Group dev đọc chơi rảnh hẵng vô nghía, khỏi gọi điện phá giấc ngủ.

### 2. Các chốt gác thầm lặng: Liveness và Readiness Check
Đôi lúc bạn không cần thức dậy chữa cháy, hệ thống báo động sẽ kết hợp với **Health Checks** của Kubernetes để tự chữa:
- Health check đập chốt "Readiness" hỏi API. API dở chứng bảo: "Đợi tôi xả rác RAM tí". Load Balancer lập tức rẽ mạch không cho khách vô nữa.
- Health check đập chốt "Liveness" hỏi API không trả lời. K8s chém ngay cổ container đó, 1 phút sau sinh sôi lại cái mới hoàn toàn thay thế. Sự cố được xử lý gọn gàng lấp liếm mà bạn không hề hay biết.

Với tư duy thấu thị hộp đen và vũ khí Alerting dứt điểm ở Module 6 này, bạn thực sự vươn mình ra khỏi vai trò thợ Code đắp lỗi. Bạn leo lên một tầm vóc khác cao hơn: Vận hành cơ số thiết giáp chống đạn, làm một Software Architect với bộ óc nắm bắt uy quyền trên ngai vàng Production!
