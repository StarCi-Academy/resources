# title: Gắn chíp theo dõi: Distributed Tracing
# description: Khắc tinh của các kiến trúc vỡ vụn. Tìm hiểu cách cấy chung một tấm thẻ TraceID xuyên suốt nhiều service để chụp được bức ảnh X-Quang lộ trình của bất kì luồng request nào.
# body:

## I. Lời mở đầu (The Hook)

Bạn đã gom rác thành công bằng Centralized Logging. Nhưng một vấn đề ghê rợn khác nảy sinh.
Khách hàng bấm "Checkout". Request bay từ `API Gateway` -> rẽ xuống `Order Service` -> gọi tạt qua `Inventory Service` -> đụng `Payment Service` -> rồi sập hộc máu quăng lỗi.
Mỗi cái Service vỡ vụn đó đều ói ra vài cái Log vứt chung vô kho. Bạn tìm chằng chịt trong Elasticsearch bằng chữ `error` rành rành. Nó lòi ra bãi chữ bơ vơ: `[Payment Service] Lỗi trừ thẻ bị nghẽn`. Nhưng kì lạ thay, cái đoạn luồng này là bị gọi từ ông Khách nào? Giỏ hàng nào trỏ tới? Đang có hàng ngàn request cùng lúc xối xả đập vào `Payment Service`, làm sao bạn biết dòng log lỗi bơ vơ lạc loài này là của đích danh ông khách đang gào thét phẫn nộ ngoài kia chứ ko phải mảnh rác của một ca khác?

Nếu không có sợi dây lụa xuyên tâm buộc chặt mảnh ghép của từng cái log rải rác lại với nhau, bạn đang khóc ròng mò mẫm kim trong đại dương. Phép thuật chọc lỗ xâu kim tóm thóp chụp x-quang lộ trình toàn vành đai mảng gọi là bóng ma **Distributed Tracing**.

## II. Demo tư duy: Gắn mác con chíp định vị (Trace ID)

Cách giải quyết thực ra cực kì bỉ ổi nhưng thông minh tuyệt đỉnh: Ta đè đầu bắt ép thằng `API Gateway` phải dán một con tem mác định vị vĩnh viễn dính chặt vào nắp trán cái request đó ngay từ khoảnh khắc chạm mũi gõ cổng.

### 1. Cuộc phiêu lưu của Trace ID chìm nổi
- Khách vạch tay bấm Checkout. Chạm ngõ nhịp cửa `API Gateway`.
- Gateway sinh hạ đẻ ra một cái chuỗi ngẫu nhiên không đụng hàng mã gen: `TraceID = abc-123`.
- Bất cứ khi nào thằng Gateway há miệng rẽ hướng trỏ nhịp gọi thọc xuống `Order Service`, nó phải túm chặt dúi nhét cái mác `TraceID = abc-123` vào sâu xâu lõi trong HTTP Headers (`x-trace-id: abc-123`).
- Thằng Order xả dòng Log? Nó bị cưỡng ép đóng dấu dòng code kéo đính thêm cụm `[abc-123]` vô rành rọt đầu dòng Log text. Order lôi rướn thân mình móc chọc sang `Inventory` hay `Payment`? Lại bấu móng cầm thọc cái tem `abc-123` đấy nhét vô trồi Header nhồi đi nẩy lướt tiếp dặm chặng.

### 2. Sự hiển linh của Biểu đồ Thác Nước (Flame Graph)
Nhờ có cái mác `TraceID` xuyên lục địa bám đuôi lặp đi lặp lại. Giờ đây, khi thằng mỏ `Payment` văng oạch dòng log lỗi chửi thề. Bạn chộp rút lấy cái mác lơ lửng `abc-123`.
Ném tọt múc lên họng kho khui tìm kiếm (vốn dĩ xài món xịn cộp mác Jaeger hoặc Zipkin). Đỉnh cao lộng lẫy thay, phần mềm đồ họa liền gỡ vạch nhả giăng ra một cái Biểu đồ Thác nước ngập lụt màu sắc (Gantt Chart / Flame Graph) rõ mồn một các đốt vạch dải băng nằm ngang:
- Nhịp đoạn `Order` nướng rụi mất 20ms
- Dòng thời gian trôi tạt tới `Inventory` cắn nhằn nhây mất bạo cúp 500ms
- Văng sập gãy cái thanh lỗi chóp `Payment` cụp tạch ở mốc giây thứ 3 rớt đỏ lườm.
Kết quả mong đợi: Bạn chẳng thèm cào moi móc nặn óc lật text chán nản mà vẫn dán mắt trố nhìn tọt được "con rạch lộ trình máu chạy" từ nhát chém lọt cửa biên giới tới cái vực móp rớt hố sập gầm. Lôi phăng chọc đúng phọt cái service rùa bò thủ phạm cắn nghẽn (latency bottlenecks) lòi tòi tọt tróc nã ra mà chối cãi đằng trời bóng đêm.

