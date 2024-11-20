 // 메모장 파일 처리
 document.getElementById('uploadTextFileButton').addEventListener('click', function () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.txt'; // 메모장 파일만 허용
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                const phoneNumbers = reader.result.split('\n').map(num => num.trim());
                document.getElementById('phoneInput').value += phoneNumbers.join('\n') + '\n';
            };
            reader.readAsText(file);
        }
    };
    fileInput.click();
});


document.getElementById('uploadExcelButton').addEventListener('click', function () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xls, .xlsx'; // 엑셀 파일만 허용
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 첫 번째 시트 선택
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];

                // 시트 데이터를 JSON 배열로 변환
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                // A열 데이터만 추출 (1행부터 마지막 행까지)
                const phoneNumbers = rows
                    .map(row => row[0]) // 첫 번째 열(A열) 데이터만 선택
                    .filter(item => item !== undefined && item !== null && item.toString().trim() !== '');

                // Textarea에 추가
                const phoneInput = document.getElementById('phoneInput');
                phoneInput.value += phoneNumbers.join('\n') + '\n';
            };
            reader.readAsArrayBuffer(file);
        }
    };
    fileInput.click();
});
// 한글 파일 처리
document.getElementById('uploadHwpButton').addEventListener('click', function () {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.hwp'; // 한글 파일만 허용
    fileInput.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                HWP.load(reader.result).then(function (content) {
                    const phoneNumbers = content.body.split('\n').map(num => num.trim());
                    document.getElementById('phoneInput').value += phoneNumbers.join('\n') + '\n';
                }).catch(function (error) {
                    console.error('한글 파일을 처리하는 중 오류 발생:', error);
                });
            };
            reader.readAsArrayBuffer(file);
        }
    };
    fileInput.click();
});