SET NAMES utf8mb4;
USE memory_museum;

START TRANSACTION;


-- ==========================================
-- 1960년대 전시품
-- ==========================================

INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1960,'official','추억의 도시락','식생활 문화

알루미늄으로 제작된 도시락통으로, 학교 급식이 보편화되기 이전 학생과 직장인들이 널리 사용했습니다.

밥과 김치, 달걀, 소시지 등의 반찬을 담았으며, 겨울철에는 교실 난로 위에 도시락을 여러 층으로 쌓아 데워 먹기도 했습니다.

가볍고 휴대하기 편리한 양은 도시락은 당시 학생들의 대표적인 생활용품이었습니다.',
'/images/exhibits/1960/basin.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1960/basin.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1960,'official','석유곤로','취사 문화

석유를 연료로 사용하는 취사 도구입니다. 가스레인지가 널리 보급되기 이전 가정에서 밥을 짓거나 국을 끓이는 데 사용했습니다.

심지에 불을 붙이고 불꽃의 크기를 조절하는 방식으로, 연료를 직접 보충하며 사용해야 했습니다.

연탄과 함께 당시 가정의 취사 환경을 대표하는 생활용품입니다.',
'/images/exhibits/1960/stove.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1960/stove.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1960,'official','고무신','의생활

고무를 소재로 제작한 신발로, 가격이 저렴하고 물에 젖어도 관리하기 편리하여 널리 보급되었습니다.

검은색과 흰색 고무신이 대표적이며, 어린아이부터 노인까지 다양한 연령층이 착용했습니다.

운동화와 가죽 신발이 대중화되기 이전 학교와 시장, 농촌 등에서 흔히 볼 수 있었던 신발입니다.',
'/images/exhibits/1960/shoes.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1960/shoes.jpg'
);


-- ==========================================
-- 1970년대 전시품
-- ==========================================

INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1970,'official','재봉틀','의생활

천을 이어 붙이거나 옷을 제작하고 수선하는 데 사용한 기계입니다.

발판을 밟아 작동시키는 재봉틀은 가정에서 교복과 작업복을 수선하거나 커튼, 이불 등을 만드는 데 활용되었습니다.

기성복이 지금처럼 다양하지 않았던 시절, 재봉틀은 가정의 의생활을 책임지는 중요한 살림 도구였습니다.',
'/images/exhibits/1970/sewing.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1970/sewing.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1970,'official','흑백 텔레비전','대중문화

영상과 음성을 수신하여 흑백 화면으로 방송을 시청할 수 있는 가전제품입니다.

텔레비전이 귀하던 시절에는 텔레비전이 있는 집에 이웃들이 모여 뉴스와 드라마, 스포츠 중계를 함께 시청하기도 했습니다.

1980년 국내 컬러 방송이 시작되기 이전까지 흑백 텔레비전은 대표적인 대중매체였습니다.',
'/images/exhibits/1970/tv.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1970/tv.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1970,'official','다이얼 전화기','통신 문화

원형 다이얼을 돌려 상대방의 전화번호를 입력하는 유선 전화기입니다.

번호에 해당하는 구멍에 손가락을 넣고 다이얼을 돌린 뒤, 원래 위치로 돌아올 때까지 기다리는 방식으로 전화를 걸었습니다.

버튼식 전화기와 휴대전화가 보급되기 이전 가정과 사무실에서 사용했던 대표적인 통신기기입니다.',
'/images/exhibits/1970/phone.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1970/phone.jpg'
);


-- ==========================================
-- 1980년대 전시품
-- ==========================================

INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1980,'official','비디오 플레이어','영상 문화

비디오테이프에 기록된 영상과 음성을 텔레비전을 통해 재생하는 기기입니다.

가정에서 영화를 감상하거나 방송을 녹화하는 데 활용되었으며, 비디오 대여점에서 원하는 영화를 빌려 보는 문화도 형성되었습니다.

DVD와 인터넷 영상 서비스가 등장하기 이전 가정의 대표적인 영상 감상 수단이었습니다.',
'/images/exhibits/1980/video.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1980/video.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1980,'official','롤러장','청소년 문화

롤러스케이트를 타며 음악과 여가를 즐길 수 있었던 실내 놀이 공간입니다.

신나는 음악과 화려한 조명 아래에서 친구들과 스케이트를 타는 활동은 당시 청소년들에게 인기를 끌었습니다.

롤러장은 운동을 즐기는 장소인 동시에 친구를 만나고 교류하는 사교 공간이기도 했습니다.',
'/images/exhibits/1980/roller.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1980/roller.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1980,'official','필름카메라','사진 문화

