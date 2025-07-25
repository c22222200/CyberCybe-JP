document.addEventListener('DOMContentLoaded', function () {
    
    // --- 密碼保護邏輯 (相容性修復版) ---

    const CORRECT_PASSWORD_ENCODED = 'MjAyNQ==';
    const passwordOverlay = document.getElementById('password-overlay');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const errorMessage = document.getElementById('error-message');
    const presentationWrapper = document.getElementById('presentation-wrapper');

    const checkPassword = () => {
        const userInput = passwordInput.value;
        if (!userInput) return; // 如果輸入為空則不處理

        // 使用 btoa() 將使用者輸入的內容進行 Base64 編碼
        const userInputEncoded = btoa(userInput);

        if (userInputEncoded === CORRECT_PASSWORD_ENCODED) {
            // 密碼正確，淡出密碼層並載入內容
            passwordOverlay.style.opacity = '0';
            setTimeout(() => {
                passwordOverlay.style.display = 'none';
                loadPresentationContent(); // 載入簡報
            }, 500); // 等待淡出動畫結束
        } else {
            // 密碼錯誤
            errorMessage.textContent = '密碼錯誤，請重試。';
            passwordInput.classList.add('border-red-500');
            passwordInput.value = '';
            setTimeout(() => {
               errorMessage.textContent = '';
               passwordInput.classList.remove('border-red-500');
            }, 2000);
        }
    };

    const loadPresentationContent = async () => {
        try {
            // 使用 fetch 讀取 presentation-content.html
            const response = await fetch('presentation-content.html');
            if (!response.ok) {
                throw new Error('無法載入簡報內容。請確認 presentation-content.html 檔案存在。');
            }
            const contentHtml = await response.text();
            
            // 將內容注入到主頁面的容器中
            presentationWrapper.innerHTML = contentHtml;
            presentationWrapper.style.animation = 'fadeIn 0.5s ease-in';

            // 內容載入後，初始化簡報
            initializePresentation();

        } catch (error) {
            console.error('載入錯誤:', error);
            presentationWrapper.innerHTML = `<div class="text-white text-center">${error.message}</div>`;
        }
    };

    // 監聽密碼相關事件
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkPassword();
        }
    });

    // 頁面載入後自動聚焦
    passwordInput.focus();


    // --- 簡報控制邏輯 (被包裝成一個函式) ---
    const initializePresentation = () => {
        // --- 元素選擇 (在內容載入後才執行) ---
        const presentation = document.getElementById('presentation');
        const slides = document.querySelectorAll('.slide');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const slideCounter = document.getElementById('slideCounter');
        const progressBar = document.getElementById('progressBar');
        
        // --- 狀態管理 ---
        let currentSlide = 0;
        const totalSlides = slides.length;

        // --- Chart.js 圖表初始化 ---
        const initializeCharts = () => {
            Chart.defaults.font.family = "'Inter', 'Noto Sans TC', sans-serif";
            Chart.defaults.font.size = 14;
            Chart.defaults.color = '#374151';
            Chart.register(ChartDataLabels);

            const shareholdingChartCtx = document.getElementById('shareholdingChart');
            if(shareholdingChartCtx) {
                new Chart(shareholdingChartCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['投資人 (20%)', 'CyberCube 台灣總部 (65%)', '日本經營團隊 (15%)'],
                        datasets: [{
                            label: '日本公司股權結構',
                            data: [20, 65, 15],
                            backgroundColor: ['#4f46e5', '#3b82f6', '#a78bfa'],
                            borderColor: '#ffffff',
                            borderWidth: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                            legend: { position: 'bottom', labels: { padding: 20, font: { size: 14 } } },
                            title: { display: true, text: 'CyberCube 日本公司股權結構', font: { size: 18, weight: 'bold' } },
                            datalabels: {
                                formatter: (value) => value + '%',
                                color: '#fff',
                                font: { weight: 'bold', size: 16 }
                            }
                        }
                    }
                });
            }
        };

        // --- 核心功能函式 ---
        const showSlide = (index) => {
            if (index < 0 || index >= totalSlides) return;
            
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });

            currentSlide = index;
            updateControls();
        };

        const updateControls = () => {
            if(slideCounter) slideCounter.textContent = `第 ${currentSlide + 1} / ${totalSlides} 頁`;
            if(progressBar) progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
            if(prevBtn) prevBtn.disabled = currentSlide === 0;
            if(nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;
        };

        // --- 事件監聽 ---
        if(prevBtn) prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        if(nextBtn) nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        
        document.addEventListener('keydown', (e) => {
            // 確保簡報已顯示
            if (!presentationWrapper.querySelector('#presentation')) return;
            // 將列印快捷鍵移到這裡，確保只有在簡報顯示時才觸發
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault(); 
                window.print();
                return; // 避免觸發下一頁
            }
            if (e.key === 'ArrowRight' || e.key === ' ') nextBtn.click();
            else if (e.key === 'ArrowLeft') prevBtn.click();
        });

        // --- 初始化 ---
        initializeCharts();
        showSlide(0);
    };
});
