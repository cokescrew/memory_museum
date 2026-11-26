SET NAMES utf8mb4;
USE memory_museum;
START TRANSACTION;
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1960,'official','양푼','주방 문화

가볍고 다루기 편한 양푼은 채소를 씻고 김치를 버무리는 등 부엌의 여러 일을 함께한 생활용품입니다.

오래 사용한 그릇의 흠집과 찌그러진 자국은 가족의 식사를 준비하던 일상의 흔적을 떠올리게 합니다.','/images/exhibits/1960/basin.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1960/basin.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1960,'official','석유곤로','취사 문화

석유를 연료로 사용하는 곤로는 가스레인지가 널리 보급되기 전 밥을 짓고 국을 끓이는 데 쓰였습니다.

작은 불꽃을 조절하며 식사를 준비하던 부엌의 풍경을 보여줍니다.','/images/exhibits/1960/stove.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1960/stove.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1960,'official','고무신','의생활

고무신은 저렴하고 관리하기 쉬워 남녀노소 즐겨 신었던 신발입니다.

학교와 시장, 마을 골목에서 흔히 볼 수 있었던 고무신은 당시의 소박한 일상을 전합니다.','/images/exhibits/1960/shoes.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1960/shoes.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1970,'official','재봉틀','의생활

재봉틀은 옷을 만들거나 낡은 옷을 수선하는 데 쓰인 살림 도구입니다.

옷을 고쳐 입던 생활 습관과 가족을 위해 움직이던 손길을 기억하게 합니다.','/images/exhibits/1970/sewing.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1970/sewing.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1970,'official','흑백 텔레비전','대중문화

흑백 화면으로 뉴스와 드라마, 스포츠를 전하던 가전제품입니다.

텔레비전이 귀하던 시절에는 이웃들이 한집에 모여 방송을 함께 보기도 했습니다.','/images/exhibits/1970/tv.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1970/tv.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1970,'official','다이얼 전화기','통신 문화

원형 다이얼을 돌려 번호를 입력하는 전화기입니다.

번호를 하나씩 돌리며 기다리던 시간과 멀리 있는 사람의 목소리를 듣던 경험을 전합니다.','/images/exhibits/1970/phone.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1970/phone.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1980,'official','비디오 플레이어','영상 문화

비디오테이프에 담긴 영화와 방송을 재생하는 영상기기입니다.

대여점에서 영화를 고르고 테이프를 되감던 풍경은 당시 가정의 여가문화를 보여줍니다.','/images/exhibits/1980/video.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1980/video.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1980,'official','롤러장','청소년 문화

음악을 들으며 롤러스케이트를 즐기던 여가 공간입니다.

친구들과 함께 달리고 스케이트를 배우던 경험은 당시 청소년 문화의 활기를 전합니다.','/images/exhibits/1980/roller.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1980/roller.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1980,'official','필름카메라','사진 문화

필름에 빛을 기록해 사진을 남기는 카메라입니다.

한정된 필름으로 신중하게 셔터를 누르고 사진관에서 인화를 기다리던 설렘을 떠올리게 합니다.','/images/exhibits/1980/camera.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1980/camera.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1990,'official','PC통신','온라인 문화

전화선과 모뎀을 이용해 채팅과 동호회, 자료 교환을 즐기던 온라인 서비스입니다.

하이텔과 천리안, 나우누리 등은 인터넷 대중화 이전의 한국 온라인 문화를 보여줍니다.','/images/exhibits/1990/pc.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1990/pc.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1990,'official','브라운관 모니터','정보화 문화

두꺼운 몸체가 특징인 브라운관 모니터는 당시 개인용 컴퓨터 환경을 대표합니다.

문서 작성과 게임, PC통신을 즐기던 화면은 가정과 학교의 정보화 과정을 떠올리게 합니다.','/images/exhibits/1990/monitor.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1990/monitor.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 1990,'official','삐삐','이동통신 문화

무선호출기는 상대방이 남긴 번호나 숫자 메시지를 확인하는 통신기기입니다.

호출을 받고 공중전화를 찾아 연락하던 풍경과 숫자로 마음을 전하던 문화를 기억하게 합니다.','/images/exhibits/1990/pager.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/1990/pager.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 2000,'official','아이스크림2','모바일 문화

LG전자의 폴더형 휴대전화 아이스크림2는 색상과 디자인을 중시한 제품입니다.

스마트폰 이전 문자메시지와 벨소리, 휴대전화 꾸미기를 즐기던 모바일 문화를 보여줍니다.','/images/exhibits/2000/icecream.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/2000/icecream.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 2000,'official','전자사전','학습 문화

작은 기기에서 단어의 뜻을 검색할 수 있게 만든 학습기기입니다.

외국어를 공부하는 학생들의 책가방 속에서 종이사전을 대신하던 물건입니다.','/images/exhibits/2000/dictionary.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/2000/dictionary.jpg');
INSERT INTO items (era_id,type,title,description,image_path) SELECT 2000,'official','MP3 플레이어','음악 문화

디지털 음악 파일을 저장하고 휴대하며 감상할 수 있는 기기입니다.

좋아하는 노래를 직접 골라 담고 이어폰으로 듣던 등굣길의 기억을 전합니다.','/images/exhibits/2000/mp3.jpg' WHERE NOT EXISTS (SELECT 1 FROM items WHERE type='official' AND image_path='/images/exhibits/2000/mp3.jpg');
COMMIT;
SELECT era_id, COUNT(*) AS exhibit_count FROM items WHERE type='official' AND status='active' GROUP BY era_id;