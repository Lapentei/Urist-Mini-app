const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Массив всех этапов
const STAGES = [
    "Не начато", // Индекс 0
    "Заявление подано ожидайте ответа", // 1
    "Заключен договор", // 2
    "Сбор документов", // 3
    "Подготовка заявления в суд", // 4
    "Уведомление кредиторов", // 5
    "Заявление направлено в суд", // 6
    "Заявление принято судом", // 7
    "Ожидание даты суда", // 8
    "Признание банкротом", // 9
    "Ожидание требований кредиторов", // 10
    "Рассмотрение требований", // 11
    "Подготовка отчета АУ", // 12
    "Процедура завершена" // 13
];

document.addEventListener("DOMContentLoaded", () => {
    const greetingEl = document.getElementById("greeting");
    const user = tg.initDataUnsafe?.user;
    const firstName = user?.first_name || "Гость";
    greetingEl.textContent = `Добрый день, ${firstName}`;

    // --- Получаем этап из URL параметров ---
    const urlParams = new URLSearchParams(window.location.search);
    const currentStage = parseInt(urlParams.get('stage')) || 0;

    // --- Логика отображения нужного блока ---
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        const main = document.getElementById("main-screen");
        splash.style.opacity = '0';

        setTimeout(() => {
            splash.classList.remove("active");
            main.classList.add("active");

            // Включаем нужный блок в зависимости от этапа
            if (currentStage === 0) {
                document.getElementById("application-block").style.display = "block";
            } else {
                document.getElementById("progress-block").style.display = "block";

                // Обновляем текст и полосу прогресса
                document.getElementById("stage-title").textContent = STAGES[currentStage];
                document.getElementById("stage-footer").textContent = `Этап ${currentStage} из 13`;

                // Высчитываем ширину полосы (от 1 до 13)
                const percent = (currentStage / 13) * 100;
                document.getElementById("progress-bar").style.width = percent + "%";
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