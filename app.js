const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

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

// Глобальная функция переключения вкладок нижнего меню
window.switchTab = function(tabId, navElement = null) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    if (navElement) {
        navElement.classList.add('active');
    } else {
        let index = ['tab-home', 'tab-case', 'tab-chat', 'tab-docs', 'tab-profile'].indexOf(tabId);
        if(index !== -1) {
            document.querySelectorAll('.nav-item')[index].classList.add('active');
        }
    }
    window.scrollTo(0, 0);
};

document.addEventListener("DOMContentLoaded", () => {
    const greetingEl = document.getElementById("greeting");
    const user = tg.initDataUnsafe?.user;
    const firstName = user?.first_name || "Гость";
    if (greetingEl) {
        greetingEl.textContent = `Добрый день, ${firstName}`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const currentStage = parseInt(urlParams.get('stage')) || 0;

    // Функция отрисовки таймлайна всех 13 стадий во вкладке "Дело"
    function buildTimeline(current) {
        const container = document.getElementById("all-stages-container");
        if (!container) return;

        let html = '';
        STAGES_DATA.forEach((stage, index) => {
            const stageNum = index + 1;
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

    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        const mainBlock = currentStage === 0 ? document.getElementById("application-block") : document.getElementById("main-app");

        if (splash) splash.style.opacity = '0';

        setTimeout(() => {
            if (splash) splash.classList.remove("active");
            if (mainBlock) mainBlock.style.display = currentStage === 0 ? "block" : "flex";

            if (currentStage > 0) {
                const stageIndex = currentStage - 1;
                const stageTitle = STAGES_DATA[stageIndex] ? STAGES_DATA[stageIndex].title : "Загрузка...";
                const stageText = `Этап ${currentStage} из 13`;
                const percent = (currentStage / 13) * 100;

                // Заполнение главной страницы
                const homeTitle = document.getElementById("home-stage-title");
                const homeFooter = document.getElementById("home-stage-footer");
                const homeBar = document.getElementById("home-progress-bar");
                if (homeTitle) homeTitle.textContent = stageTitle;
                if (homeFooter) homeFooter.textContent = stageText;
                if (homeBar) homeBar.style.width = percent + "%";

                // Заполнение вкладки "Дело"
                const caseTitle = document.getElementById("case-stage-title");
                if (caseTitle) caseTitle.textContent = stageTitle;

                // Вызываем построение таймлайна
                buildTimeline(currentStage);
            }

            setTimeout(() => {
                if (mainBlock) mainBlock.style.opacity = '1';
                if(tg.themeParams && tg.themeParams.secondary_bg_color) {
                    tg.setHeaderColor(tg.themeParams.secondary_bg_color);
                }
            }, 50);
        }, 500);
    }, 2500);

    // Обработчик отправки анкеты
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

    // Обработчик отправки документов
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