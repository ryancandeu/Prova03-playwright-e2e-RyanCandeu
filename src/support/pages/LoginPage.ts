
import { Page, expect } from '@playwright/test';
import LoginElements from '../elements/LoginElements';
import BasePage from './BasePage';

export default class LoginPage extends BasePage {
  readonly loginElements: LoginElements;

  constructor(readonly page: Page) {
    super(page);
    this.loginElements = new LoginElements(page);
  }

  async preencherLoginValido(): Promise<void> {
    await this.loginElements.getCampoUsuario().fill('tomsmith');
    await this.loginElements.getCampoSenha().fill('SuperSecretPassword!');
    await this.loginElements.getBotaoLogin().click();
  }

  async preencherSenhaInvalida(): Promise<void> {
    await this.loginElements.getCampoUsuario().fill('tomsmith');
    await this.loginElements.getCampoSenha().fill('123456');
    await this.loginElements.getBotaoLogin().click();
  }

  async preencherUsuarioInvalido(): Promise<void> {
    await this.loginElements.getCampoUsuario().fill('usuarioinvalido');
    await this.loginElements.getCampoSenha().fill('SuperSecretPassword!');
    await this.loginElements.getBotaoLogin().click();
  }

  async validarLogin(): Promise<void> {
    await expect(this.loginElements.getMensagem())
      .toContainText('You logged into a secure area!');

    await expect(this.loginElements.getBotaoLogout())
      .toBeVisible();
  }

  async validarErroSenha(): Promise<void> {
    await expect(this.loginElements.getMensagem())
      .toContainText('Your password is invalid!');
  }

  async validarErroUsuario(): Promise<void> {
    await expect(this.loginElements.getMensagem())
      .toContainText('Your username is invalid!');
  }

  async realizarLogout(): Promise<void> {
    await this.loginElements.getBotaoLogout().click();
  }

  async validarLogout(): Promise<void> {
    await expect(this.loginElements.getMensagem())
      .toContainText('You logged out of the secure area!');
  }
}
