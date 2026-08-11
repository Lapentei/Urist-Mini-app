// Инициализация Telegram Web Apps API
const tg = window.Telegram.WebApp;

// Разворачиваем приложение на весь экран
tg.expand();

// Уведомляем Telegram, что приложение готово к отображению
tg.ready();

document.addEventListener("DOMContentLoaded", () => {
    const greetingEl = document.getElementById("greeting");
    
    // Получаем данные о пользователе из объекта Telegram
    const user = tg.initDataUnsafe?.user;
    
    // Берем имя пользователя. Если не запущено в Telegram, ставим "Гость"
    const firstName = user?.first_name || "Гость";
    
    // Подставляем имя в приветствие
    greetingEl.textContent = `Добрый день, ${firstName}`;
    
    // Логика перехода между экранами
    // Ждем 2.5 секунды (показываем сплеш-скрин), затем переключаем на главный экран
    setTimeout(() => {
        const splash = document.getElementById("splash-screen");
        const main = document.getElementById("main-screen");
        
        // Плавное исчезновение
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
            
        }, 500); // Время, равное transition в CSS (0.5s)
        
    }, 2500); 
});
