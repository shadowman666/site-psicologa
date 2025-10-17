document.addEventListener('DOMContentLoaded', () => {

    // --- Parte de Login (sem alterações) ---
    const loginForm = document.getElementById('loginForm');
    const loginContainer = document.getElementById('login-container');
    const gameDashboard = document.getElementById('game-dashboard');
    const logoutButton = document.getElementById('logoutButton');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Adiciona uma classe para a animação de saída
        loginContainer.querySelector('.card').style.animation = 'fadeOutUp 0.5s ease-out forwards';
        // Aguarda a animação terminar para trocar de tela
        setTimeout(() => {
            loginContainer.classList.add('hidden');
            gameDashboard.classList.remove('hidden');
        }, 500); // 500ms é a duração da animação
    });

    logoutButton.addEventListener('click', () => {
        gameDashboard.querySelector('.card').style.animation = 'fadeOutUp 0.5s ease-out forwards';
        setTimeout(() => {
            gameDashboard.classList.add('hidden');
            loginContainer.classList.remove('hidden');
            // Reseta a animação de entrada do card de login
            loginContainer.querySelector('.card').style.animation = 'fadeInUp 0.5s ease-out forwards';
            loginForm.reset();
        }, 500);
    });
    
    // --- LÓGICA DO JOGO ROLETA DAS EMOÇÕES (COM A CORREÇÃO) ---

    const canvas = document.getElementById('emotion-wheel');
    const spinButton = document.getElementById('spin-button');
    const resultDisplay = document.getElementById('result-display');
    const spinningAudio = document.getElementById('spinning-audio');
    const tadaAudio = document.getElementById('tada-audio');
    const ctx = canvas.getContext('2d');

    const segments = [
        { text: 'Alegria', color: '#f1c40f' },
        { text: 'Tristeza', color: '#3498db' },
        { text: 'Raiva', color: '#e74c3c' },
        { text: 'Medo', color: '#9b59b6' },
        { text: 'Surpresa', color: '#2ecc71' },
        { text: 'Nojo', color: '#7f8c8d' }
    ];

    const numSegments = segments.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;
    
    // VARIÁVEL-CHAVE PARA A CORREÇÃO: Define o início do desenho no topo (-90 graus)
    const startAngleOffset = -Math.PI / 2; 

    let currentRotation = 0; // Usaremos para a rotação via CSS
    let isSpinning = false;

    const drawWheel = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.font = '16px Poppins';
        
        segments.forEach((segment, i) => {
            const angle = i * arcSize;
            
            ctx.beginPath();
            ctx.fillStyle = segment.color;
            ctx.moveTo(centerX, centerY);
            // AQUI ESTÁ A CORREÇÃO: Adicionamos o 'startAngleOffset' ao desenhar
            ctx.arc(centerX, centerY, radius, startAngleOffset + angle, startAngleOffset + angle + arcSize);
            ctx.lineTo(centerX, centerY);
            ctx.fill();
            ctx.stroke();

            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.translate(centerX, centerY);
            // E aqui também, para alinhar o texto
            ctx.rotate(startAngleOffset + angle + arcSize / 2);
            ctx.textAlign = "right";
            ctx.fillText(segment.text, radius - 10, 5);
            ctx.restore();
        });
    };

    const spin = () => {
        if (isSpinning) return;
        isSpinning = true;
        resultDisplay.textContent = '';
        
        spinningAudio.currentTime = 0;
        spinningAudio.play();
        
        // Sorteia um ângulo final
        const randomSpin = Math.random() * 360;
        const totalSpin = 360 * 5 + randomSpin; // Gira pelo menos 5 vezes
        const newRotation = currentRotation + totalSpin;

        canvas.style.transition = 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)';
        canvas.style.transform = `rotate(${newRotation}deg)`;

        currentRotation = newRotation;

        setTimeout(() => {
            isSpinning = false;
            spinningAudio.pause();
            tadaAudio.play();

            // CÁLCULO CORRIGIDO: Agora o cálculo bate com o visual
            const finalAngle = currentRotation % 360;
            const degreesPerSegment = 360 / numSegments;
            const winningIndex = Math.floor((360 - finalAngle) / degreesPerSegment) % numSegments;
            
            const winningSegment = segments[winningIndex];
            resultDisplay.textContent = `${winningSegment.text}`;
            
            canvas.style.transition = 'none'; // Reseta para o próximo giro
        }, 5000); // Mesma duração da animação CSS
    };
    
    spinButton.addEventListener('click', spin);

    // Adiciona uma animação de fade-out/fade-in para o logout e login, usando uma nova classe de animação
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            @keyframes fadeOutUp {
                from { opacity: 1; transform: translateY(0); }
                to { opacity: 0; transform: translateY(-20px); }
            }
        </style>
    `);

    drawWheel();
});