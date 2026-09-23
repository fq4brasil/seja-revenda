// ============================================================
// FQ4 - SEJA UMA REVENDA
// ============================================================
// REGRA:
// - Estado = define o distribuidor
// - Cidade = apenas identifica o local do interessado
// - Distribuidor = buscado EXCLUSIVAMENTE em DISTRIBUIDORES_FQ4
// - Cidade NÃO participa da busca do distribuidor
// ============================================================


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycby1ETMZOdPfmGSTYtm0uCtz0rHx2chmsNYxl7y9fDcg5DeKbRGpxTUfJVro87Mv2FfG/exec";

const WHATSAPP_FABRICA = "5519994712833";


// ============================================================
// ELEMENTOS DA PÁGINA
// ============================================================

const campoEstado = document.getElementById("estado");
const campoCidade = document.getElementById("cidade");
const campoWhatsapp = document.getElementById("whatsapp");
const botaoEnviar = document.getElementById("botaoEnviar");
const resultado = document.getElementById("resultado");


// ============================================================
// ESTADOS DO BRASIL
// ============================================================

const estados = [
    { uf: "AC", nome: "Acre" },
    { uf: "AL", nome: "Alagoas" },
    { uf: "AP", nome: "Amapá" },
    { uf: "AM", nome: "Amazonas" },
    { uf: "BA", nome: "Bahia" },
    { uf: "CE", nome: "Ceará" },
    { uf: "DF", nome: "Distrito Federal" },
    { uf: "ES", nome: "Espírito Santo" },
    { uf: "GO", nome: "Goiás" },
    { uf: "MA", nome: "Maranhão" },
    { uf: "MT", nome: "Mato Grosso" },
    { uf: "MS", nome: "Mato Grosso do Sul" },
    { uf: "MG", nome: "Minas Gerais" },
    { uf: "PA", nome: "Pará" },
    { uf: "PB", nome: "Paraíba" },
    { uf: "PR", nome: "Paraná" },
    { uf: "PE", nome: "Pernambuco" },
    { uf: "PI", nome: "Piauí" },
    { uf: "RJ", nome: "Rio de Janeiro" },
    { uf: "RN", nome: "Rio Grande do Norte" },
    { uf: "RS", nome: "Rio Grande do Sul" },
    { uf: "RO", nome: "Rondônia" },
    { uf: "RR", nome: "Roraima" },
    { uf: "SC", nome: "Santa Catarina" },
    { uf: "SP", nome: "São Paulo" },
    { uf: "SE", nome: "Sergipe" },
    { uf: "TO", nome: "Tocantins" }
];


// ============================================================
// NORMALIZAÇÃO DE TEXTO
// ============================================================

function normalizar(texto) {

    return String(texto || "")
        .trim()
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

}


// ============================================================
// CARREGAR ESTADOS
// ============================================================

function carregarEstados() {

    if (!campoEstado) return;

    campoEstado.innerHTML =
        '<option value="">Selecione seu estado</option>';

    estados.forEach(function (estado) {

        const option = document.createElement("option");

        option.value = estado.uf;
        option.textContent =
            estado.nome + " (" + estado.uf + ")";

        campoEstado.appendChild(option);

    });

}


// ============================================================
// CARREGAR CIDADES PELO IBGE
// ============================================================

async function carregarCidades(uf) {

    if (!campoCidade) return;

    campoCidade.disabled = true;

    campoCidade.innerHTML =
        '<option value="">Carregando cidades...</option>';

    if (!uf) {

        campoCidade.innerHTML =
            '<option value="">Primeiro selecione o estado</option>';

        return;

    }

    try {

        const resposta = await fetch(
            "https://servicodados.ibge.gov.br/api/v1/localidades/estados/" +
            encodeURIComponent(uf) +
            "/municipios?orderBy=nome"
        );

        if (!resposta.ok) {
            throw new Error("Erro ao carregar cidades.");
        }

        const cidades = await resposta.json();

        preencherCidades(cidades);

    } catch (erro) {

        console.error("Erro ao carregar cidades:", erro);

        campoCidade.innerHTML =
            '<option value="">Erro ao carregar cidades</option>';

        campoCidade.disabled = true;

    }

}


