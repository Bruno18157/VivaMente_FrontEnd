/* Formulário de contato (público — funciona sem login).
   Envia para o Back-end em POST /contato { nome, email, mensagem }.
   Se o servidor estiver indisponível e window.VM_EMAIL_CONTATO estiver definido,
   abre o e-mail do usuário já preenchido como alternativa. */
(function () {
    const form = document.getElementById("contatoForm");
    if (!form) return;
    const aviso = document.getElementById("contato-aviso");
    const botao = document.getElementById("contato-btn");

    function mostrar(msg, ok) {
        aviso.textContent = msg;
        aviso.className = "contato-aviso " + (ok ? "ok" : "erro");
        aviso.hidden = false;
    }

    form.addEventListener("submit", async e => {
        e.preventDefault();
        const nome = form.nome.value.trim();
        const email = form.email.value.trim();
        const mensagem = form.mensagem.value.trim();

        if (!nome || !email || !mensagem) return mostrar("Preencha todos os campos.", false);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return mostrar("Informe um e-mail válido.", false);

        botao.disabled = true;
        botao.textContent = "Enviando...";
        try {
            await api("/contato", { metodo: "POST", corpo: { nome, email, mensagem }, semAuth: true });
            form.reset();
            mostrar("Mensagem enviada! Responderemos no e-mail informado.", true);
        } catch (err) {
            if (window.VM_EMAIL_CONTATO) {
                const corpo = `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`;
                window.location.href = `mailto:${window.VM_EMAIL_CONTATO}?subject=${encodeURIComponent("Contato pelo site VivaMente")}&body=${encodeURIComponent(corpo)}`;
                mostrar("Abrimos seu aplicativo de e-mail para finalizar o envio.", true);
            } else {
                mostrar(err.message, false);
            }
        } finally {
            botao.disabled = false;
            botao.textContent = "Enviar mensagem";
        }
    });
})();
