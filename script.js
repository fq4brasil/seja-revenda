// ======================================================
// FQ4 - SEJA UMA REVENDA
// SCRIPT.JS
// ======================================================


// ======================================================
// CONFIGURAÇÕES
// ======================================================


// URL DA ABA DISTRIBUIDORES_FQ4
//
// IMPORTANTE:
// Depois que a aba estiver criada e publicada,
// substitua esta URL pela URL CSV correta da aba.
//

const URL_DISTRIBUIDORES =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSnU51Kz93Aij3mNKNvOmzEI_z50xQSWvuf-09_J-UDucrpOwpfLEkdNkegnyO8vJ5VeSmXYRx_JyxL/pub?output=csv";


// ======================================================
// GOOGLE APPS SCRIPT - CAPTURA DE LEADS
// ======================================================

const URL_LEADS =
    "https://script.google.com/macros/s/AKfycby1ETMZOdPfmGSTYtm0uCtz0rHx2chmsNYxl7y9fDcg5DeKbRGpxTUfJVro87Mv2FfG/exec";


// ======================================================
// WHATSAPP DA FÁBRICA FQ4
// ======================================================

const WHATSAPP_FABRICA =
    "5519994712833";


// ======================================================
// API IBGE
// ======================================================

const URL_IBGE =
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados";


// ======================================================
// ELEMENTOS DA PÁGINA
// ======================================================

const estadoSelect =
    document.getElementById("estado");

const cidadeSelect =
    document.getElementById("cidade");

const whatsappInput =
    document.getElementById("whatsapp");

const botaoEnviar =
    document.getElementById("botaoEnviar");

const resultado =
    document.getElementById("resultado");


// ======================================================
// LISTA DE ESTADOS
// ======================================================

const estados = [

    ["AC", "Acre"],
    ["AL", "Alagoas"],
    ["AP", "Amapá"],
    ["AM", "Amazonas"],
    ["BA", "Bahia"],
    ["CE", "Ceará"],
    ["DF", "Distrito Federal"],
    ["ES", "Espírito Santo"],
    ["GO", "Goiás"],
    ["MA", "Maranhão"],
    ["MT", "Mato Grosso"],
    ["MS", "Mato Grosso do Sul"],
    ["MG", "Minas Gerais"],
    ["PA", "Pará"],
    ["PB", "Paraíba"],
    ["PR", "Paraná"],
    ["PE", "Pernambuco"],
    ["PI", "Piauí"],
    ["RJ", "Rio de Janeiro"],
    ["RN", "Rio Grande do Norte"],
    ["RS", "Rio Grande do Sul"],
    ["RO", "Rondônia"],
    ["RR", "Roraima"],
    ["SC", "Santa Catarina"],
    ["SP", "São Paulo"],
    ["SE", "Sergipe"],
    ["TO", "Tocantins"]

];


let cidades = {};


// ======================================================
// NORMALIZAÇÃO
// ======================================================

function normalizar(texto) {

    return String(texto || "")
        .replace(/^\uFEFF/, "")
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .toUpperCase();

}


// ======================================================
// CARREGAR ESTADOS
// ======================================================

function carregarEstados() {

    estados.forEach(
        ([sigla, nome]) => {

            const option =
                document.createElement("option");

            option.value =
                sigla;

            option.textContent =
                `${nome} (${sigla})`;

            estadoSelect.appendChild(
                option
            );

        }
    );

}


// ======================================================
// CARREGAR CIDADES
// ======================================================

