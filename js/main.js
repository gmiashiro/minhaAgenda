document.addEventListener('DOMContentLoaded', () => {
    
    // Verificamos em qual página estamos
    const isCalendarPage = document.getElementById('calendarDays');
    const isNotePage = document.getElementById('noteArea');

    if (isCalendarPage) {
        initCalendar();
    }

    if (isNotePage) {
        initNotes();
    }
});

/**
 * LÓGICA DO CALENDÁRIO
 */
let currentDate = new Date();

function initCalendar() {
    const monthYearText = document.getElementById('monthYear');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    renderCalendar(currentDate);

    prevBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar(currentDate);
    });

    nextBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar(currentDate);
    });
}

function renderCalendar(date) {
    const calendarDays = document.getElementById('calendarDays');
    const monthYearText = document.getElementById('monthYear');
    
    // Limpa o grid
    calendarDays.innerHTML = '';

    const year = date.getFullYear();
    const month = date.getMonth();

    // Nome do Mês e Ano (Ex: Novembro 2023)
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    monthYearText.innerText = `${monthNames[month]} ${year}`;

    // Primeiro dia do mês e total de dias
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();

    // Dias em branco antes do dia 1
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day-cell', 'empty');
        calendarDays.appendChild(emptyDiv);
    }

    // Dias do mês
    const today = new Date();
    
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.innerText = i;
        dayDiv.classList.add('day-cell');

        // Formata a chave para checar se existe nota (dd-mm-aaaa)
        const dateKey = `${String(i).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;

        // Verifica se é hoje
        if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        // Verifica se já tem anotação salva no localStorage
        if (localStorage.getItem(`note_${dateKey}`)) {
            dayDiv.classList.add('has-note');
        }

        // Clique direciona para a página de notas
        dayDiv.addEventListener('click', () => {
            window.location.href = `notes.html?date=${dateKey}`;
        });

        calendarDays.appendChild(dayDiv);
    }
}

/**
 * LÓGICA DAS ANOTAÇÕES
 */
function initNotes() {
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date'); // Formato: dd-mm-aaaa
    const noteArea = document.getElementById('noteArea');
    const dateDisplay = document.getElementById('noteDateDisplay');
    const saveStatus = document.getElementById('saveStatus');

    if (!dateParam) {
        alert("Data não selecionada!");
        window.location.href = 'index.html';
        return;
    }

    // Formatação amigável da data para o cabeçalho
    const [day, month, year] = dateParam.split('-');
    const dateObj = new Date(year, month - 1, day);
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    dateDisplay.innerText = dateObj.toLocaleDateString('pt-BR', options);

    // Carregar nota existente
    const storageKey = `note_${dateParam}`;
    const savedNote = localStorage.getItem(storageKey);
    
    if (savedNote) {
        noteArea.value = savedNote;
    }

    // Auto-save com debounce (para não salvar a cada tecla freneticamente)
    let timeoutId;
    noteArea.addEventListener('input', () => {
        saveStatus.innerText = "Salvando...";
        saveStatus.style.opacity = 1;

        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            const content = noteArea.value;
            
            if (content.trim() === "") {
                localStorage.removeItem(storageKey); // Remove se estiver vazio
            } else {
                localStorage.setItem(storageKey, content);
            }
            
            saveStatus.innerText = "Salvo com sucesso ✨";
            
            // Esconde msg após 2s
            setTimeout(() => {
                saveStatus.style.opacity = 0.5;
            }, 2000);

        }, 800); // Salva 800ms após parar de digitar
    });
}