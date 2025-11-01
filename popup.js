document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userDataForm');
    const message = document.getElementById('message');
    const clearBtn = document.querySelector('.clear-btn');

    // 페이지 로드 시 저장된 데이터 불러오기
    loadSavedData();

    // 폼 제출 이벤트
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveData();
    });

    // 데이터 초기화 버튼
    clearBtn.addEventListener('click', function() {
        if (confirm('저장된 모든 데이터를 삭제하시겠습니까?')) {
            clearData();
        }
    });

    // 엔터 키로 저장
    form.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            saveData();
        }
    });

    // 데이터 저장 함수
    function saveData() {
        const formData = new FormData(form);
        const userData = {};

        // 모든 필드를 선택적으로 저장 (값이 있는 경우만)
        const allFields = ['name', 'department', 'course', 'studentId', 'gender', 'phone', 'email', 'bank', 'accountNumber'];
        
        for (const field of allFields) {
            const value = formData.get(field);
            if (value && value.trim() !== '') {
                userData[field] = value.trim();
            }
        }

        // 휴대폰과 이메일이 모두 있는 경우만 합쳐서 저장
        if (userData.phone && userData.email) {
            userData.phoneEmail = `${userData.phone} & ${userData.email}`;
        } else if (userData.phone) {
            userData.phoneEmail = userData.phone;
        } else if (userData.email) {
            userData.phoneEmail = userData.email;
        }
        
        userData.savedAt = new Date().toISOString();

        // Chrome Storage에 저장
        chrome.storage.local.set({ userInfo: userData }, function() {
            if (chrome.runtime.lastError) {
                showMessage('저장 중 오류가 발생했습니다.', 'error');
                console.error('Storage error:', chrome.runtime.lastError);
            } else {
                // 브라우저에 토스트 메시지 표시
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'showToast',
                            message: 'POSTECH 의료공제: 정보가 저장되었습니다.',
                            type: 'success'
                        }).catch(() => {
                            // content script가 없는 페이지에서는 무시
                        });
                    }
                });
                
                // 즉시 플러그인 창 닫기
                window.close();
            }
        });
    }

    // 저장된 데이터 불러오기
    function loadSavedData() {
        chrome.storage.local.get(['userInfo'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Storage error:', chrome.runtime.lastError);
                return;
            }

            const userData = result.userInfo;
            if (userData) {
                // 텍스트 입력 필드
                const textFields = ['name', 'studentId', 'phone', 'email', 'accountNumber'];
                textFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element && userData[field]) {
                        element.value = userData[field];
                    }
                });

                // 드롭다운
                const selectFields = ['department', 'course', 'bank'];
                selectFields.forEach(field => {
                    const element = document.getElementById(field);
                    if (element && userData[field]) {
                        element.value = userData[field];
                    }
                });

                // 라디오 버튼
                const radioFields = ['gender'];
                radioFields.forEach(field => {
                    if (userData[field]) {
                        const radio = document.querySelector(`input[name="${field}"][value="${userData[field]}"]`);
                        if (radio) {
                            radio.checked = true;
                        }
                    }
                });

                // 합쳐진 phoneEmail을 분리해서 표시
                if (userData.phoneEmail && userData.phoneEmail.includes(' & ')) {
                    const [phone, email] = userData.phoneEmail.split(' & ');
                    const phoneElement = document.getElementById('phone');
                    const emailElement = document.getElementById('email');
                    if (phoneElement && phone) phoneElement.value = phone;
                    if (emailElement && email) emailElement.value = email;
                }
                
                showMessage('기존 데이터를 불러왔습니다.', 'info');
            }
        });
    }

    // 데이터 초기화
    function clearData() {
        chrome.storage.local.remove(['userInfo'], function() {
            if (chrome.runtime.lastError) {
                showMessage('삭제 중 오류가 발생했습니다.', 'error');
                console.error('Storage error:', chrome.runtime.lastError);
            } else {
                form.reset();
                showMessage('모든 데이터가 삭제되었습니다.', 'success');
            }
        });
    }

    // 메시지 표시
    function showMessage(text, type) {
        message.textContent = text;
        message.className = `message ${type}`;
        message.style.display = 'block';

        // 3초 후 메시지 숨기기
        setTimeout(() => {
            message.style.display = 'none';
        }, 3000);
    }

    // 계좌번호 입력 시 숫자만 허용
    const accountNumberInput = document.getElementById('accountNumber');
    if (accountNumberInput) {
        accountNumberInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }

    // 학번 입력 시 숫자만 허용
    const studentIdInput = document.getElementById('studentId');
    if (studentIdInput) {
        studentIdInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    }
});