// ============================================================
// PREENCHER CIDADES
// ============================================================

function preencherCidades(cidades) {

    campoCidade.innerHTML =
        '<option value="">Selecione sua cidade</option>';

    cidades.forEach(function (cidade) {

        const option = document.createElement("option");

        option.value = cidade.nome;
        option.textContent = cidade.nome;

        campoCidade.appendChild(option);

    });

    campoCidade.disabled = false;

}


// ============================================================
// EVENTO - ESTADO
// ============================================================

if (campoEstado) {

    campoEstado.addEventListener("change", function () {

        const uf = this.value;

        carregarCidades(uf);

    });

}


// ============================================================
// MÁSCARA DE WHATSAPP
// ============================================================

if (campoWhatsapp) {

    campoWhatsapp.addEventListener("input", function () {

        let valor = this.value.replace(/\D/g, "");

        if (valor.length > 11) {
            valor = valor.substring(0, 11);
        }

        if (valor.length <= 10) {

            valor = valor.replace(
                /^(\d{2})(\d{4})(\d{0,4}).*/,
                "($1) $2-$3"
            );

        } else {

            valor = valor.replace(
                /^(\d{2})(\d{5})(\d{0,4}).*/,
                "($1) $2-$3"
            );

        }

        this.value = valor;

    });

}


// ============================================================
// LIMPAR TELEFONE
// ============================================================

function limparTelefone(numero) {

    return String(numero || "")
        .replace(/\D/g, "");

}


// ============================================================
// VALIDAR WHATSAPP
// ============================================================

function telefoneValido(numero) {

    const telefone = limparTelefone(numero);

    return telefone.length === 10 ||
           telefone.length === 11;

}


// ============================================================
// CONSULTAR DISTRIBUIDOR
// ============================================================
//
// ATENÇÃO:
//
// Esta função NÃO consulta:
// - REVENDA
// - cidades de distribuidores
// - CSV
//
// Ela consulta exclusivamente:
// DISTRIBUIDORES_FQ4
//
// E utiliza somente o ESTADO.
//
// ============================================================

function buscarDistribuidor(estado, callback) {

    const callbackName =
        "fq4Distribuidor_" + Date.now();

    const script = document.createElement("script");

    const url =
        URL_APPS_SCRIPT +
        "?acao=buscar_distribuidor" +
        "&estado=" + encodeURIComponent(estado) +
        "&callback=" + encodeURIComponent(callbackName);

    window[callbackName] = function (resposta) {

        try {

            callback(resposta);

        } catch (erro) {

            console.error(
                "Erro ao processar resposta do distribuidor:",
                erro
            );

            callback({
                sucesso: false,
                encontrado: false,
                mensagem: "Erro ao processar a consulta."
            });

        } finally {

            delete window[callbackName];

            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }

        }

    };


    script.src = url;


    script.onerror = function () {

        console.error(
            "Não foi possível consultar o Apps Script."
        );

        delete window[callbackName];

        if (script.parentNode) {
            script.parentNode.removeChild(script);
        }

        callback({
            sucesso: false,
            encontrado: false,
            mensagem:
                "Não foi possível consultar o distribuidor."
        });

    };


    document.body.appendChild(script);

}


// ============================================================
// REGISTRAR LEAD
// ============================================================
//
// Os dados são gravados em LEADS_REVENDA.
//
// IMPORTANTE:
// A cidade é registrada aqui,
// mas NÃO é utilizada para localizar o distribuidor.
//
// ============================================================

