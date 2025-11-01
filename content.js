(function() {
    'use strict';

    // 페이지가 완전히 로드된 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAutofill);
    } else {
        initAutofill();
    }

    function initAutofill() {
        // 추가 지연을 두어 동적 콘텐츠 로딩 완료 대기
        setTimeout(() => {
            loadAndFillData();
        }, 1000);
    }

    function loadAndFillData() {
        // Chrome Storage에서 사용자 데이터 불러오기
        chrome.storage.local.get(['userInfo'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('POSTECH Medical Autofill - Storage error:', chrome.runtime.lastError);
                return;
            }

            const userData = result.userInfo;
            if (!userData) {
                console.log('POSTECH Medical Autofill - No user data found');
                return;
            }

            console.log('POSTECH Medical Autofill - Starting autofill process');
            fillFormFields(userData);
        });
    }

    function fillFormFields(userData) {
        let filledCount = 0;

        // 1. 제목 자동완성 - "{이름} 의료공제회 신청"
        if (userData.name) {
            const titleElement = document.querySelector('#title');
            if (titleElement) {
                titleElement.value = `${userData.name} 의료공제회 신청`;
                titleElement.dispatchEvent(new Event('input', { bubbles: true }));
                titleElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled title: ${userData.name} 의료공제회 신청`);
                filledCount++;
            }
        }

        // 2. 학과 자동완성
        if (userData.department) {
            const deptElement = document.querySelector('#dep_selec');
            if (deptElement) {
                deptElement.value = userData.department;
                deptElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled department: ${userData.department}`);
                filledCount++;
            }
        }

        // 3. 과정 자동완성
        if (userData.course) {
            const courseElement = document.querySelector('#cour_selec');
            if (courseElement) {
                courseElement.value = userData.course;
                courseElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled course: ${userData.course}`);
                filledCount++;
            }
        }

        // 4. 학번 자동완성
        if (userData.studentId) {
            const studNumElement = document.querySelector('#stud_num');
            if (studNumElement) {
                studNumElement.value = userData.studentId;
                studNumElement.dispatchEvent(new Event('input', { bubbles: true }));
                studNumElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled student ID: ${userData.studentId}`);
                filledCount++;
            }
        }

        // 5. 이름 자동완성
        if (userData.name) {
            const nameElement = document.querySelector('#kboard-input-member-display');
            if (nameElement) {
                nameElement.value = userData.name;
                nameElement.dispatchEvent(new Event('input', { bubbles: true }));
                nameElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled name: ${userData.name}`);
                filledCount++;
            }
        }

        // 6. 성별 자동완성
        if (userData.gender) {
            const genderValue = userData.gender === 'male' ? '남' : '여';
            const genderElement = document.querySelector(`input[name="kboard_option_sex_selec"][value="${genderValue}"]`);
            if (genderElement) {
                genderElement.checked = true;
                genderElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled gender: ${genderValue}`);
                filledCount++;
            }
        }

        // 7. 휴대폰 & e-mail 자동완성
        if (userData.phoneEmail) {
            const phoneElement = document.querySelector('#phon_num');
            if (phoneElement) {
                phoneElement.value = userData.phoneEmail;
                phoneElement.dispatchEvent(new Event('input', { bubbles: true }));
                phoneElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled phone & email: ${userData.phoneEmail}`);
                filledCount++;
            }
        }

        // 8. 은행명 자동완성
        if (userData.bank) {
            const bankElement = document.querySelector('#bank_name');
            if (bankElement) {
                bankElement.value = userData.bank;
                bankElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled bank: ${userData.bank}`);
                filledCount++;
            }
        }

        // 9. 계좌번호 자동완성
        if (userData.accountNumber) {
            const accountElement = document.querySelector('#bank_num');
            if (accountElement) {
                accountElement.value = userData.accountNumber;
                accountElement.dispatchEvent(new Event('input', { bubbles: true }));
                accountElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled account number: ${userData.accountNumber}`);
                filledCount++;
            }
        }

        // 10. 서명 자동완성 (이름과 동일)
        if (userData.name) {
            const signElement = document.querySelector('#name_sign');
            if (signElement) {
                signElement.value = userData.name;
                signElement.dispatchEvent(new Event('input', { bubbles: true }));
                signElement.dispatchEvent(new Event('change', { bubbles: true }));
                console.log(`POSTECH Medical Autofill - Filled signature: ${userData.name}`);
                filledCount++;
            }
        }

        console.log(`POSTECH Medical Autofill - Filled ${filledCount} fields`);
        
        if (filledCount > 0) {
            showAutofillNotification();
        }
    }


    function showAutofillNotification() {
        showToastNotification('POSTECH 의료공제: 필드들이 자동완성되었습니다', 'success');
    }

    function showToastNotification(message, type = 'success') {
        // 알림 div 생성
        const notification = document.createElement('div');
        
        const backgroundColor = type === 'success' ? '#c8007a' : '#dc3545';
        const icon = type === 'success' ? '✅' : '❌';
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            z-index: 999999;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 16px;">${icon}</span>
                <span>${message}</span>
            </div>
        `;

        // 애니메이션 CSS 추가 (한 번만)
        if (!document.querySelector('#postech-toast-styles')) {
            const style = document.createElement('style');
            style.id = 'postech-toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 3초 후 알림 제거
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // 메시지 리스너 추가
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'showToast') {
            showToastNotification(message.message, message.type);
            sendResponse({success: true});
        }
    });

})();