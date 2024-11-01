import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.RandomStringUtils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class RequestService {
    private static final Integer TIME_OUT = 5000;
    private static final String API_KEY = "6e84ebeb9c8eb9215c1d3f8de4de4fa7598cea2719f94ccb6a9109d35d4f5345";
    private static final String PPURIO_ACCOUNT = "cap123";
    private static final String FROM = "01040997586";
    private static final String FILE_PATH = "{MMS 발송인 경우 첨부할 이미지 경로}";
    private static final String URI = "https://message.ppurio.com";

    public void requestSend() {
        String basicAuthorization = Base64.getEncoder().encodeToString((PPURIO_ACCOUNT + ":" + API_KEY).getBytes());

        Map<String, Object> tokenResponse = getToken(URI, basicAuthorization); // 토큰 발급
        Map<String ,Object> sendResponse = send(URI, (String) tokenResponse.get("token")); // 발송 요청

        System.out.println(sendResponse.toString());
    }

    public void requestCancel() {
        String basicAuthorization = Base64.getEncoder().encodeToString((PPURIO_ACCOUNT + ":" + API_KEY).getBytes());

        Map<String, Object> tokenResponse = getToken(URI, basicAuthorization); // 토큰 발급
        Map<String, Object> cancelResponse = cancel(URI, (String) tokenResponse.get("token")); // 예약 취소 요청

        System.out.println(cancelResponse.toString());
    }

    /**
     * Access Token 발급 요청 (한 번 발급된 토큰은 24시간 유효합니다.)
     * @param baseUri 요청 URI ex) https://message.ppurio.com
     * @param BasicAuthorization "계정:연동 개발 인증키"를 Base64 인코딩한 문자열
     * @return Map
     */
    private Map<String, Object> getToken(String baseUri, String BasicAuthorization) {
        HttpURLConnection conn = null;
        try {
            // 요청 파라미터 생성
            Request request = new Request(baseUri + "/v1/token", "Basic " + BasicAuthorization);

            // 요청 객체 생성
            conn = createConnection(request);

            // 응답 데이터 객체 변환
            return getResponseBody(conn);
        } catch (IOException e) {
            throw new RuntimeException("API 요청과 응답 실패", e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * 문자 발송 요청
     * @param baseUri 요청 URI ex) https://message.ppurio.com
     * @param accessToken 토큰 발급 API를 통해 발급 받은 Access Token, 유효기간이 1일이기 때문에 만료될 경우 재발급 필요
     * @return Map
     */
    private Map<String, Object> send(String baseUri, String accessToken) {
        HttpURLConnection conn = null;
        try {
            // 요청 파라미터 생성
            String bearerAuthorization = String.format("%s %s", "Bearer", accessToken);
            Request request = new Request(baseUri + "/v1/message", bearerAuthorization);

            // 요청 객체 생성
            conn = createConnection(request, createSendTestParams());// sms 발송 테스트

            // 응답 데이터 객체 변환
            return getResponseBody(conn);
        } catch (IOException e) {
            throw new RuntimeException("API 요청과 응답 실패", e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * 예약발송 취소 요청
     * @param baseUri 요청 URI ex) https://message.ppurio.com
     * @param accessToken 토큰 발급 API를 통해 발급 받은 Access Token, 유효기간이 1일이기 때문에 만료될 경우 재발급 필요
     * @return Map
     */
    private Map<String, Object> cancel(String baseUri, String accessToken) {
        HttpURLConnection conn = null;
        try {
            // 요청 파라미터 생성
            String token = String.format("%s %s", "Bearer", accessToken);
            Request request = new Request(baseUri + "/v1/cancel", token);

            // 요청 객체 생성
            conn = createConnection(request, createCancelTestParams());// 예약 취소 테스트

            // 응답 데이터 객체 변환
            return getResponseBody(conn);
        } catch (IOException e) {
            throw new RuntimeException("API 요청과 응답 실패", e);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private <T> HttpURLConnection createConnection(Request request, T requestObject) throws IOException {
        ObjectMapper objectMapper = new ObjectMapper();
        String jsonInputString = objectMapper.writeValueAsString(requestObject);
        // 요청 객체 생성
        HttpURLConnection connect = createConnection(request);
        connect.setDoOutput(true); // URL 연결을 출력용으로 사용(true)
        // 요청 데이터 처리
        try (OutputStream os = connect.getOutputStream()) {
            byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
            os.write(input, 0, input.length);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return connect;
    }

    private HttpURLConnection createConnection(Request request) throws IOException {
        URL url = new URL(request.getRequestUri());
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setRequestProperty("Authorization", request.getAuthorization()); // Authorization 헤더 입력
        conn.setConnectTimeout(TIME_OUT); // 연결 타임아웃 설정(5초)
        conn.setReadTimeout(TIME_OUT); // 읽기 타임아웃 설정(5초)
        return conn;
    }

    private Map<String, Object> getResponseBody(HttpURLConnection conn) {
        InputStream inputStream;

        if (conn.getResponseCode() == 200) { // 요청 성공
            inputStream = conn.getInputStream();
        } else { // 서버에서 요청은 수신했으나 특정 이유로 인해 실패함
            inputStream = conn.getErrorStream();
        }

        try (BufferedReader br = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            String inputLine;
            StringBuilder responseBody = new StringBuilder();
            while ((inputLine = br.readLine()) != null) {
                responseBody.append(inputLine);
            }

            // 성공 응답 데이터 변환
            return convertJsonToMap(responseBody.toString());
        } catch (IOException e) {
            throw new RuntimeException("API 응답을 읽는 데 실패했습니다.", e);
        }
    }

    private Map<String, Object> convertJsonToMap(String jsonString) throws JsonProcessingException {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readValue(jsonString, new TypeReference<>() {});
    }

    private Map<String, Object> createSendTestParams() throws IOException {
        HashMap<String, Object> params = new HashMap<>();
        params.put("account", PPURIO_ACCOUNT);
        params.put("messageType", "MMS");
        params.put("from", FROM);
        params.put("content", "[*이름*], hello this is [*1*]");
        params.put("duplicateFlag", "Y");
        params.put("rejectType", "AD"); // 광고성 문자 수신거부 설정, 비활성화할 경우 해당 파라미터 제외
        params.put("targetCount", 1);
        params.put("targets", List.of(
                Map.of("to", "010XXXXXXXX",
                        "name", "tester",
                        "changeWord", Map.of(
                                "var1", "ppurio api world")))
        );
        params.put("files", List.of(
                createFileTestParams(FILE_PATH)
        ));
        params.put("refKey", RandomStringUtils.random(32, true, true)); // refKey 생성, 32자 이내로 아무 값이든 상관 없음
        return params;
    }

    private Map<String, Object> createFileTestParams(String filePath) throws RuntimeException, IOException {
        FileInputStream fileInputStream = null;
        try {
            File file = new File(filePath);
            byte[] fileBytes = new byte[ (int) file.length()];
            fileInputStream = new FileInputStream(file);
            int readBytes = fileInputStream.read(fileBytes);

            if (readBytes != file.length()) {
                throw new IOException();
            }

            String encodedFileData = Base64.getEncoder().encodeToString(fileBytes);

            HashMap<String, Object> params = new HashMap<>();
            params.put("size", file.length());
            params.put("name", file.getName());
            params.put("data", encodedFileData);
            return params;
        } catch (IOException e) {
            throw new RuntimeException("파일을 가져오는데 실패했습니다.", e);
        } finally {
            if(fileInputStream != null) {
                fileInputStream.close();
            }
        }
    }

    private Map<String, Object> createCancelTestParams() {
        HashMap<String, Object> params = new HashMap<>();
        params.put("account", PPURIO_ACCOUNT);
        params.put("messageKey", "230413110135117SMS029914servsUBn");
        return params;
    }
}

class Request {
    private String requestUri;
    private String authorization;

    public Request(String requestUri, String authorization) {
        this.requestUri = requestUri;
        this.authorization = authorization;
    }

    public String getRequestUri() {
        return requestUri;
    }

    public String getAuthorization() {
        return authorization;
    }
}