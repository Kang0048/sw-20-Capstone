// 비
const rainItems = [
    { ko: "방수자켓", name: "Waterproof jacket" },
    { ko: "방수백팩", name: "Water-resistant backpack" },
    { ko: "판초 우의", name: "Poncho" },
    { ko: "레인코트", name: "Raincoat" },
    { ko: "방수 바지", name: "Waterproof pants" },
    { ko: "아노락", name: "Anorak" },
    { ko: "고어텍스 재킷", name: "Gore-Tex jacket" },
    { ko: "방수 파카", name: "Rainproof parka" },
    { ko: "윈드브레이커", name: "Windbreaker" },
    { ko: "트렌치코트", name: "Trench coat" },
    { ko: "올웨더 코트", name: "All-weather coat" },
    
    // { ko: "고무 클로그", name: "Rubber clogs" },
    // { ko: "레인부츠", name: "Rain boots" },
    // { ko: "고무 신발", name: "Rubber shoes" },
    // { ko: "방수 장갑", name: "Waterproof gloves" },
    // { ko: "버킷햇", name: "Bucket hat" },
    // { ko: "덕 부츠", name: "Duck boots" },
    // { ko: "투명 우산", name: "Clear umbrella" },
    // { ko: "방수 모자", name: "Rain hat" },
    // { ko: "PVC 토트백", name: "PVC tote bag" },
    // { ko: "방수 운동화", name: "Rain-resistant sneakers" },
    // { ko: "레인 판초", name: "Rain poncho" },
    // { ko: "와이드 브림 모자", name: "Wide-brim hat" },
  ];
  
  // 눈
  const snowItems = [
    { ko: "패딩 재킷", name: "Puffer jacket" },
    { ko: "울 코트", name: "Wool coat" },
    { ko: "스노우 팬츠", name: "Snow pants" },
    { ko: "다운 파카", name: "Down parka" },
    { ko: "보온 레깅스", name: "Thermal leggings" },
    { ko: "헤비 재킷", name: "Heavy-duty jacket" },
    { ko: "울 스웨터", name: "Woolen sweater" },
    { ko: "스키 재킷", name: "Ski jacket" },
    { ko: "누빔 조끼", name: "Quilted vest" },
    { ko: "셰르파 후디", name: "Sherpa-lined hoodie" },
    { ko: "플리스 바지", name: "Fleece-lined pants" },
    { ko: "카울넥 스웨터", name: "Cowl neck sweater" },
        
    // { ko: "스노우 부츠", name: "Snow boots" },
    // { ko: "니트 스카프", name: "Knit scarf" },
    // { ko: "플리스 장갑", name: "Fleece gloves" },
    // { ko: "보온 양말", name: "Thermal socks" },
    // { ko: "단열 장갑", name: "Insulated mittens" },
    // { ko: "이어머프", name: "Earmuffs" },
    // { ko: "스키 고글", name: "Ski goggles" },
    // { ko: "비니", name: "Beanie" },
    // { ko: "스노우슈즈", name: "Snowshoes" },
    // { ko: "겨울 모자", name: "Winter hat" },
    // { ko: "보온 부츠", name: "Insulated boots" },
    // { ko: "두꺼운 스카프", name: "Thick scarf" },
    // { ko: "발열 장갑", name: "Heated gloves" },
    // { ko: "발라클라바", name: "Balaclava" },
  ];
  
