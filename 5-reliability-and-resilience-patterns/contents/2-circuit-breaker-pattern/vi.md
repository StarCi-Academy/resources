# title: Đuổi cùng sát tận hay rút lui lẹ: Circuit Breaker
# description: Ngăn chặn một mảnh ghép hỏng nát nhừ làm sụp đổ cháy chùm toàn bộ hệ thống nhờ cơ chế văng vỡ cầu dao lưới điện. Cắt đứt kết nối lỗi tàn bạo, không gồng máu chờ đợi vô ích!
# body:

## I. Lời mở đầu (The Hook)

Ở bài trước, bạn đã vác siêu kĩ năng Retry ngắt nhịp tung hoành. Nhưng điều gì xảy ra nếu cái thằng Payment Service đối tác... sập mất tiêu thành đống tro tàn thật sự rồi? Tụi nó vừa chập máy nổ tung đứt mạng, ổ cứng cháy nghẹt. Giờ code của bạn mù quáng đúp số vòng Retry 3 nháy x 10,000 request ủn dội dồn dập vào thân xác nó?
Thứ nhất, cái thằng Payment kia vừa mới hé lóp ngóp bật dỡ máy chủ, ăn nguyên rổ Retry khổng lồ tát ngược bồi vào tạt sấm sét nó sập lại chìm xuống vực thẳm. Thứ hai, chính bộ não cái Service ruột của bạn cũng phải giam lỏng cả vạn cục Threads uổng phí quằn quại đợi cái mốc chờ Retry ngớ ngẩn rồi tắc nghẽn chết ngộp theo. Cái chết chùm lây lan ("Cascading Failures") gớm ghiếc ấy là cái kết cay chát cho kẻ bướng bỉnh hèn nhát cố đúc thêm đòn.

Thế nên, thợ điện vẽ ra cái cục Cầu dao điện nhạy văng cụp điện rụp một tiếng khô khốc để ko cháy ra tro trọn căn nhà. Kéo rạch võ công đó ném vào code kiến trúc, nó chính là vách ngăn sống còn: **Circuit Breaker**.

## II. Demo tư duy: Sập gầm cầu dao chặn họng lan truyền

### 1. Ba trạng thái sinh tử của Cầu dao (Circuit Breaker)
Cái chốt Cầu dao ảo (Circuit Breaker kẹp cổ đường xả xúm từ Service A ngoạm sang B) giật nhảy qua 3 khớp:
1. **Đóng êm (Closed):** Nguồn điện mở thông suốt mát mẻ. A gọi B vèo vèo qua lại. Lỡ bám vài phốt lỗi thì ngó sổ ghi chú rồi cũng bỏ qua thản nhiên gồng.
2. **Bật ngửa gãy ngang (Open):** Á chà mệt rồi, trong vòng 1 phút qua thằng B lặn sấp mặt tạch bết nhè lên mốc tạ 20 lần! Cục cầu dao ré lên RỤP một cú ngắt điện tàn nhẫn. Từ cái tích tắc ngạt này, A lỡ nhả chọc gọi sang B sẽ bị cái cầu dao chặn cổ bẻ lái ném phát lỗi: "Tao cắt đứt đường rồi, cạch mặt bớt ngoan cố vứt máu mỡ đợi chờ nha" (Fast-Fail). Bỏ qua chả cần chạm đến mốc Timeout trễ nải. A thảnh thơi vớt RAM để rủ khách chạy việc khác.
3. **Mở mồi lửng lơ (Half-Open):** Cái họng dao ngửa cúp nãy chừ, chắc cũng 30 giây ráo riết rồi. Cầu dao tự hé ngóc một kẽ ánh sáng le lói, tuồn đại 1-2 vệt request lẻ loi dò dẫm đạp xe sang đất nhà B thăm thính. Thằng B tỉnh men ngóp hồi phục báo "tao sống nổ ping" thành công? Cầu dao gập mạnh cái rụp hạ chốt xuống mốc **Đóng êm (Closed)**, xe tải dữ liệu tuôn lại phành phạch. Nhỡ B mà ho ra đờm sặc lòi cục gạch báo liệt lần nữa? Bật ngửa lại rốc tung **Open** dập liên hồi lập tức!

Kết quả mong đợi: Service B ngắc ngoải chết, đám đông mỏ Service A gạt phăng bóng ma tự phản xạ từ chối không rờ tới B nữa. Không kết nối ứ đọng vũng, không tắc họng Thread CPU gồng tải rỗng mỡ, khóa trọn vẹn điểm nghẽn rác rưởi đừng lấn rỉa qua hệ sinh thái liền kề lây nhây.

## III. Giải thích nâng cao & Kết luận

### 1. Thông số cắm mốc ngắt điện
Bạn thả xích nhúng thẳng bộ khuôn ngắt dao **Circuit Breaker** vô code nức nở tiện tay (ví dụ rinh lib `resilience4j`) qua 2 cần gạt đo đạc mài rũa tàn lụi:
- **Failure Rate Threshold:** Ngưỡng % ném rác bấy nhiêu tao vung dao gạt? (Thường set mốc quanh độ `50%` của xâu xé 100 hits là đẹp điệu vung roi).
- **Wait Duration in Open State:** Hé mồi dây điện sau bao cái phút lửng lơ bật ngửa? Bình tâm xả bóng tầm dốc 5 giây, 10 giây nán coi nó giãy chết phục hưng lại nổi hông trần máu.
- Mà nhớ giùm: đếm lỗi cớ chi mới vung dao chém? Nó ói ngáp hỏng lỗi `500 Server Error` do quá sức đứt đài hẵn đếm, đừng vì một thằng ngố bấm nhập bậy mật khẩu đập lỗi ngu `400 Bad Request` mà táng vô bật lút cầu dao block sập cụm đường truyền của cả đại đội khách hàng là bạn rớt luôn ghế nhắm mắt mà đi lãnh chửi thay nhục.

### 2. Sự ngạo mạn giảo hoạt của "Fast-Fail" và Fallback
Đỉnh cao của ngón đòn Cầu dao nhảy vỡ gân chính là trảm **Fast-Fail** (Sớm sập luôn cho nhanh lấn át). Nguồn máu RAM CPU của hệ thống bốc vắt ra mỡ hao sạch tươm cục kì nhanh khi bắt lũ luồng lủng mỏng manh bám víu ngoan cường chầu chực xin lộc một đứa ko còn rắm thối. Trả chát cái xẻng văng mẹ mặt sớm chừng nào tốt ngần đó, để rướn chân nhảy vọt qua rọ đệm **Fallback** lửng lơ. 
Cổng trừ thẻ chập mạch văng mẹ ngửa đứt Open? Okay chẻ nhánh rẽ đi em, bẻ gắt luồng Fallback chải mượt tống khư khư ném cái giao dịch đơn Order đút nhét trong khe hẻm kho Queue ngầm, trên ném quả chữ xanh gởi khách "Trạng thái thanh toán nằm chờ kiểm kê nha chế, coi tiktok nằm vểnh chờ nha", che mạc lụa chả thèm để khách ngửi thấy mùi khét thiêu ngoài kia sập cmn server chửi um khua bến sập chảo sau đít.

Code giáp vững chãi. Nghe tút, nhưng rào chắn nào chống bão bão giật lốc quỷ cuốn xoáy bẹp cả mảng chằng rễ chọc vào tim khi sạp luồng dăm ba khơi? Rã đập tàu viễn thủy với mớ vách thép xâu mũi lấp chỗ **Bulkhead Pattern**.
