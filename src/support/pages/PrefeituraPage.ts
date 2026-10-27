import { Page, expect } from '@playwright/test';
import PrefeituraElements from '../elements/PrefeituraElements';
import BasePage from './BasePage';

export default class PrefeituraPage extends BasePage {
  readonly elements: PrefeituraElements;
  readonly raiz: string;

  constructor(readonly page: Page, raiz: string) {
    super(page);
    this.raiz = raiz.replace(/\/$/, '');
    this.elements = new PrefeituraElements(page);
  }

  async abrir(caminho = '/'): Promise<void> {
    await this.page.goto(`${this.raiz}${caminho}`, { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('body')).toBeVisible();
  }

  async validarPaginaInicial(): Promise<void> {
    await expect(this.page).toHaveURL(/novaveneza\.sc\.gov\.br/);
    await expect(this.elements.menu('Notícias')).toBeVisible();
    await expect(this.elements.menu('Contato')).toBeVisible();
    await expect(this.page.getByText(/Nova Veneza/i).first()).toBeVisible();
  }

  async navegarParaNoticias(): Promise<void> {
    await this.elements.menu('Notícias').click();
    await expect(this.page).toHaveURL(/\/noticias\//);
  }

  async validarListaNoticias(): Promise<void> {
    await expect(this.elements.noticiaDaLista()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /ler mais/i }).first()).toBeVisible();
  }

  async abrirPrimeiraNoticia(): Promise<string> {
    const link = this.elements.noticiaDaLista();
    await expect(link).toBeVisible();
    const titulo = (await link.innerText()).trim();
    expect(titulo.length).toBeGreaterThan(10);
    const destino = await link.getAttribute('href');
    expect(destino).toBeTruthy();
    await link.click();
    await expect(this.page).not.toHaveURL(/\/noticias\/?(?:\?.*)?$/);
    return titulo;
  }

  async validarDetalheNoticia(titulo: string): Promise<void> {
    await expect(this.page.getByRole('heading', { name: titulo, exact: true }).last()).toBeVisible();
    const textos = await this.page.locator('p:visible').allTextContents();
    expect(textos.join(' ').trim().length).toBeGreaterThan(100);
  }

  async validarFiltros(titulo: string): Promise<void> {
    await expect(this.elements.titulo(titulo)).toBeVisible();
    await expect(this.elements.botaoAplicar()).toBeVisible();
    await expect(this.elements.botaoLimpar()).toBeVisible();
  }

  async validarLicitações(): Promise<void> {
    await this.validarFiltros('Licitações');
    await expect(this.page.getByText('Modalidade', { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText('Situação', { exact: true }).first()).toBeVisible();
    await expect(this.elements.linksDetalhes().first()).toBeVisible();
  }

  async abrirPrimeiroDetalhe(): Promise<void> {
    const link = this.elements.linksDetalhes().first();
    await expect(link).toBeVisible();
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    await link.click();
    await expect(this.page).not.toHaveURL(/\/(licitacoes|concursos-publicos|cartas-filtro)\/?(?:\?.*)?$/);
    await expect(this.page.locator('h1, h2').first()).toBeVisible();
  }

  async irParaProximaPagina(): Promise<void> {
    const proxima = this.elements.proximaPagina();
    await expect(proxima).toBeVisible();
    const antes = this.page.url();
    await proxima.click();
    await expect.poll(() => this.page.url()).not.toBe(antes);
    await expect(this.elements.linksDetalhes().first()).toBeVisible();
  }

  async validarConcursos(): Promise<void> {
    await this.validarFiltros('Concursos Públicos');
    await expect(this.page.getByText('Número', { exact: true }).first()).toBeVisible();
    await expect(this.elements.linksDetalhes().first()).toBeVisible();
  }

  async validarCarta(): Promise<void> {
    await this.validarFiltros('Carta de Serviços');
    await expect(this.page.getByText('Público Alvo', { exact: true }).first()).toBeVisible();
    await expect(this.page.getByText('Categoria', { exact: true }).first()).toBeVisible();
    await expect(this.elements.linksDetalhes().first()).toBeVisible();
  }

  async validarContato(): Promise<void> {
    await expect(this.elements.titulo('Contato')).toBeVisible();
    await expect(this.page.getByText(/Travessa Oswaldo Búrigo/i).first()).toBeVisible();
    await expect(this.page.getByText(/3471-1766/).first()).toBeVisible();
    await expect(this.page.getByText(/Nome\s*\*/i).first()).toBeVisible();
    await expect(this.page.getByText(/E-mail\s*\*/i).first()).toBeVisible();
    await expect(this.page.getByText(/Assunto\s*\*/i).first()).toBeVisible();
    await expect(this.elements.botaoEnviar()).toBeVisible();
  }

  async validarContatoVazio(): Promise<void> {
    const urlAntes = this.page.url();
    await this.elements.botaoEnviar().click();
    // Envio de formulário vazio: não se espera redirecionamento para uma página de sucesso.
    await expect(this.page).toHaveURL(urlAntes);
    await expect(this.elements.botaoEnviar()).toBeVisible();
    await expect(this.page.getByText(/Nome\s*\*/i).first()).toBeVisible();
  }
}
