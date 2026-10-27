import { test, expect, Page, Locator } from '@playwright/test';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import PrefeituraPage from '../support/pages/PrefeituraPage';

const CONFIG = join(__dirname, '../support/fixtures/config.yml');
const BASE_URL: string = TheConfig.fromFile(CONFIG)
  .andPath('application.prefeitura_nova_veneza_QA')
  .retrieveData();

/** Captura de tela opcional: imagem da interface, nunca documentação em TXT. */
async function evidenciar(page: import('@playwright/test').Page, nome: string) {
  await test.info().attach(nome, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png'
  });
}

/**
 * Informações exibidas diretamente na seção Annotations do relatório HTML.
 * Nenhum anexo de texto é produzido. As asserções reais continuam nos métodos Page.
 */
function documentarCenario(
  id: string,
  titulo: string,
  objetivo: string,
  caminho: string,
  preCondicao: string,
  dados: string,
  procedimento: string,
  resultado: string,
  cobertura: string
): void {
  const anotacoes = [
    { type: 'Caso de teste', description: `${id} | ${titulo}` },
    { type: 'Objetivo e justificativa', description: objetivo },
    { type: 'Caminho de navegação', description: caminho },
    { type: 'Pré-condições', description: preCondicao },
    { type: 'Dados utilizados', description: dados },
    { type: 'Procedimento', description: procedimento.replace(/\s(?=\d+\. )/g, '\n') },
    { type: 'Resultado esperado', description: resultado },
    { type: 'Verificações e limites', description: cobertura },
    {
      type: 'Critério de aprovação',
      description: 'Aprovado somente quando todas as asserções do Playwright forem satisfeitas. Evidências visuais não substituem as verificações.'
    }
  ];
  test.info().annotations.push(...anotacoes);
}