## III. Giải thích nâng cao & Kết luận

### 1. Phân khúc rạch sọc Trace và Span
Trong mặt ngôn ngữ vạch án của thế giới Tracing cộm mác giới SRE, người ta lôi ráp mảnh mảng bằng 2 khái niệm ngắm móc lõi cực thấm:
- **Trace:** Đại diện mỏ tóm tắt cho nguyên bộ sậu cuộn chặng đường hành hương trọn vẹn tột cùng của 1 cái Request bành xé (chính quy nốt bám dọng cái cuộn cọc `TraceID` to tướng xuyên vỏ).
- **Span:** Mỗi một nhịp trạm nghỉ mốc ghé bám lót thăm dính vô cái Service nhỏ vụn mọc lởm chởm lẻ tẻ trong cả dải ngậm chặng xé đó gọi mộc mạc là 1 bệ cái Span (nó được gắn kèm tên gọi khai sinh chèn riêng, có ghim cọc thời lượng Start Time chọc móc End Time). Ví chọc dụ nhổ rễ rẽ chọc vô Inventory luồn quét sâu luồng DB ngầm cũng tính là phòi đẻ ra 1 bệ nốt Span nhú mới. Cục mảng Trace xâu khổng lồ ghim buộc bó toàn cục bức tranh chính là một đọ cây chùm rễm nùi lúp lúp lụm nhét dồn hàng tỷ hàng chục cục Spam râu con lại quặp xéo. Tóm gọn mạch máu sạch tinh tươm.

### 2. Tiêm máu móc xích truyền dẫn rạch ngầm (Context Propagation)
Để nhồi để nhét cho gã chóp đài nhọt Gateway thọc luồn tống mỏ truyền được cái dải thẻ bài Trace ID đâm xuyên xâu tận đục ruột thằng nanh sỏ Payment đít cụt, mọi mớ code lều bạt vọc trần của bần nông coder lười biếng đều phải gặm ngậm chọc sẵn cái kĩ năng trò tiêm nhồi móc thuốc truyền di động ngầm mác nhọn (Context Propagation). 
Hên may cứu mạng thay, kỷ nguyên này bạn chả màng phải tự nhồi mổ bụng móc rạch code luồn vá chắp nhặt vọc nhồi tay vã bọt mép cực khô cằn. Trỗi các đế vương nền tảng trùm công nghệ đẻ vọt xéo ra cộm vương **OpenTelemetry** (Otel) vốc cung phụng cả rổ bộ thư viện xẻ xỏ lót tiêm mũi chọc thuốc auto hất truyền có sẵn. Chỉ cần kéo import đấm cái cục thư viện lót thảm ghim dưới đáy ngầm chóp biên mút, con mắt Otel ngầm nấp thọc ngoe vòi khóa bấu vặn đinh bẻ ngoéo mọi cuộn thư viện mác chuyên gọi lôi bắn mồi HTTP (nhờ cắm nêm xóp lách chặn ngàm gãy tự rọt hàm fetch/axios), cắn mọi luồng mẻ rễ đâm cào DB, rồi nhe nanh tự thân nhét lật đúc dúi thọt tọng đẩy vọc văng ném cái cuộn tem Trace ID vô rỗng hốc lọt vỏ Header ném vọt lướt chui ruồi mướt vách đi thẳng đâm lủng bọng xuyên ngộp mọi màn sương rảo tường. 

Toàn tuyến hệ mảng xương xọ mốc ruột kẽm đã bị gỡ moi móc phơi xác bung lột bóc lớp áo phủ sương xám rát lởm rã bụi mù mịt. Vạch kẽ đo xăm rạch miết săm soi rọc lột phơi xác hiện hồn chéo cánh soi ngang dọc từng mili-mét sẹo xé bóng nham nhở. Đỉnh kĩ nghệ. Thế nhưng ngặt một vố quất, tại vấy làm sao nhúm sẹo lại trần nhai thả mặc để ngay thằng tay khách hàng ỏm tỏi là kẻ ngứa kêu vội đập mỏ vạch đái báo xộc mùi lỗi lòi hố toang toác cho ngửi lụn bại vầy hở? Lốc cộc quần đùi gặm bánh áo lót vã mồ hôi cộc lốnh chống nện gậy đứng vội bật dậy xây rào sâm lốc giăng bẫy múa chuông nảy chíp báo hót báo gãy sớm tinh tươm khẩn trương báo cháy nhà cấp tốc trước cả nốt khi kẻ khách lồi trần mạc đụng móp nhăn ngó mỏ la than than lóc khóc điếc mạt phàm: Trạm gác báo hiệu đổ giọt sinh tử vây màn **Alerting & Incident Response**.
