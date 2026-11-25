let modoCadastro = false;

const abaEntrar = document.getElementById("aba-entrar");
const abaCadastro = document.getElementById("aba-cadastro");
const grupoTipo = document.getElementById("grupo-tipo");
const campoNome = document.getElementById("campo-nome");
const erroBox = document.getElementById("login-erro");
const botao = document.getElementById("btn-login");

function definirModo(cadastro) {
    modoCadastro = cadastro;
    abaEntrar.classList.toggle("ativa", !cadastro);
    abaCadastro.classList.toggle("ativa", cadastro);
    grupoTipo.hidden = cadastro;
    campoNome.hidden = !cadastro;
    document.getElementById("login-titulo").textContent = cadastro ? "Criar conta" : "Entrar";
    document.getElementById("login-subtitulo").textContent = cadastro
        ? "Cadastre-se como psicólogo(a) para acompanhar seus pacientes."
        : "Acesse sua conta para acompanhar suas tarefas e conquistas.";
    document.getElementById("login-ajuda").hidden = cadastro;
    botao.textContent = cadastro ? "Criar conta e entrar" : "Entrar";
    erroBox.hidden = true;
}

abaEntrar.addEventListener("click", () => definirModo(false));
abaCadastro.addEventListener("click", () => definirModo(true));

function mostrarErro(msg) {
    erroBox.textContent = msg;
    erroBox.hidden = false;
}

async function entrar(email, senha, tipo) {
    const r = await api("/auth/login", {
        metodo: "POST",
        corpo: { email, senha, tipo },
        semAuth: true
    });
    Sessao.salvar(r.token, r.usuario);
    window.location.href = "tarefas.html";
}

document.getElementById("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    erroBox.hidden = true;

    const email = document.getElementById("login-email").value.trim();
    const senha = document.getElementById("login-senha").value;
    const nome = document.getElementById("login-nome").value.trim();
    const tipo = document.querySelector('input[name="tipo"]:checked').value;

    if (!email || !senha || (modoCadastro && !nome)) {
        return mostrarErro("Preencha todos os campos.");
    }

    botao.disabled = true;
    try {
        if (modoCadastro) {
            await api("/psicologo/cadastrar", {
                metodo: "POST",
                corpo: { nome, email, senha },
                semAuth: true
            });
            await entrar(email, senha, "psicologo");
        } else {
            await entrar(email, senha, tipo);
        }
    } catch (err) {
        mostrarErro(err.message);
        botao.disabled = false;
    }
});

if (new URLSearchParams(location.search).get("expirou")) {
    mostrarErro("Sua sessão expirou. Entre novamente.");
} else if (Sessao.token && Sessao.usuario) {
    window.location.href = "tarefas.html";
}