test.describe('Prefeitura de Nova Veneza/SC | Testes E2E documentados', () => {
  let portal: PrefeituraPage;

  test.beforeEach(async ({ page }) => {
    portal = new PrefeituraPage(page, BASE_URL);
  });

  test('CT-01 | Página inicial | Carregamento e atalhos principais', async ({ page }) => {
    documentarCenario(
    'CT-01',
    'Página inicial e acesso aos canais principais',
    'Confirmar que o portal oficial carrega corretamente e oferece pontos visíveis de navegação para Notícias e Contato.',
    'Acessar a URL principal da Prefeitura de Nova Veneza/SC.',
    'O endereço público deve estar disponível; não é necessário login.',
    'URL oficial configurada em config.yml; nenhum dado pessoal.',
    '1. Acessar a página inicial. 2. Verificar que a URL pertence a novaveneza.sc.gov.br. 3. Localizar referência visível a Nova Veneza. 4. Verificar links Notícias e Contato.',
    'A página abre, mostra referência ao município e disponibiliza os dois links previstos.',
    'URL, elementos do menu e referência ao município. Não testa todos os atalhos nem disponibilidade de serviços externos.'
    );
    await test.step('01. Abrir a página inicial do portal municipal e aguardar o documento HTML carregar.', async () => {
      await portal.abrir('/');
    });
    await test.step('02. Conferir domínio oficial, identificação do município e links Notícias e Contato; registrar imagem.', async () => {
      await portal.validarPaginaInicial();
      await evidenciar(page, 'CT-01 - inicio e atalhos.png');
    });
  });

  test('CT-02 | Notícias | Navegar pelo menu e validar a listagem', async ({ page }) => {
    documentarCenario(
    'CT-02',
    'Navegação para listagem de notícias',
    'Verificar que um visitante chega à listagem usando um link do portal, não uma URL digitada diretamente.',
    'Página inicial → link Notícias → listagem de notícias.',
    'Portal acessível, menu Notícias visível.',
    'Link Notícias do menu.',
    '1. Abrir a página inicial. 2. Selecionar Notícias. 3. Verificar que o endereço termina na seção de notícias. 4. Confirmar uma chamada de notícia e link Ler mais.',
    'A navegação leva à página Notícias e existe ao menos uma publicação consultável.',
    'URL após o clique, chamada inicial e link Ler mais. Não testa todas as notícias.'
    );
    await test.step('01. Abrir a página inicial para reproduzir o percurso real de um cidadão.', async () => {
      await portal.abrir('/');
    });
    await test.step('02. Clicar em Notícias no menu e verificar a navegação para /noticias/.', async () => {
      await portal.navegarParaNoticias();
    });
    await test.step('03. Confirmar presença de publicação e link Ler mais; registrar imagem.', async () => {
      await portal.validarListaNoticias();
      await evidenciar(page, 'CT-02 - listagem de noticias.png');
    });
  });

  test('CT-03 | Notícias | Abrir publicação e validar título e conteúdo', async ({ page }) => {
    documentarCenario(
    'CT-03',
    'Integridade da navegação de uma notícia',
    'Demonstrar que o título selecionado na listagem é mantido na página de leitura e que existe conteúdo textual significativo.',
    'Notícias → primeira chamada de notícia → página de leitura.',
    'Listagem pública com ao menos uma notícia e título visível.',
    'Primeira notícia disponível; o título é capturado durante o teste para não depender de uma publicação fixa.',
    '1. Abrir Notícias. 2. Identificar primeiro título. 3. Registrar texto e link de destino. 4. Clicar no título. 5. Conferir mudança da URL. 6. Comparar título no detalhe. 7. Verificar texto com mais de 100 caracteres.',
    'A página de detalhes abre, exibe o mesmo título e contém texto suficiente para leitura.',
    'Conferência dinâmica do título e do texto. O limite de caracteres não prova correção editorial das informações.'
    );
    let titulo = '';
    await test.step('01. Abrir a listagem /noticias/ e garantir que há pelo menos uma publicação.', async () => {
      await portal.abrir('/noticias/');
      await portal.validarListaNoticias();
    });
    await test.step('02. Registrar título e link da primeira notícia, clicar e conferir mudança de endereço.', async () => {
      titulo = await portal.abrirPrimeiraNoticia();
    });
    await test.step('03. Comparar o título com a página aberta e exigir conteúdo textual com mais de 100 caracteres.', async () => {
      await portal.validarDetalheNoticia(titulo);
      await evidenciar(page, 'CT-03 - noticia completa.png');
    });
  });

  test('CT-04 | Licitações | Exibir os filtros e processos públicos', async ({ page }) => {
    documentarCenario(
    'CT-04',
    'Disponibilidade da consulta de licitações',
    'Garantir que a área de consulta de licitações possui filtros e oferece acesso a registros públicos.',
    'Página /licitacoes/ → área de filtros e resultados.',
    'Portal disponível; ao menos um processo com link Saiba Mais.',
    'Controles visíveis Situação, Modalidade, Aplicar e Limpar.',
    '1. Abrir Licitações. 2. Verificar título da página. 3. Verificar campos/sessões Situação e Modalidade. 4. Localizar os botões Aplicar e Limpar. 5. Confirmar ao menos um Saiba Mais.',
    'O cidadão encontra os controles de consulta e ao menos um processo acessível.',
    'Presença dos controles e registro consultável. O teste NÃO aplica filtros e NÃO confirma precisão do resultado filtrado.'
    );
    await test.step('01. Abrir /licitacoes/ e carregar a listagem pública.', async () => {
      await portal.abrir('/licitacoes/');
    });
    await test.step('02. Conferir título, filtros Situação/Modalidade, botões Aplicar/Limpar e acesso Saiba Mais.', async () => {
      await portal.validarLicitações();
      await evidenciar(page, 'CT-04 - licitacoes e filtros.png');
    });
  });

  test('CT-05 | Licitações | Consultar os detalhes de um processo', async ({ page }) => {
    documentarCenario(
    'CT-05',
    'Abertura de detalhes de uma licitação',
    'Conferir se a ação Saiba Mais abre uma página de detalhes em vez de manter o visitante na listagem.',
    'Licitações → primeiro Saiba Mais → detalhes do processo.',
    'Listagem disponível com ao menos um link Saiba Mais.',
    'Primeiro registro exibido no momento da execução.',
    '1. Abrir Licitações. 2. Verificar os controles e a existência do registro. 3. Clicar no primeiro Saiba Mais. 4. Confirmar que a URL deixou de ser a listagem. 5. Verificar que há título h1/h2 visível.',
    'O portal navega a uma página diferente da listagem, com título visível.',
    'URL alterada e cabeçalho visível. NÃO compara número, objeto, situação ou arquivo do edital entre páginas.'
    );
    await test.step('01. Abrir Licitações e confirmar que existe pelo menos um processo consultável.', async () => {
      await portal.abrir('/licitacoes/');
      await portal.validarLicitações();
    });
    await test.step('02. Selecionar Saiba Mais do primeiro processo e conferir saída da listagem.', async () => {
      await portal.abrirPrimeiroDetalhe();
    });
    await test.step('03. Confirmar que a página de destino carregou; capturar evidência de seus detalhes.', async () => {
      await expect(page.locator('body')).toBeVisible();
      await evidenciar(page, 'CT-05 - detalhe da licitacao.png');
    });
  });

  test('CT-06 | Licitações | Avançar a paginação de resultados', async ({ page }) => {
    documentarCenario(
    'CT-06',
    'Paginação da consulta de licitações',
    'Verificar que o usuário consegue avançar na listagem e continuar encontrando registros consultáveis.',
    'Licitações → Próxima Página → listagem seguinte.',
    'A paginação deve apresentar link Próxima Página e registros nas páginas envolvidas.',
    'Link Próxima Página fornecido pelo portal.',
    '1. Abrir Licitações. 2. Confirmar lista e filtros. 3. Registrar URL inicial. 4. Clicar Próxima Página. 5. Esperar URL ser modificada. 6. Verificar presença de Saiba Mais na nova página.',
    'A URL muda e a página seguinte continua permitindo abrir registros.',
    'Troca de URL e link de detalhe. NÃO valida que todos os registros mudaram nem ausência de duplicidade.'
    );
    await test.step('01. Abrir Licitações e verificar a disponibilidade de registros e da listagem.', async () => {
      await portal.abrir('/licitacoes/');
      await portal.validarLicitações();
    });
    await test.step('02. Clicar Próxima Página, comparar endereço antes/depois e exigir URL diferente.', async () => {
      await portal.irParaProximaPagina();
    });
    await test.step('03. Registrar evidência da nova página de resultados.', async () => {
      await evidenciar(page, 'CT-06 - segunda pagina de licitacoes.png');
    });
  });

  test('CT-07 | Concursos | Verificar filtros e editais publicados', async ({ page }) => {
    documentarCenario(
    'CT-07',
    'Acesso à relação de concursos públicos',
    'Comprovar que a seção Concursos Públicos apresenta opções básicas de consulta e editais acessíveis.',
    'Página /concursos-publicos/ → filtros e lista de concursos.',
    'Página acessível com ao menos um edital consultável.',
    'Campo Número, botões Aplicar e Limpar e link Saiba Mais.',
    '1. Abrir Concursos Públicos. 2. Verificar título. 3. Localizar Número. 4. Localizar Aplicar e Limpar. 5. Confirmar pelo menos um link Saiba Mais.',
    'O portal apresenta ferramentas de consulta e ao menos um concurso acessível.',
    'Componentes visíveis. NÃO realiza pesquisa por número nem verifica atualidade dos editais.'
    );
    await test.step('01. Abrir a listagem de Concursos Públicos sem autenticação.', async () => {
      await portal.abrir('/concursos-publicos/');
    });
    await test.step('02. Verificar título, campo Número, Aplicar, Limpar e primeiro link Saiba Mais.', async () => {
      await portal.validarConcursos();
      await evidenciar(page, 'CT-07 - lista de concursos.png');
    });
  });

  test('CT-08 | Concursos | Abrir detalhes de um edital', async ({ page }) => {
    documentarCenario(
    'CT-08',
    'Consulta de detalhes de concurso público',
    'Verificar que a abertura de um concurso sai da listagem e mostra uma página própria com cabeçalho.',
    'Concursos Públicos → primeiro Saiba Mais → detalhes.',
    'Existência de link Saiba Mais na listagem.',
    'Primeiro concurso disponibilizado pelo portal.',
    '1. Abrir Concursos Públicos. 2. Validar a listagem. 3. Acionar primeiro Saiba Mais. 4. Confirmar mudança em relação à URL da listagem. 5. Conferir título h1/h2.',
    'É exibida página de detalhe diferente da listagem e com cabeçalho visível.',
    'URL e cabeçalho. NÃO baixa edital nem verifica autenticidade ou conteúdo de anexos.'
    );
    await test.step('01. Abrir Concursos Públicos e localizar um registro acessível.', async () => {
      await portal.abrir('/concursos-publicos/');
      await portal.validarConcursos();
    });
    await test.step('02. Clicar Saiba Mais do primeiro registro e confirmar mudança de endereço.', async () => {
      await portal.abrirPrimeiroDetalhe();
    });
    await test.step('03. Garantir carregamento da página de detalhes e salvar evidência.', async () => {
      await expect(page.locator('body')).toBeVisible();
      await evidenciar(page, 'CT-08 - detalhe do concurso.png');
    });
  });

  test('CT-09 | Carta de Serviços | Verificar categorias e opções de filtro', async ({ page }) => {
    documentarCenario(
    'CT-09',
    'Disponibilidade da Carta de Serviços',
    'Verificar a presença de mecanismos básicos de localização de serviços oferecidos ao cidadão.',
    'Página /cartas-filtro/ → filtros da Carta de Serviços.',
    'Carta de Serviços acessível com ao menos um serviço listado.',
    'Público Alvo, Categoria, Aplicar, Limpar e Saiba Mais.',
    '1. Abrir Carta de Serviços. 2. Confirmar o título. 3. Identificar Público Alvo. 4. Identificar Categoria. 5. Conferir Aplicar e Limpar. 6. Encontrar um serviço com Saiba Mais.',
    'Os filtros essenciais ficam visíveis e ao menos um serviço pode ser consultado.',
    'Disponibilidade dos controles. NÃO altera nem limpa os filtros neste cenário.'
    );
    await test.step('01. Abrir /cartas-filtro/ e aguardar a seção da Carta de Serviços.', async () => {
      await portal.abrir('/cartas-filtro/');
    });
    await test.step('02. Verificar Público Alvo, Categoria, Aplicar, Limpar e serviço consultável.', async () => {
      await portal.validarCarta();
      await evidenciar(page, 'CT-09 - carta de servicos.png');
    });
  });

  test('CT-10 | Carta de Serviços | Abrir descrição de serviço ao cidadão', async ({ page }) => {
    documentarCenario(
    'CT-10',
    'Navegação para detalhes da Carta de Serviços',
    'Validar que uma descrição individual de serviço pode ser aberta a partir da relação pública.',
    'Carta de Serviços → primeiro Saiba Mais → descrição do serviço.',
    'Ao menos um serviço exibido com link de detalhes.',
    'Primeiro serviço da lista, sem dependência de nome fixo.',
    '1. Abrir Carta de Serviços. 2. Verificar a lista. 3. Clicar no primeiro Saiba Mais. 4. Verificar que URL não permanece na listagem. 5. Confirmar cabeçalho visível.',
    'Abre uma página específica de serviço com título visível.',
    'Navegação e cabeçalho. NÃO verifica prazos, requisitos ou documentação do serviço.'
    );
    await test.step('01. Abrir a Carta de Serviços e verificar existência de serviço com detalhes.', async () => {
      await portal.abrir('/cartas-filtro/');
      await portal.validarCarta();
    });
    await test.step('02. Acionar Saiba Mais do primeiro serviço e conferir navegação fora da listagem.', async () => {
      await portal.abrirPrimeiroDetalhe();
    });
    await test.step('03. Confirmar carregamento da página de serviço e registrar evidência.', async () => {
      await expect(page.locator('body')).toBeVisible();
      await evidenciar(page, 'CT-10 - detalhe de servico.png');
    });
  });

  test('CT-11 | Contato | Verificar canais de atendimento e formulário', async ({ page }) => {
    documentarCenario(
    'CT-11',
    'Disponibilidade das informações de contato',
    'Verificar se o cidadão consegue localizar informações públicas de atendimento e o formulário.',
    'Página /contato/ → endereço, telefone e formulário.',
    'Página Contato disponível.',
    'Endereço Travessa Oswaldo Búrigo; telefone que contém 3471-1766; Nome, E-mail e Assunto.',
    '1. Abrir Contato. 2. Confirmar cabeçalho. 3. Conferir endereço. 4. Conferir telefone. 5. Identificar Nome, E-mail, Assunto e Enviar.',
    'As informações e os controles definidos estão visíveis na página.',
    'Dados públicos e formulário visíveis. NÃO confirma que o telefone funciona ou que o e-mail chega ao destino.'
    );
    await test.step('01. Abrir Contato sem inserir dados pessoais.', async () => {
      await portal.abrir('/contato/');
    });
    await test.step('02. Conferir endereço, telefone, rótulos obrigatórios e botão Enviar; registrar evidência.', async () => {
      await portal.validarContato();
      await evidenciar(page, 'CT-11 - dados e formulario de contato.png');
    });
  });

  test('CT-12 | Contato | Impedir envio de formulário sem dados obrigatórios', async ({ page }) => {
    documentarCenario(
    'CT-12',
    'Prevenção de envio de formulário vazio',
    'Verificar se a tentativa de envio sem preencher os dados mínimos permanece no formulário sem navegar a uma confirmação de sucesso.',
    'Contato → formulário sem preenchimento → Enviar.',
    'Formulário acessível; nenhum dado deve ser digitado; não resolver verificações de segurança.',
    'Campos mantidos vazios, sem informações pessoais.',
    '1. Abrir Contato. 2. Confirmar presença do formulário. 3. Registrar URL. 4. Clicar Enviar sem preencher campos. 5. Verificar mesma URL, botão Enviar e rótulo Nome. 6. Registrar captura.',
    'O visitante continua no formulário após a tentativa e não ocorre redirecionamento para uma página de confirmação.',
    'Permanência da URL e do formulário. NÃO verifica mensagem específica de erro nem garante, isoladamente, ausência de requisição ao servidor.'
    );
    await test.step('01. Abrir formulário Contato vazio e verificar campos e botão Enviar.', async () => {
      await portal.abrir('/contato/');
      await portal.validarContato();
    });
    await test.step('02. Clicar Enviar sem preencher; validar permanência na página e no formulário.', async () => {
      await portal.validarContatoVazio();
    });
    await test.step('03. Verificar novamente a rota /contato/ e salvar imagem do estado após a tentativa.', async () => {
      await expect(page).toHaveURL(/\/contato\//);
      await evidenciar(page, 'CT-12 - validacao de formulario vazio.png');
    });
  });
});

// ===========================================================
// TESTES PRÁTICOS CT-13 a CT-16 (MESMO ARQUIVO, NOVO BLOCO)
// ===========================================================

/** Cada descrição é exibida na aba Annotations do relatório HTML. */
function ficha(dados: {
  id: string; titulo: string; objetivo: string; caminho: string;
  precondicoes: string; massa: string; resultado: string; cobertura: string;
}) {
  test.info().annotations.push(
    { type: 'Caso de teste', description: `${dados.id} | ${dados.titulo}` },
    { type: 'Objetivo e justificativa', description: dados.objetivo },
    { type: 'Caminho de navegação', description: dados.caminho },
    { type: 'Pré-condições', description: dados.precondicoes },
    { type: 'Massa de dados / entradas', description: dados.massa },
    { type: 'Resultado esperado', description: dados.resultado },
    { type: 'Verificações e limitações', description: dados.cobertura },
    { type: 'Critério de aprovação', description: 'Todas as verificações automatizadas precisam passar. O teste não deve enviar informações reais à prefeitura.' }
  );
}

async function abrir(page: Page, caminho: string) {
  await page.goto(`${BASE_URL.replace(/\/$/, '')}${caminho}`, {waitUntil: 'domcontentloaded'});
  await expect(page.locator('body')).toBeVisible();
}

function formularioContato(page: Page): Locator {
  // Isola o formulário que possui o botão de envio (e ignora a busca do cabeçalho).
  return page.locator('form').filter({has: page.getByRole('button', {name: /^Enviar$/i})}).first();
}

function campoPorRotulo(form: Locator, rotulo: string): Locator {
  // Usa o controle que segue o rótulo visível, inclusive em temas sem atributo for.
  return form.locator(`xpath=.//*[self::label or self::span or self::div or self::p][contains(normalize-space(.), '${rotulo}')]/following::input[not(@type='hidden')][1]`).first();
}

function campoPesquisa(page: Page): Locator {
  // Palavra-chave está imediatamente associada ao campo na página de consulta.
  return page.locator('xpath=//*[normalize-space(text())="Palavra-chave"]/following::input[not(@type="hidden")][1]').first();
}

async function capturar(page: Page, nome: string) {
  await test.info().attach(nome, {body: await page.screenshot({fullPage: true}), contentType: 'image/png'});
}


/** Detecta uma página HTTP 502; é uma falha do servidor, não um resultado de busca vazia. */
async function paginaComErro502(page: import('@playwright/test').Page): Promise<boolean> {
  const titulo = await page.title().catch(() => '');
  const conteudo = await page.locator('body').innerText().catch(() => '');
  return /502|Bad Gateway/i.test(titulo) || /^(502|Bad Gateway|HTTP ERROR 502)/i.test(conteudo.trim());
}

/** Repete somente a pesquisa que recebeu 502, nunca considera a página de erro como sucesso. */
async function aplicarFiltroComRecuperacao(page: import('@playwright/test').Page, termo: string): Promise<void> {
  const maxTentativas = 3;
  for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
    await test.step(`Pesquisa: tentativa ${tentativa}/${maxTentativas} de aplicar a palavra-chave`, async () => {
      if (tentativa > 1) {
        await page.goto(`${BASE_URL.replace(/\/$/, '')}/cartas-filtro/`, { waitUntil: 'domcontentloaded' });
      }
      await expect(campoPesquisa(page)).toBeVisible();
      await campoPesquisa(page).fill(termo);
      await expect(campoPesquisa(page)).toHaveValue(termo);
      await page.getByRole('button', { name: /aplicar/i }).first().click();
      await page.waitForLoadState('domcontentloaded');
    });
    if (!(await paginaComErro502(page))) {
      await test.step('Confirmar que a pesquisa não terminou em uma página HTTP 502', async () => {
        await expect(page.locator('body')).toBeVisible();
        expect(await paginaComErro502(page)).toBe(false);
      });
      return;
    }
    if (tentativa < maxTentativas) {
      await test.step(`Servidor respondeu HTTP 502: preparar nova tentativa (${tentativa + 1}/${maxTentativas})`, async () => {
        await expect(page.locator('body')).toBeVisible();
      });
    }
  }
  throw new Error('Pesquisa indisponível: o servidor retornou HTTP 502 em três tentativas consecutivas.');
}

