# title: Bulkhead: Xây khoang chống chìm
# description: Ngăn chặn một lỗi cục bộ làm tràn bộ nhớ và lan rộng đánh sập toàn hệ thống. Học ý tưởng từ ngành đóng tàu viễn dương để bảo vệ các chức năng quan trọng.
# body:

## I. Lời mở đầu (The Hook)

Service của bạn có hai chức năng chính: Xử lý giỏ hàng (chốt đơn ra tiền) và Hiển thị lịch sử (để khách xem chơi). Tự nhiên hôm nay cái API Lịch sử dở chứng vì DB phía sau bị chậm tịt lại. Thế là khách bấm vô báo cáo, request bị kẹt cứng ngậm một lố Thread đợi. Rồi cả trăm ngàn khách gọi Lịch sử, ứng dụng chết ngạt vì bị ngốn sập 100% tài nguyên CPU & RAM cho mỗi cái API vớ vẩn đó. 
Và bi kịch đến: Khi khách bấm Thanh toán nạp tiền, server chối móc báo "Tao kẹt xả cạn luồng Thread rồi, nghỉ chơi tao đi ngủ". Một chức năng báo cáo chắp vá bị hỏng, và nó vác nguyên cái quy trình cày tiền lõi rớt theo lãng nhách vào sình bùn sập server. Thật nực cười!

Muốn cái vớ vẩn không nhận chìm cái cốt lõi, phần mềm phải cắt nhỏ chia ô y hệt như buồng ruột con tàu viễn dương. Ta chào sân thiết kế **Bulkhead Pattern**.

## II. Demo tư duy: Đục vách khoang chống đắm tàu

### 1. Tại vì sao hệ thống lại chết chìm diện rộng?
Mới sinh ra, app của bạn có đúng 1 cụm bể chứa (Thread Pool) bự chảng chung đụng (vd: 500 nấc xả luồng tối đa). 
Nếu cái chức năng Cấu hình tài khoản (rất ì ạch) hỏng, nó cướp trúng phốc 500 cái thread đó để đứng trân trối chờ mạng. Mấy request Giỏ Hàng (Cart) quí giá chui tọt vô sau thì chới với méo miệng kêu: "Hết chỗ xử lý rồi anh ơi!" - Boom, ứng dụng tắc tịt dẫu 2 tính năng chả chung chạ một mã API nào.

### 2. Thiết kế khóa vách (Bulkhead) phân rã tài nguyên
Từ khái niệm vách ngăn hầm tàu thủy (một khoang ngập nước, bít vách lại thì các khoang khác vẫn bơm hơi xuội nổi): 
Bạn không để 1 bể hỗn tạp Thread Pool xô bồ nữa. Bạn đập cái nhà 500 Thread đó chia ô:
- **Pool 1 (300 Threads):** Đành rạch ròi dâng cho nhóm luồng ưu tiên số chóp **Checkout** & **Payment** (ra tiền).
- **Pool 2 (100 Threads):** Đẩy qua xẻ thịt ngắt dòng cho **Profile** / **History** (phụ họa).
- **Pool 3 (100 Threads):** Dự trù Background Jobs bùng cháy rác rưởi.

Kết quả mong đợi: Lỡ API Profile có cà giật chậm rì rí, nó làm banh xác móp đúng cái khoang Pool 2 của nó văng trả 500 Error. Nhưng lúc đi Checkout móc ví, tẹt ga trượt mát rượi qua khoang Pool 1 bao thoáng không vướng lấy một khói bẩn. Nguồn thu của công ty được bảo kê vĩnh viễn sống nhăn răng.

## III. Giải thích nâng cao & Kết luận

### 1. Phân mảnh 2 cấp độ: Từ App tới Hạ tầng
Việc lắp Bulkhead không chỉ bo hẹp lủi lổn cắm code trong App:
- **Mức Component (Code):** Như ví dụ trên, dùng Semaphores khóa van hoặc chẻ Thread Pool riêng rẽ theo từng cụm API.
- **Mức Infrastructure (Triển khai):** Máy ảo gánh tạ chung ư? Dẹp! Ta rải Pod ra. Tính năng Login cắm trên lốc máy ảo 5 con. Đụng tải nhảm báo cáo thì ném dàn Node máy khác phục vụ. Hệ thống sập thì sập giới hạn ở lớp cơ sở hạ tầng đã bít vách ngắt cụm. Đây là hình mẫu lý tưởng ngạo nghễ của **Microservices** đích thực vung gươm.

### 2. Lắp ráp mưu kế: Bulkhead x Circuit Breaker
Trong thực tế production gươm đao, Bulkhead luôn âu yếm cặp kè ôm chặt lấy kĩ năng **Circuit Breaker**.
Khi khoang tàu Pool 2 của API Profile bị nghẽn nước (Bulkhead ngập lụt 100 threads kia), thay vì đứng tốn điện giãy giụa mút cạn cạn số thread, cỗ máy ném luôn lệnh gạt Circuit Breaker cúp ngang cổ điện. Một tảng vách kết hợp cầu dao cúp rụp đá lọt yêu cầu lỗi ra đường, mượt mà bọc gối bảo vệ cái App trụ vững không gợn nhịp sương sương nào.

Ngần này đòn gồng chắn thôi đã biến hệ thống của bạn thành trùm lì lợm. Nhưng rốt cuộc, hệ thống có biết nó tự đau hay nghẹn họng thở ở đâu để mà khóc gọi bạn không? Tiến vào cửa ải chốt chặn tự soi mình sửa mình: **Health Checks & Graceful Degradation**.
