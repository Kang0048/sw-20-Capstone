# SW-20
### 메세징 서비스 AI 적용 이슈
![fdfdfdfdfd](https://github.com/user-attachments/assets/8fcfb7c9-51a0-4028-91a1-9631a06ff045)

20학번 팀
팀장 오현석(2091096), 강기영(2071276), 민동현(2071343), 송상훈(2071116), 유도현(2071113)

<br>

### 1.프로젝트 수행 목적

#### 1.1 프로젝트 정의

* 생성된 이미지에 문자 및 숫자 포함되지 않는 결과 생성되는 문제 해결



#### 1.2 프로젝트 배경

* 생성형 AI를 활용한 포토문자 서비스 어플리케이션 개발 (기업서버 연계)



### 2. 프로젝트 개요
* 고객이 입력한 문자 메시지가 LLM 호출로 프롬프트로 변화되고 이미지 생성을 할 때 이미지에 퀄리티가 떨어지고 알수없는 문자,숫자,기호들  
  이 함께 생성됨
#### 2.1 프로젝트 설명





#### 2.2 결과물
*실행환경: vscode
*cd SW-20 한 후
*npm install morgan
*npm install xlxs
*만일의 상황을 위하여 npm install
*cd backend 한 후 touch.env 파일 생성 한 후 OPENAI_API_KEY = your-api-key 기입 후 저장
*cd backend 에서 node server.js로 파일 실행