test.describe('Prefeitura de Nova Veneza/SC | Testes práticos de formulários e pesquisas', () => {
  test('CT-13 | Contato | Tentar enviar formulário inteiramente vazio', async ({page}) => {
    ficha({id:'CT-13', titulo:'Bloqueio do envio sem informações obrigatórias',
      objetivo:'Exercitar o botão Enviar de verdade, com todos os dados vazios, e comprovar que a tentativa não leva a uma confirmação de sucesso.',
      caminho:'Portal municipal → Contato → formulário → Enviar.',
      precondicoes:'O formulário está acessível e não há cadastro/autenticação.',
      massa:'Nome, e-mail, assunto e verificação de segurança vazios.',
      resultado:'O formulário continua na página e não aparece indicação de mensagem enviada com sucesso.',
      cobertura:'Verifica a interface após o clique; não comprova sozinho que nenhuma requisição HTTP foi disparada.'});
    await test.step('01. Acessar /contato/ e identificar o formulário público.', async () => {
      await abrir(page,'/contato/'); await expect(formularioContato(page)).toBeVisible();
    });
    await test.step('02. Acionar Enviar sem digitar nome, e-mail, assunto ou verificação de segurança.', async () => {
      await formularioContato(page).getByRole('button',{name:/^Enviar$/i}).click();
    });
    await test.step('03. Confirmar que a página continua em Contato, com formulário e botão Enviar disponíveis.', async () => {
      await expect(page).toHaveURL(/\/contato\/?/);
      await expect(formularioContato(page)).toBeVisible();
      await expect(formularioContato(page).getByRole('button',{name:/^Enviar$/i})).toBeVisible();
      await capturar(page,'CT-13 - tentativa de envio vazio');
    });
  });

  test('CT-14 | Contato | Rejeitar formato inválido no campo de e-mail', async ({page}) => {
    ficha({id:'CT-14', titulo:'Validação de formato de e-mail inválido',
      objetivo:'Inserir texto que não corresponde a endereço de e-mail e avaliar a validação do campo, sem encaminhar mensagem ao município.',
      caminho:'Portal municipal → Contato → campo E-mail.',
      precondicoes:'Campo de e-mail disponível e editável.',
      massa:'E-mail inválido: usuario-sem-arroba; os demais campos permanecem sem preenchimento.',
      resultado:'O valor digitado permanece visível e, quando o navegador oferece validação nativa de e-mail, o campo deve ser considerado inválido.',
      cobertura:'Se o HTML não definir type=email, registra a ausência dessa validação como falha do cenário, não como teste aprovado artificialmente.'});
    await test.step('01. Abrir a página Contato e localizar o campo de e-mail no formulário.', async () => {
      await abrir(page,'/contato/'); await expect(formularioContato(page)).toBeVisible();
    });
    await test.step('02. Preencher E-mail com "usuario-sem-arroba", um valor sem @ e sem domínio.', async () => {
      const email = formularioContato(page).locator('input[type="email"]').first();
      await expect(email, 'O formulário deve utilizar um campo HTML de e-mail para validar o formato').toBeVisible();
      await email.fill('usuario-sem-arroba');
      await expect(email).toHaveValue('usuario-sem-arroba');
    });
    await test.step('03. Executar a validação HTML do controle e comprovar que o e-mail é inválido.', async () => {
      const email = formularioContato(page).locator('input[type="email"]').first();
      const valido = await email.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(valido, 'Um e-mail sem @ não pode ser aceito por input type=email').toBe(false);
      await capturar(page,'CT-14 - email invalido digitado');
    });
  });

  test('CT-15 | Carta de Serviços | Pesquisar expressão sem correspondência', async ({page}) => {
    const termo = 'zzzxxyy-servico-inexistente-2026';
    ficha({id:'CT-15', titulo:'Pesquisa de serviço por termo inexistente',
      objetivo:'Submeter uma busca que dificilmente existe no catálogo e verificar se a consulta é aplicada e retorna resultados coerentes.',
      caminho:'Portal municipal → Carta de Serviços → Palavra-chave → Aplicar.',
      precondicoes:'Formulário de filtros acessível.', massa:`Palavra-chave: ${termo}`,
      resultado:'O sistema aplica a pesquisa e mantém identificável o critério informado; nenhum serviço deve ser apresentado como correspondência falsa.',
      cobertura:'Confere preenchimento, submissão e ausência de links de serviço; um erro HTTP 502 permite até três tentativas e nunca é considerado busca vazia bem-sucedida.'});
    await test.step('01. Abrir a Carta de Serviços e identificar Palavra-chave e Aplicar.', async () => {
      await abrir(page,'/cartas-filtro/'); await expect(page.getByRole('button',{name:/aplicar/i}).first()).toBeVisible();
      await expect(campoPesquisa(page)).toBeVisible();
    });
    await test.step(`02. Digitar a expressão sem correspondência "${termo}" no campo Palavra-chave.`, async () => {
      await expect(campoPesquisa(page)).toBeVisible();
      await campoPesquisa(page).fill(termo);
      await expect(campoPesquisa(page)).toHaveValue(termo);
    });
    await test.step('03. Pressionar Aplicar e aguardar o processamento da busca.', async () => {
      await aplicarFiltroComRecuperacao(page, termo);
    });
    await test.step('04. Verificar que nenhum link de detalhes de serviço aparece como resultado do termo sem correspondência.', async () => {
      await expect(page.getByRole('link',{name:/saiba mais/i})).toHaveCount(0);
      await capturar(page,'CT-15 - consulta sem correspondencias');
    });
  });

  test('CT-16 | Carta de Serviços | Limpar pesquisa e restaurar resultados', async ({page}) => {
    const termo = 'zzzxxyy-servico-inexistente-2026';
    ficha({id:'CT-16', titulo:'Reversão de filtro aplicado na Carta de Serviços',
      objetivo:'Testar o ciclo completo de interação: preencher palavra-chave, aplicar pesquisa restritiva e utilizar Limpar para recuperar a listagem.',
      caminho:'Carta de Serviços → Palavra-chave → Aplicar → Limpar.',
      precondicoes:'Página exibe serviços na consulta inicial e apresenta botões Aplicar e Limpar.',
      massa:`Termo de pesquisa: ${termo}`,
      resultado:'Após Limpar, o termo deixa de restringir a consulta e serviços voltam a estar disponíveis para abertura.',
      cobertura:'Valida reversibilidade do filtro sem depender da quantidade exata de serviços, que pode variar.'});
    await test.step('01. Abrir Carta de Serviços e confirmar que há serviços consultáveis antes de filtrar.', async () => {
      await abrir(page,'/cartas-filtro/');
      await expect(page.getByRole('link',{name:/saiba mais/i}).first()).toBeVisible();
    });
    await test.step('02. Preencher termo inexistente e aplicar o filtro para reduzir os resultados.', async () => {
      await aplicarFiltroComRecuperacao(page, termo);
      await expect(page.getByRole('link',{name:/saiba mais/i})).toHaveCount(0);
    });
    await test.step('03. Clicar Limpar para remover o critério que restringia a consulta.', async () => {
      await page.getByRole('button',{name:/limpar/i}).first().click();
    });
    await test.step('04. Confirmar que a listagem de serviços voltou a apresentar pelo menos um link Saiba Mais.', async () => {
      await expect(page.getByRole('link',{name:/saiba mais/i}).first()).toBeVisible();
      await capturar(page,'CT-16 - lista restaurada apos limpar');
    });
  });
});