async function carregarCidades(
    uf
) {

    cidadeSelect.innerHTML =
        '<option value="">Carregando cidades...</option>';

    cidadeSelect.disabled =
        true;


    if (
        cidades[uf]
    ) {

        preencherCidades(
            cidades[uf]
        );

        return;

    }


    try {

        const resposta =
            await fetch(
                `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
            );


        if (
            !resposta.ok
        ) {

            throw new Error(
                "Erro ao consultar cidades."
            );

        }


        const dados =
            await resposta.json();


        cidades[uf] =
            dados
                .map(
                    item =>
                        item.nome
                )
                .sort(
                    (a, b) =>
                        a.localeCompare(
                            b,
                            "pt-BR"
                        )
                );


        preencherCidades(
            cidades[uf]
        );

    }

    catch (erro) {

        console.error(
            "Erro ao carregar cidades:",
            erro
        );


        cidadeSelect.innerHTML =
            '<option value="">Erro ao carregar cidades</option>';

        cidadeSelect.disabled =
            true;

    }

}


// ======================================================
// PREENCHER CIDADES
// ======================================================

function preencherCidades(
    lista
) {

    cidadeSelect.innerHTML =
        '<option value="">Selecione sua cidade</option>';


    lista.forEach(
        cidade => {

            const option =
                document.createElement("option");

            option.value =
                cidade;

            option.textContent =
                cidade;

            cidadeSelect.appendChild(
                option
            );

        }
    );


    cidadeSelect.disabled =
        false;

}


// ======================================================
// EVENTO ESTADO
// ======================================================

estadoSelect.addEventListener(
    "change",
    async function() {

        resultado.innerHTML =
            "";


        cidadeSelect.innerHTML =
            '<option value="">Selecione sua cidade</option>';

        cidadeSelect.disabled =
            true;


        if (
            !this.value
        ) {

            cidadeSelect.innerHTML =
                '<option value="">Primeiro selecione o estado</option>';

            return;

        }


        await carregarCidades(
            this.value
        );

    }
);


// ======================================================
// MÁSCARA WHATSAPP
// ======================================================

whatsappInput.addEventListener(
    "input",
    function() {

        let valor =
            this.value.replace(
                /\D/g,
                ""
            );


        if (
            valor.length > 11
        ) {

            valor =
                valor.substring(
                    0,
                    11
                );

        }


        if (
            valor.length <= 10
        ) {

            valor =
                valor.replace(
                    /^(\d{2})(\d)/,
                    "($1) $2"
                );

            valor =
                valor.replace(
                    /(\d{4})(\d)/,
                    "$1-$2"
                );

        }

        else {

            valor =
                valor.replace(
                    /^(\d{2})(\d)/,
                    "($1) $2"
                );

            valor =
                valor.replace(
                    /(\d{5})(\d)/,
                    "$1-$2"
                );

        }


        this.value =
            valor;

    }
);


// ======================================================
// PEGAR NÚMERO LIMPO DO WHATSAPP
// ======================================================

function limparTelefone(
    telefone
) {

    let numero =
        String(
            telefone || ""
        ).replace(
            /\D/g,
            ""
        );


    if (
        numero.startsWith("55")
    ) {

        return numero;

    }


    return "55" + numero;

}


// ======================================================
// VALIDAR WHATSAPP
// ======================================================

function telefoneValido(
    telefone
) {

    const numero =
        String(
            telefone || ""
        ).replace(
            /\D/g,
            ""
        );


    return (
        numero.length === 10 ||
        numero.length === 11
    );

}


// ======================================================
// LEITURA DE CSV
// ======================================================

function parseCSV(
    texto
) {

    const linhas = [];

    let linha = [];

    let campoAtual = "";

    let dentroAspas = false;


    for (
        let i = 0;
        i < texto.length;
        i++
    ) {

        const caractere =
            texto[i];

        const proximo =
            texto[i + 1];


        if (
            caractere === '"' &&
            dentroAspas &&
            proximo === '"'
        ) {

            campoAtual += '"';

            i++;

        }


        else if (
            caractere === '"'
        ) {

            dentroAspas =
                !dentroAspas;

        }


        else if (
            caractere === "," &&
            !dentroAspas
        ) {

            linha.push(
                campoAtual
            );

            campoAtual =
                "";

        }


        else if (
            (
                caractere === "\n" ||
                caractere === "\r"
            ) &&
            !dentroAspas
        ) {

            if (
                caractere === "\r" &&
                proximo === "\n"
            ) {

                i++;

            }


            linha.push(
                campoAtual
            );

            campoAtual =
                "";


            if (
                linha.some(
                    valor =>
                        valor.trim() !== ""
                )
            ) {

                linhas.push(
                    linha
                );

            }


            linha = [];

        }


        else {

            campoAtual +=
                caractere;

        }

    }


    if (
        campoAtual !== "" ||
        linha.length > 0
    ) {

        linha.push(
            campoAtual
        );


        if (
            linha.some(
                valor =>
                    valor.trim() !== ""
            )
        ) {

            linhas.push(
                linha
            );

        }

    }


    return linhas;

}


// ======================================================
// CONVERTER CSV
// ======================================================

function converterCSV(
    texto
) {

    const linhas =
        parseCSV(
            texto
        );


    if (
        !linhas.length
    ) {

        return [];

    }


    const cabecalho =
        linhas[0].map(
            coluna =>
                normalizar(
                    coluna
                )
        );


    console.log(
        "CABEÇALHO DISTRIBUIDORES:",
        cabecalho
    );


    return linhas
        .slice(1)
        .map(
            linha => {

                const registro =
                    {};


                cabecalho.forEach(
                    (
                        coluna,
                        indice
                    ) => {

                        registro[coluna] =
                            (
                                linha[indice] ||
                                ""
                            ).trim();

                    }
                );


                return registro;

            }
        );

}


// ======================================================
// CARREGAR CSV
// ======================================================

async function carregarCSV(
    url
) {

    try {

        const resposta =
            await fetch(
                `${url}&_=${Date.now()}`
            );


        if (
            !resposta.ok
        ) {

            throw new Error(
                "Não foi possível acessar a planilha."
            );

        }


        const texto =
            await resposta.text();


        console.log(
            "CSV DISTRIBUIDORES:",
            texto.substring(
                0,
                500
            )
        );


        return converterCSV(
            texto
        );

    }

    catch (erro) {

        console.error(
            "ERRO AO CARREGAR DISTRIBUIDORES:",
            erro
        );


        return [];

    }

}


// ======================================================
// LOCALIZAR CAMPO
// ======================================================

function campo(
    registro,
    nomes
) {

    for (
        const nome of nomes
    ) {

        const chave =
            normalizar(
                nome
            );


        if (
            Object.prototype.hasOwnProperty.call(
                registro,
                chave
            )
        ) {

            return registro[chave];

        }

    }


    return "";

}


// ======================================================
// VERIFICAR ESTADO
// ======================================================

function estadoCorresponde(
    valor,
    uf
) {

    const valorNormalizado =
        normalizar(
            valor
        );


    const estado =
        estados.find(
            item =>
                item[0] === uf
        );


    if (
        !estado
    ) {

        return false;

    }


    const sigla =
        normalizar(
            estado[0]
        );


    const nome =
        normalizar(
            estado[1]
        );


    return (

        valorNormalizado ===
        sigla

        ||

        valorNormalizado ===
        nome

    );

}


// ======================================================
// BUSCAR DISTRIBUIDOR
// ======================================================

async function buscarDistribuidor(
    estado,
    cidade
) {

    console.log(
        "================================="
    );

    console.log(
        "BUSCANDO DISTRIBUIDOR"
    );

    console.log(
        "ESTADO:",
        estado
    );

    console.log(
        "CIDADE:",
        cidade
    );

    console.log(
        "URL:",
        URL_DISTRIBUIDORES
    );

    console.log(
        "================================="
    );


    try {

        const registros =
            await carregarCSV(
                URL_DISTRIBUIDORES
            );


        console.log(
            "TOTAL DE REGISTROS:",
            registros.length
        );


        const encontrados =
            registros.filter(
                registro => {

                    const status =
                        campo(
                            registro,
                            [
                                "STATUS"
                            ]
                        );


                    const estadoPlanilha =
                        campo(
                            registro,
                            [
                                "ESTADO",
                                "UF"
                            ]
                        );


                    const cidadePlanilha =
                        campo(
                            registro,
                            [
                                "CIDADE",
                                "MUNICIPIO",
                                "MUNICÍPIO"
                            ]
                        );


                    console.log(
                        "ANALISANDO DISTRIBUIDOR:",
                        registro
                    );


                    return (

                        normalizar(
                            status
                        ) ===
                        "ATIVO"

                        &&

                        estadoCorresponde(
                            estadoPlanilha,
                            estado
                        )

                        &&

                        normalizar(
                            cidadePlanilha
                        ) ===
                        normalizar(
                            cidade
                        )

                    );

                }
            );


        console.log(
            "DISTRIBUIDORES ENCONTRADOS:",
            encontrados
        );


        return encontrados;

    }

    catch (erro) {

        console.error(
            "ERRO AO BUSCAR DISTRIBUIDOR:",
            erro
        );


        return [];

    }

}


// ======================================================
// REGISTRAR LEAD
// ======================================================

async function registrarLead(
    dados
) {

    try {

        const formulario =
            new URLSearchParams();


        formulario.append(
            "tipo",
            "REVENDA"
        );


        formulario.append(
            "estado",
            dados.estado || ""
        );


        formulario.append(
            "cidade",
            dados.cidade || ""
        );


        formulario.append(
            "whatsapp",
            dados.whatsapp || ""
        );


        formulario.append(
            "destino",
            dados.destino || ""
        );


        formulario.append(
            "distribuidor",
            dados.distribuidor || ""
        );


        await fetch(
            URL_LEADS,
            {

                method:
                    "POST",

                mode:
                    "no-cors",

                headers: {

                    "Content-Type":
                        "application/x-www-form-urlencoded"

                },

                body:
                    formulario.toString()

            }
        );


        console.log(
            "LEAD DE REVENDA REGISTRADO:",
            dados
        );

    }

    catch (erro) {

        console.error(
            "ERRO AO REGISTRAR LEAD:",
            erro
        );

    }

}


// ======================================================
// MOSTRAR DISTRIBUIDOR
// ======================================================

function mostrarDistribuidor(
    distribuidor,
    estado,
    cidade,
    telefoneLead
) {

    const nome =
        campo(
            distribuidor,
            [
                "DISTRIBUIDOR"
            ]
        ) ||
        "Distribuidor FQ4";


    const telefone =
        campo(
            distribuidor,
            [
                "WHATSAPP",
                "TELEFONE"
            ]
        );


    const numero =
        limparTelefone(
            telefone
        );


    const mensagem =
        `Olá! Tenho interesse em ser uma Revenda FQ4.

Vim através do anúncio da FQ4.

Estado: ${estado}
Cidade: ${cidade}

Meu WhatsApp:
${telefoneLead}

Gostaria de conhecer as condições para trabalhar com a FQ4.`;


    const whatsapp =
        `https://wa.me/${numero}?text=${encodeURIComponent(
            mensagem
        )}`;


    resultado.innerHTML = `

        <div class="resultado-card">

            <h2>
                Encontramos um distribuidor FQ4!
            </h2>

            <p>
                Identificamos um distribuidor
                que atende sua região.
            </p>

            <h3>
                ${nome}
            </h3>

            <p>
                Fale diretamente com o distribuidor
                para conhecer as condições para
                trabalhar com a FQ4.
            </p>

            <a
                href="${whatsapp}"
                target="_blank"
                rel="noopener noreferrer"
                class="botao-resultado botao-whatsapp"
            >
                FALAR COM DISTRIBUIDOR
            </a>

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ======================================================
// MOSTRAR FÁBRICA
// ======================================================

function mostrarFabrica(
    estado,
    cidade,
    telefoneLead
) {

    const mensagem =
        `Olá! Tenho interesse em ser uma Revenda FQ4.

Vim através do anúncio da FQ4.

Estado: ${estado}
Cidade: ${cidade}

Meu WhatsApp:
${telefoneLead}

Gostaria de conhecer as condições para trabalhar com a FQ4.`;


    const whatsapp =
        `https://wa.me/${WHATSAPP_FABRICA}?text=${encodeURIComponent(
            mensagem
        )}`;


    resultado.innerHTML = `

        <div class="resultado-card">

            <h2>
                Vamos conversar!
            </h2>

            <p>
                Recebemos seu interesse em
                trabalhar com a FQ4.
            </p>

            <p>
                No momento, não identificamos
                um distribuidor cadastrado
                para sua região.
            </p>

            <p>
                Fale diretamente com nossa
                equipe comercial.
            </p>

            <a
                href="${whatsapp}"
                target="_blank"
                rel="noopener noreferrer"
                class="botao-resultado botao-whatsapp"
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


// ======================================================
// MOSTRAR CARREGANDO
// ======================================================

function mostrarCarregando() {

    resultado.innerHTML = `

        <div class="resultado-card loading">

            <div class="loading-spinner"></div>

            <h2>
                Só um momento...
            </h2>

            <p>
                Estamos verificando quem atende
                sua região.
            </p>

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ======================================================
// MOSTRAR ERRO
// ======================================================

function mostrarErro(
    mensagem
) {

    resultado.innerHTML = `

        <div class="resultado-card">

            <h2>
                Não conseguimos concluir
                a consulta.
            </h2>

            <div class="mensagem-erro">
                ${mensagem}
            </div>

            <p>
                Tente novamente em alguns instantes.
            </p>

        </div>

    `;


    resultado.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ======================================================
// CLIQUE NO BOTÃO
// ======================================================

botaoEnviar.addEventListener(
    "click",
    async function() {

        const estado =
            estadoSelect.value;


        const cidade =
            cidadeSelect.value;


        const telefone =
            whatsappInput.value;


        // ==============================================
        // VALIDAR ESTADO
        // ==============================================

        if (
            !estado
        ) {

            alert(
                "Selecione seu estado."
            );

            estadoSelect.focus();

            return;

        }


        // ==============================================
        // VALIDAR CIDADE
        // ==============================================

        if (
            !cidade
        ) {

            alert(
                "Selecione sua cidade."
            );

            cidadeSelect.focus();

            return;

        }


        // ==============================================
        // VALIDAR WHATSAPP
        // ==============================================

        if (
            !telefoneValido(
                telefone
            )
        ) {

            alert(
                "Digite um WhatsApp válido."
            );

            whatsappInput.focus();

            return;

        }


        // ==============================================
        // DESABILITAR BOTÃO
        // ==============================================

        botaoEnviar.disabled =
            true;

        botaoEnviar.textContent =
            "CONSULTANDO...";


        mostrarCarregando();


        try {

            // ==========================================
            // BUSCAR DISTRIBUIDOR
            // ==========================================

            const distribuidores =
                await buscarDistribuidor(
                    estado,
                    cidade
                );


            // ==========================================
            // ENCONTROU DISTRIBUIDOR
            // ==========================================

            if (
                distribuidores.length > 0
            ) {

                const distribuidor =
                    distribuidores[0];


                const nomeDistribuidor =
                    campo(
                        distribuidor,
                        [
                            "DISTRIBUIDOR"
                        ]
                    );


                await registrarLead({

                    estado:
                        estado,

                    cidade:
                        cidade,

                    whatsapp:
                        telefone,

                    destino:
                        "DISTRIBUIDOR",

                    distribuidor:
                        nomeDistribuidor ||
                        "Distribuidor FQ4"

                });


                mostrarDistribuidor(
                    distribuidor,
                    estado,
                    cidade,
                    telefone
                );

            }


            // ==========================================
            // NÃO ENCONTROU DISTRIBUIDOR
            // ==========================================

            else {

                await registrarLead({

                    estado:
                        estado,

                    cidade:
                        cidade,

                    whatsapp:
                        telefone,

                    destino:
                        "FÁBRICA",

                    distribuidor:
                        ""

                });


                mostrarFabrica(
                    estado,
                    cidade,
                    telefone
                );

            }

        }

        catch (erro) {

            console.error(
                "ERRO NO PROCESSAMENTO:",
                erro
            );


            mostrarErro(
                "Não foi possível consultar o distribuidor da sua região."
            );

        }


        // ==============================================
        // RESTAURAR BOTÃO
        // ==============================================

        botaoEnviar.disabled =
            false;

        botaoEnviar.textContent =
            "QUERO SER REVENDA FQ4";

    }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

carregarEstados();