렌즈를 통해 들어온 빛을 필름에 기록하여 사진을 촬영하는 카메라입니다.

필름 한 통으로 촬영할 수 있는 사진의 수가 제한되어 있었으며, 촬영한 사진은 현상과 인화 과정을 거쳐야 확인할 수 있었습니다.

가족사진과 졸업식, 여행 등 일상의 중요한 순간을 기록하는 데 사용되었습니다.',
'/images/exhibits/1980/camera.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1980/camera.jpg'
);


-- ==========================================
-- 1990년대 전시품
-- ==========================================

INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1990,'official','PC통신','온라인 문화

컴퓨터와 모뎀을 전화선에 연결하여 다른 사용자와 정보를 주고받던 온라인 서비스입니다.

하이텔, 천리안, 나우누리 등의 서비스를 통해 채팅과 동호회 활동, 자료 검색 및 파일 전송을 이용할 수 있었습니다.

접속할 때 발생하는 모뎀 소리와 문자 중심의 화면은 인터넷 대중화 이전 PC통신의 대표적인 특징이었습니다.',
'/images/exhibits/1990/pc.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1990/pc.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1990,'official','브라운관 모니터','정보화 문화

브라운관(CRT)을 이용하여 컴퓨터의 문자와 영상을 표시하는 출력 장치입니다.

화면 뒤쪽의 두꺼운 몸체와 무거운 무게가 특징이며, 가정과 학교, 사무실에서 문서 작성과 게임, PC통신 등에 사용되었습니다.

얇고 가벼운 LCD 모니터가 보급되기 이전 개인용 컴퓨터의 대표적인 구성품이었습니다.',
'/images/exhibits/1990/monitor.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1990/monitor.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 1990,'official','삐삐','이동통신 문화

무선호출기라고도 불리는 휴대용 통신기기로, 상대방이 남긴 전화번호나 숫자 메시지를 수신할 수 있었습니다.

호출을 받은 사람은 주변의 공중전화나 유선 전화기를 이용하여 상대방에게 연락했습니다.

숫자의 발음과 의미를 활용해 마음을 전달하는 독특한 메시지 문화도 형성되었으며, 휴대전화가 대중화되기 이전 널리 사용되었습니다.',
'/images/exhibits/1990/pager.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/1990/pager.jpg'
);


-- ==========================================
-- 2000년대 전시품
-- ==========================================

INSERT INTO items (era_id,type,title,description,image_path)
SELECT 2000,'official','아이스크림2','모바일 문화

LG전자에서 출시한 폴더형 휴대전화로, 부드러운 색상과 외부 화면의 디자인이 특징입니다.

통화와 문자메시지뿐만 아니라 사진 촬영, 벨소리 설정, 배경화면 변경 등 다양한 기능을 제공했습니다.

스마트폰이 대중화되기 이전 휴대전화의 디자인과 개성을 중시하던 소비문화를 대표하는 제품입니다.',
'/images/exhibits/2000/icecream.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/2000/icecream.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 2000,'official','전자사전','학습 문화

단어의 뜻과 발음, 예문 등을 전자적으로 검색할 수 있는 휴대용 학습기기입니다.

영어와 일본어, 중국어 등 여러 언어의 사전을 한 기기에 담을 수 있어 무거운 종이사전을 대신했습니다.

스마트폰의 사전 및 번역 애플리케이션이 보급되기 이전 학생과 외국어 학습자들이 자주 사용했던 기기입니다.',
'/images/exhibits/2000/dictionary.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/2000/dictionary.jpg'
);


INSERT INTO items (era_id,type,title,description,image_path)
SELECT 2000,'official','MP3 플레이어','음악 문화

MP3 등의 디지털 음악 파일을 저장하고 재생할 수 있는 휴대용 음악 감상 기기입니다.

컴퓨터에 저장된 음악 파일을 기기로 옮겨 담아 사용했으며, 카세트테이프나 CD 없이도 여러 곡을 휴대할 수 있었습니다.

음악 스트리밍 서비스와 스마트폰이 대중화되기 이전 등굣길과 출퇴근길에서 널리 사용되었습니다.',
'/images/exhibits/2000/mp3.jpg'
WHERE NOT EXISTS (
    SELECT 1 FROM items
    WHERE type='official'
    AND image_path='/images/exhibits/2000/mp3.jpg'
);


-- ==========================================
-- 전시품 등록 완료
-- ==========================================

COMMIT;

SELECT
    era_id,
    COUNT(*) AS exhibit_count
FROM items
WHERE type='official'
AND status='active'
GROUP BY era_id
ORDER BY era_id;