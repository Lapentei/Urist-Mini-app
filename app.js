// Инициализация Telegram Web Apps API
const tg = window.Telegram.WebApp;

// Разворачиваем приложение на весь экран
tg.expand();

// Уведомляем Telegram, что приложение готово к отображению
tg.ready();

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. ЛОГИКА ИНТЕРФЕЙСА И ПРИВЕТСТВИЯ ---
    const greetingEl = document.getElementById("greeting");
    
    // Получаем данные о пользователе из объекта Telegram
    const user = tg.initDataUnsafe?.user;
    
    // Берем имя пользователя. Если не запущено в Telegram, ставим "Гость"
    const firstName = user?.first_name || "Гость";
    
    // Подставляем имя в приветствие
    greetingEl.textContent = `Добрый день, ${firstName}`;
    
    // Логика перехода между экранами (Сплеш-скрин -> Главный экран)
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        const main = document.getElementById("main-screen");
        
        // Плавное исчезновение сплеш-экрана
        splash.style.opacity = '0';
        
        setTimeout(() => {
            splash.classList.remove("active"); // Убираем из DOM
            main.classList.add("active");      // Показываем главный экран
            
            // Запускаем плавное появление главного экрана
            setTimeout(() => {
                main.style.opacity = '1';
                
                // Настраиваем цвет хедера Telegram под светлый экран
                if(tg.themeParams.secondary_bg_color) {
                    tg.setHeaderColor(tg.themeParams.secondary_bg_color);
                }
            }, 50); 
            
        }, 500); 
        
    }, 2500); 

    // --- 2. ЛОГИКА ФОРМЫ (ОТПРАВКА ДАННЫХ В ЧАТ) ---
    const uploadForm = document.getElementById("uploadForm");
    
    if (uploadForm) {
        uploadForm.addEventListener("submit", (e) => {
            e.preventDefault(); // Предотвращаем стандартную перезагрузку страницы
            
            // Получаем текст из поля ввода
            const descInput = document.getElementById("documentDescription").value;

            // Создаем объект с данными для бота
            const dataToSend = {
                action: "upload_document",
                description: descInput
            };

            // Превращаем объект в строку JSON и отправляем в Telegram
            // ВАЖНО: После вызова этой функции Telegram автоматически закроет Web App!
            tg.sendData(JSON.stringify(dataToSend));
        });
    }
});