// 봄
const springItems = [
    { ko: "가벼운 트렌치코트", name: "Light trench coat" },
    { ko: "데님 재킷", name: "Denim jacket" },
    { ko: "플로럴 드레스", name: "Floral dress" },
    { ko: "치노 팬츠", name: "Chinos" },
    { ko: "가디건", name: "Cardigan" },
    { ko: "레이어드 블라우스", name: "Layered blouse" },
    { ko: "펜슬 스커트", name: "Pencil skirt" },
    { ko: "윈드브레이커", name: "Windbreaker" },
    { ko: "밝은색 스웨터", name: "Bright-colored sweater" },
    { ko: "경량 블레이저", name: "Lightweight blazer" },
    { ko: "미디 스커트", name: "Midi skirt" },
    { ko: "카프리 팬츠", name: "Capri pants" },
    { ko: "경량 스웻셔츠", name: "Light sweatshirt" },
    { ko: "스카프 프린트 블라우스", name: "Scarf-print blouse" },
    { ko: "라이트 후디", name: "Light hoodie" },
    { ko: "맥시 드레스", name: "Maxi dress" },
    { ko: "플리츠 스커트", name: "Pleated skirt" },
    { ko: "린넨 바지", name: "Linen trousers" },
    { ko: "크로셰 스웨터", name: "Crochet sweater" },
    { ko: "파스텔 가디건", name: "Pastel cardigan" },
    { ko: "경량 파카", name: "Light parka" },

//   { ko: "봄 모자", name: "Spring hat" },
  ];
  
  // 여름
  const summerItems = [
    { ko: "탱크탑", name: "Tank top" },
    { ko: "반바지", name: "Shorts" },
    { ko: "맥시 드레스", name: "Maxi dress" },
    { ko: "하와이안 셔츠", name: "Hawaiian shirt" },
    { ko: "보드 반바지", name: "Board shorts" },
    { ko: "린넨 셔츠", name: "Linen shirt" },
    { ko: "숏 슬리브 셔츠", name: "Short-sleeve shirt" },
    { ko: "슬리브리스 드레스", name: "Sleeveless dress" },
    { ko: "반팔 스웨터", name: "Thin sweater" },
    { ko: "오프숄더 블라우스", name: "Off-shoulder blouse" },
    { ko: "경량 점퍼", name: "Light jumper" },
    { ko: "와이드 팬츠", name: "Wide pants" },
    { ko: "민소매 티셔츠", name: "Sleeveless t-shirt" },
    { ko: "반팔 블라우스", name: "Short-sleeve blouse" },
    { ko: "플로럴 셔츠", name: "Floral shirt" },
    { ko: "캉캉 스커트", name: "Tiered skirt" },
    { ko: "린넨 팬츠", name: "Linen pants" },
    { ko: "라운지웨어 셔츠", name: "Loungewear shirt" },
    { ko: "롱 드레스", name: "Long dress" },
    { ko: "라운드넥 티셔츠", name: "Round-neck t-shirt" },
    { ko: "보헤미안 드레스", name: "Bohemian dress" },
    { ko: "숏 점프수트", name: "Short jumpsuit" },

//    { ko: "수영복", name: "Swimsuit" },
  ];
  
  // 가을
  const autumnItems = [
    { ko: "가죽 재킷", name: "Leather jacket" },
    { ko: "체크 셔츠", name: "Checkered shirt" },
    { ko: "코듀로이 팬츠", name: "Corduroy pants" },
    { ko: "터틀넥 스웨터", name: "Turtleneck sweater" },
    { ko: "플란넬 셔츠", name: "Flannel shirt" },
    { ko: "트위드 재킷", name: "Tweed jacket" },
    { ko: "울 코트", name: "Wool coat" },
    { ko: "롱 스커트", name: "Long skirt" },
    { ko: "니트 드레스", name: "Knit dress" },
    { ko: "슬림 팬츠", name: "Slim-fit pants" },
    { ko: "머스타드 컬러 스웨터", name: "Mustard-colored sweater" },
    { ko: "루즈핏 가디건", name: "Oversized cardigan" },
    { ko: "데님 팬츠", name: "Denim pants" },
    { ko: "경량 다운 재킷", name: "Lightweight down jacket" },
    { ko: "플레어 스커트", name: "Flared skirt" },
    { ko: "벨티드 코트", name: "Belted coat" },
    { ko: "버건디 셔츠", name: "Burgundy shirt" },
    { ko: "롱 울 스웨터", name: "Long wool sweater" }
  ];
  
  // 겨울
  const winterItems = [
    { ko: "패딩 재킷", name: "Puffer jacket" },
    { ko: "울 스웨터", name: "Woolen sweater" },
    { ko: "히트텍 셔츠", name: "Heat-tech shirt" },
    { ko: "코듀로이 재킷", name: "Corduroy jacket" },
    { ko: "캐시미어 코트", name: "Cashmere coat" },
    { ko: "롱패딩", name: "Long down coat" },
    { ko: "하이넥 스웨터", name: "High-neck sweater" },
    { ko: "니트 원피스", name: "Knit one-piece" },
    { ko: "플리스 자켓", name: "Fleece jacket" },
    { ko: "울 팬츠", name: "Wool pants" },
    { ko: "스웨터 드레스", name: "Sweater dress" },
    { ko: "극세사 셔츠", name: "Microfiber shirt" },
    { ko: "오버사이즈 코트", name: "Oversized coat" },
    { ko: "다운 베스트", name: "Down vest" },
    { ko: "롱 니트 스웨터", name: "Long knit sweater" }
  ];
  
  module.exports = { rainItems, snowItems, springItems, summerItems, autumnItems, winterItems };
  