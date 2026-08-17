const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Массив этапов с подзаголовками (как на скриншоте)
const STAGES_DATA = [
    { title: "Заявление подано ожидайте ответа", subtitle: "старт" },
    { title: "Заключен договор", subtitle: "документы" },
    { title: "Сбор документов", subtitle: "подготовка" },
    { title: "Подготовка заявления в суд", subtitle: "подготовка" },
    { title: "Уведомление кредиторов", subtitle: "подготовка" },
    { title: "Заявление направлено в суд", subtitle: "суд" },
    { title: "Заявление принято судом", subtitle: "суд" },
    { title: "Ожидание даты суда", subtitle: "суд" },
    { title: "Признание банкротом", subtitle: "судебная процедура" },
    { title: "Ожидание требований кредиторов", subtitle: "судебная процедура" },
    { title: "Рассмотрение требований", subtitle: "судебная процедура" },
    { title: "Подготовка отчета АУ", subtitle: "завершение" },
    { title: "Процедура завершена", subtitle: "финал" }
];

document.addEventListener("DOMContentLoaded", () => {
    const greetingEl = document.getElementById("greeting");
    const user = tg.initDataUnsafe?.user;
    const firstName = user?.first_name || "Гость";
    greetingEl.textContent = `Добрый день, ${firstName}`;

    // Получаем этап из URL (по умолчанию 0)
    const urlParams = new URLSearchParams(window.location.search);
    const currentStage = parseInt(urlParams.get('stage')) || 0;

    // Функция для генерации списка стадий (Таймлайн)
    function buildTimeline(current) {
        const container = document.getElementById("all-stages-container");
        if (!container) return;

        let html = '';
        STAGES_DATA.forEach((stage, index) => {
            const stageNum = index + 1;

            // Определяем статус стадии (пройдена, текущая, будущая)
            let stateClass = 'future';
            if (stageNum < current) {
                stateClass = 'completed';
            } else if (stageNum === current) {
                stateClass = 'current';
            }

            html += `
                <div class="timeline-item ${stateClass}">
                    <div class="timeline-marker">
                        <div class="timeline-dot"></div>
                        <div class="timeline-line"></div>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-title">${stageNum} · ${stage.title}</div>
                        <div class="timeline-subtitle">${stage.subtitle}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Логика кнопки "Смотреть все стадии"
    const viewBtn = document.getElementById("view-all-stages-btn");
    const stagesContainer = document.getElementById("all-stages-container");
    const arrowIcon = document.getElementById("arrow-icon");

    if (viewBtn && stagesContainer) {
        viewBtn.addEventListener("click", () => {
            if (stagesContainer.style.display === "none") {
                stagesContainer.style.display = "block";
                arrowIcon.textContent = "▲";
                viewBtn.firstChild.textContent = "Скрыть стадии ";
            } else {
                stagesContainer.style.display = "none";
                arrowIcon.textContent = "▼";
                viewBtn.firstChild.textContent = "Смотреть все стадии ";
            }
        });
    }

    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        const main = document.getElementById("main-screen");
        splash.style.opacity = '0';

        setTimeout(() => {
            splash.classList.remove("active");
            main.classList.add("active");

            if (currentStage === 0) {
                document.getElementById("application-block").style.display = "block";
            } else {
                document.getElementById("progress-block").style.display = "block";

                // Заполняем данные текущего этапа
                const stageIndex = currentStage - 1; // Индекс в массиве на 1 меньше номера этапа
                if (STAGES_DATA[stageIndex]) {
                    document.getElementById("stage-title").textContent = STAGES_DATA[stageIndex].title;
                }
                document.getElementById("stage-footer").textContent = `Этап ${currentStage} из 13`;

                const percent = (currentStage / 13) * 100;
                document.getElementById("progress-bar").style.width = percent + "%";

                // Генерируем таймлайн
                buildTimeline(currentStage);
            }

            setTimeout(() => {
                main.style.opacity = '1';
                if(tg.themeParams.secondary_bg_color) {
                    tg.setHeaderColor(tg.themeParams.secondary_bg_color);
                }
            }, 50);
        }, 500);
    }, 2500);

    // --- ОТПРАВКА АНКЕТЫ ---
    const appForm = document.getElementById("appForm");
    if (appForm) {
        appForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const dataToSend = {
                action: "submit_application",
                phone: document.getElementById("appPhone").value,
                fio: document.getElementById("appFio").value,
                passport: document.getElementById("appPassport").value,
                inn: document.getElementById("appInn").value,
                snils: document.getElementById("appSnils").value,
                debt: document.getElementById("appDebt").value
            };
            tg.sendData(JSON.stringify(dataToSend));
        });
    }

    // --- ЗАПРОС НА ОТПРАВКУ ДОКУМЕНТА ---
    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const dataToSend = {
                action: "upload_document",
                description: document.getElementById("documentDescription").value
            };
            tg.sendData(JSON.stringify(dataToSend));
        });
    }
});