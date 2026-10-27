import { Locator, Page } from '@playwright/test';

/** Seletores centralizados. Ajuste-os aqui se o HTML público mudar. */
export default class PrefeituraElements {
  constructor(readonly page: Page) {}

  titulo(nome: string): Locator {
    return this.page.getByRole('heading', { name: nome, exact: true }).first();
  }

  menu(nome: string): Locator {
    return this.page.getByRole('link', { name: nome, exact: true }).first();
  }

  noticiaDaLista(): Locator {
    return this.page.locator('h2 a[href]').first();
  }

  mancheteDaNoticia(): Locator {
    return this.page.locator('h1').last();
  }

  botaoAplicar(): Locator {
    return this.page.getByRole('button', { name: /aplicar/i }).first();
  }

  botaoLimpar(): Locator {
    return this.page.getByRole('button', { name: /limpar/i }).first();
  }

  campoPalavraChave(): Locator {
    // Formulários públicos possuem mais de um input oculto;
    // esta busca usa o label visível como primeira estratégia.
    return this.page.getByText('Palavra-chave', { exact: true }).first();
  }

  linksDetalhes(): Locator {
    return this.page.getByRole('link', { name: /saiba mais/i });
  }

  proximaPagina(): Locator {
    return this.page.getByRole('link', { name: /próxima página/i }).first();
  }

  rotuloContato(nome: RegExp): Locator {
    return this.page.getByText(nome).first();
  }

  botaoEnviar(): Locator {
    return this.page.getByRole('button', { name: /^enviar$/i }).first();
  }
}