function registrarLead(
    estado,
    cidade,
    whatsapp,
    destino,
    distribuidor
) {

    const dados = new URLSearchParams();

    dados.append("tipo", "REVENDA");
    dados.append("estado", estado || "");
    dados.append("cidade", cidade || "");
    dados.append("whatsapp", limparTelefone(whatsapp));
    dados.append("destino", destino || "");
    dados.append("distribuidor", distribuidor || "");


    fetch(URL_APPS_SCRIPT, {

        method: "POST",

        body: dados,

        mode: "no-cors"

    }).catch(function (erro) {

        console.error(
            "Erro ao registrar lead:",
            erro
        );

    });

}


// ============================================================
// MOSTRAR CARREGANDO
// ============================================================

function mostrarCarregando() {

    if (!resultado) return;

    resultado.innerHTML = `
        <div class="resultado-card carregando">

            <div class="spinner"></div>

            <h3>LOCALIZANDO ATENDIMENTO</h3>

            <p>
                Estamos encontrando o responsável
                pelo atendimento da sua região.
            </p>

        </div>
    `;

    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// MOSTRAR DISTRIBUIDOR
// ============================================================

function mostrarDistribuidor(
    nome,
    whatsapp
) {

    if (!resultado) return;

    const telefone = limparTelefone(whatsapp);

    let linkWhatsapp = "";

    if (telefone) {

        linkWhatsapp =
            "https://wa.me/" +
            telefone +
            "?text=" +
            encodeURIComponent(
                "Olá! Tenho interesse em ser uma Revenda FQ4 e gostaria de conhecer as condições para trabalhar com a FQ4."
            );

    }


    resultado.innerHTML = `

        <div class="resultado-card sucesso">

            <span class="resultado-tag">
                DISTRIBUIDOR FQ4
            </span>

            <h3>
                Encontramos o responsável
                pelo seu estado!
            </h3>

            <p class="resultado-descricao">
                Sua empresa será atendida pelo
                distribuidor FQ4 responsável
                pela sua região.
            </p>

            <div class="distribuidor-box">

                <strong>
                    ${escaparHTML(nome)}
                </strong>

            </div>

            ${
                linkWhatsapp
                ?
                `
                <a
                    href="${linkWhatsapp}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="botao-whatsapp"
                >
                    FALAR COM DISTRIBUIDOR
                </a>
                `
                :
                `
                <p class="mensagem-erro">
                    O WhatsApp do distribuidor
                    não está cadastrado.
                </p>
                `
            }

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// MOSTRAR FÁBRICA
// ============================================================

function mostrarFabrica() {

    if (!resultado) return;

    const linkWhatsapp =
        "https://wa.me/" +
        WHATSAPP_FABRICA +
        "?text=" +
        encodeURIComponent(
            "Olá! Tenho interesse em ser uma Revenda FQ4 e gostaria de saber como posso trabalhar com a FQ4."
        );


    resultado.innerHTML = `

        <div class="resultado-card fabrica">

            <span class="resultado-tag">
                FALE COM A FQ4
            </span>

            <h3>
                Vamos falar sobre sua empresa?
            </h3>

            <p class="resultado-descricao">
                Ainda não identificamos um
                distribuidor cadastrado para
                o seu estado.
            </p>

            <p class="resultado-descricao">
                Fale diretamente com a equipe
                comercial da FQ4.
            </p>

            <a
                href="${linkWhatsapp}"
                target="_blank"
                rel="noopener noreferrer"
                class="botao-whatsapp"
            >
                FALAR COM A FQ4
            </a>

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// MOSTRAR ERRO
// ============================================================

function mostrarErro(mensagem) {

    if (!resultado) return;

    resultado.innerHTML = `

        <div class="resultado-card erro">

            <span class="resultado-tag">
                ATENÇÃO
            </span>

            <h3>
                Não foi possível concluir a consulta.
            </h3>

            <p class="resultado-descricao">
                ${
                    mensagem ||
                    "Tente novamente em alguns instantes."
                }
            </p>

            <button
                type="button"
                class="botao-principal"
                onclick="window.location.reload()"
            >
                TENTAR NOVAMENTE
            </button>

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ============================================================
// ESCAPAR HTML
// ============================================================
//
// Evita que nomes vindos da planilha sejam interpretados
// como código HTML na página.
// ============================================================

function escaparHTML(valor) {

    return String(valor || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ============================================================
// ENVIO DO FORMULÁRIO
// ============================================================

if (botaoEnviar) {

    botaoEnviar.addEventListener(
        "click",
        function () {

            const estado =
                campoEstado
                    ? campoEstado.value
                    : "";

            const cidade =
                campoCidade
                    ? campoCidade.value
                    : "";

            const whatsapp =
                campoWhatsapp
                    ? campoWhatsapp.value
                    : "";


            // -----------------------------------------------
            // VALIDAÇÕES
            // -----------------------------------------------

            if (!estado) {

                alert(
                    "Selecione o seu estado."
                );

                campoEstado.focus();

                return;

            }


            if (!cidade) {

                alert(
                    "Selecione a sua cidade."
                );

                campoCidade.focus();

                return;

            }


            if (!telefoneValido(whatsapp)) {

                alert(
                    "Informe um WhatsApp válido."
                );

                campoWhatsapp.focus();

                return;

            }


            // -----------------------------------------------
            // BLOQUEAR BOTÃO
            // -----------------------------------------------

            botaoEnviar.disabled = true;

            botaoEnviar.dataset.textoOriginal =
                botaoEnviar.textContent;

            botaoEnviar.textContent =
                "LOCALIZANDO...";


            // -----------------------------------------------
            // MOSTRAR CARREGAMENTO
            // -----------------------------------------------

            mostrarCarregando();


            // -----------------------------------------------
            // BUSCAR DISTRIBUIDOR
            // -----------------------------------------------
            //
            // SOMENTE PELO ESTADO.
            //
            // A CIDADE NÃO É ENVIADA PARA A CONSULTA.
            //
            // -----------------------------------------------

            buscarDistribuidor(
                estado,
                function (resposta) {

                    // ---------------------------------------
                    // DISTRIBUIDOR ENCONTRADO
                    // ---------------------------------------

                    if (
                        resposta &&
                        resposta.sucesso &&
                        resposta.encontrado &&
                        resposta.distribuidor
                    ) {

                        const distribuidor =
                            resposta.distribuidor;


                        // Registrar lead
                        registrarLead(
                            estado,
                            cidade,
                            whatsapp,
                            "DISTRIBUIDOR",
                            distribuidor.nome
                        );


                        // Mostrar resultado
                        mostrarDistribuidor(
                            distribuidor.nome,
                            distribuidor.whatsapp
                        );


                    }

                    // ---------------------------------------
                    // NÃO ENCONTROU DISTRIBUIDOR
                    // ---------------------------------------

                    else if (
                        resposta &&
                        resposta.sucesso &&
                        !resposta.encontrado
                    ) {

                        // Registrar lead
                        registrarLead(
                            estado,
                            cidade,
                            whatsapp,
                            "FQ4",
                            ""
                        );


                        // Direcionar para fábrica
                        mostrarFabrica();

                    }

                    // ---------------------------------------
                    // ERRO NA CONSULTA
                    // ---------------------------------------

                    else {

                        console.error(
                            "Resposta do Apps Script:",
                            resposta
                        );


                        // Mesmo em caso de erro técnico,
                        // não vamos mandar o usuário para
                        // uma revenda.
                        //
                        // A alternativa é falar diretamente
                        // com a FQ4.

                        registrarLead(
                            estado,
                            cidade,
                            whatsapp,
                            "FQ4",
                            ""
                        );


                        mostrarFabrica();

                    }


                    // ---------------------------------------
                    // LIBERAR BOTÃO
                    // ---------------------------------------

                    botaoEnviar.disabled = false;

                    botaoEnviar.textContent =
                        botaoEnviar.dataset.textoOriginal ||
                        "QUERO SER REVENDA FQ4";

                }
            );

        }
    );

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

carregarEstados();


// ============================================================
// FINAL
// ============================================================
