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

window.switchTab = function(tabId, navElement = null) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    if (navElement) {
        navElement.classList.add('active');
    } else {
        let index = ['tab-home', 'tab-case', 'tab-chat', 'tab-docs', 'tab-profile'].indexOf(tabId);
        if(index !== -1) document.querySelectorAll('.nav-item')[index].classList.add('active');
    }
    window.scrollTo(0, 0);
};

// Функция перенаправления к загрузке конкретного файла
window.goToUpload = function(docName) {
    switchTab('tab-docs');
    const select = document.getElementById("docSelect");
    const customGroup = document.getElementById("customDocGroup");
    const customInput = document.getElementById("documentDescription");

    let found = false;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value === docName) {
            select.selectedIndex = i;
            found = true;
            break;
        }
    }

    if (!found) {
        select.value = "Другой документ";
        customGroup.style.display = "flex";
        customInput.value = docName;
        customInput.required = true;
    } else {
        customGroup.style.display = "none";
        customInput.value = "";
        customInput.required = false;
    }
};

function decodeBase64(str) {
    try {
        let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
        let bin = atob(b64);
        let bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder('utf-8').decode(bytes);
    } catch (e) { return null; }
}

document.addEventListener("DOMContentLoaded", () => {
    const greetingEl = document.getElementById("greeting");
    const user = tg.initDataUnsafe?.user;
    if (greetingEl) greetingEl.textContent = `Добрый день, ${user?.first_name || "Гость"}`;

    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    let dbData = { st: 0, d: [], req: [], creq: [] };

    if (dataParam) {
        let jsonStr = decodeBase64(dataParam);
        if (jsonStr) dbData = JSON.parse(jsonStr);
    }

    const currentStage = dbData.st;

    // Логика выпадающего списка "Другой документ"
    const docSelect = document.getElementById("docSelect");
    const customDocGroup = document.getElementById("customDocGroup");
    const docDescInput = document.getElementById("documentDescription");

    if (docSelect) {
        docSelect.addEventListener("change", (e) => {
            if (e.target.value === "Другой документ") {
                customDocGroup.style.display = "flex";
                docDescInput.required = true;
            } else {
                customDocGroup.style.display = "none";
                docDescInput.required = false;
                docDescInput.value = "";
            }
        });
    }

    // ГЕНЕРАЦИЯ БЛОКА "ТРЕБУЕТ ВНИМАНИЯ"
    const attentionList = document.getElementById("attention-list");
    const attentionContainer = document.getElementById("attention-container");

    if (attentionList && attentionContainer) {
        let attentionHtml = "";
        let hasTasks = false;

        // Обязательные документы
        if (dbData.req && dbData.req.length > 0) {
            hasTasks = true;
            dbData.req.forEach(docName => {
                attentionHtml += `
                <div class="task-item" onclick="goToUpload('${docName}')" style="cursor: pointer;">
                    <div class="task-icon" style="background:rgba(154, 66, 34, 0.1); color: var(--gold);">⚠️</div>
                    <div class="task-info">
                        <h4>Необходим документ</h4>
                        <p>${docName}</p>
                    </div>
                    <div class="arrow">></div>
                </div>`;
            });
        }

        // Кастомные запросы от юриста
        if (dbData.creq && dbData.creq.length > 0) {
            hasTasks = true;
            dbData.creq.forEach(docName => {
                attentionHtml += `
                <div class="task-item" onclick="goToUpload('${docName}')" style="cursor: pointer;">
                    <div class="task-icon" style="background:rgba(154, 66, 34, 0.1); color: var(--gold);">📩</div>
                    <div class="task-info">
                        <h4>Запрос от юриста</h4>
                        <p>${docName}</p>
                    </div>
                    <div class="arrow">></div>
                </div>`;
            });
        }

        if (hasTasks) {
            attentionContainer.style.display = "block";
            attentionList.innerHTML = attentionHtml;
        }
    }

    // Заполнение профиля
    if (document.getElementById("profile-fio")) document.getElementById("profile-fio").textContent = dbData.fio || "Не указано";
    if (document.getElementById("profile-phone")) document.getElementById("profile-phone").textContent = dbData.ph || "Не указан";
    if (document.getElementById("profile-inn")) document.getElementById("profile-inn").textContent = dbData.inn || "Не указан";
    if (document.getElementById("profile-snils")) document.getElementById("profile-snils").textContent = dbData.sn || "Не указан";
    if (document.getElementById("profile-debt")) document.getElementById("profile-debt").textContent = dbData.db || "0";

    // Отрисовка документов
    const docsListContainer = document.getElementById("uploaded-docs-list");
    if (docsListContainer) {
        if (dbData.d && dbData.d.length > 0) {
            let docsHtml = "";
            dbData.d.forEach(doc => {
                docsHtml += `<div class="task-item" style="cursor: default;"><div class="task-icon" style="background:#27ae60; color:white;">📄</div><div class="task-info"><h4>${doc.t}</h4><p>Загружен: ${doc.d}</p></div></div>`;
            });
            docsListContainer.innerHTML = docsHtml;
        } else {
            docsListContainer.innerHTML = `<div class="card dark-card" style="text-align: center; color: var(--text-muted); padding: 20px;">Вы пока не загрузили ни одного документа.</div>`;
        }
    }

    function buildTimeline(current) {
        const container = document.getElementById("all-stages-container");
        if (!container) return;
        let html = '';
        STAGES_DATA.forEach((stage, index) => {
            const stageNum = index + 1;
            let stateClass = stageNum < current ? 'completed' : (stageNum === current ? 'current' : 'future');
            html += `<div class="timeline-item ${stateClass}"><div class="timeline-marker"><div class="timeline-dot"></div><div class="timeline-line"></div></div><div class="timeline-content"><div class="timeline-title">${stageNum} · ${stage.title}</div><div class="timeline-subtitle">${stage.subtitle}</div></div></div>`;
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

                if (document.getElementById("home-stage-title")) document.getElementById("home-stage-title").textContent = stageTitle;
                if (document.getElementById("home-stage-footer")) document.getElementById("home-stage-footer").textContent = stageText;
                if (document.getElementById("home-progress-bar")) document.getElementById("home-progress-bar").style.width = percent + "%";
                if (document.getElementById("case-stage-title")) document.getElementById("case-stage-title").textContent = stageTitle;
                buildTimeline(currentStage);
            }
            setTimeout(() => {
                if (mainBlock) mainBlock.style.opacity = '1';
                if(tg.themeParams && tg.themeParams.secondary_bg_color) tg.setHeaderColor(tg.themeParams.secondary_bg_color);
            }, 50);
        }, 500);
    }, 2500);

    const appForm = document.getElementById("appForm");
    if (appForm) {
        appForm.addEventListener("submit", (e) => {
            e.preventDefault();
            tg.sendData(JSON.stringify({
                action: "submit_application",
                phone: document.getElementById("appPhone").value,
                fio: document.getElementById("appFio").value,
                passport: document.getElementById("appPassport").value,
                inn: document.getElementById("appInn").value,
                snils: document.getElementById("appSnils").value,
                debt: document.getElementById("appDebt").value
            }));
        });
    }

    const uploadForm = document.getElementById("uploadForm");
    if (uploadForm) {
        uploadForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const selectVal = document.getElementById("docSelect").value;
            const customVal = document.getElementById("documentDescription").value;
            const finalDocName = (selectVal === "Другой документ") ? customVal : selectVal;

            tg.sendData(JSON.stringify({
                action: "upload_document",
                description: finalDocName
            }));
        });
    }
});