
import { Page, Locator } from '@playwright/test';

export default class LoginElements {
  constructor(readonly page: Page) {}

  getCampoUsuario(): Locator {
    return this.page.locator('#username');
  }

  getCampoSenha(): Locator {
    return this.page.locator('#password');
  }

  getBotaoLogin(): Locator {
    return this.page.locator('button[type="submit"]');
  }

  getMensagem(): Locator {
    return this.page.locator('#flash');
  }

  getBotaoLogout(): Locator {
    return this.page.locator('a[href="/logout"]');
  }
}
