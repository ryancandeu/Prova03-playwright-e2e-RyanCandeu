
import { test } from '@playwright/test';
import { join } from 'path';
import { TheConfig } from 'sicolo';
import LoginPage from '../support/pages/LoginPage';

test.describe('Login de usuário', () => {
  const CONFIG = join(__dirname, '../support/fixtures/config.yml');
  let loginPage: LoginPage;

  const BASE_URL = TheConfig.fromFile(CONFIG)
    .andPath('application.login_QA')
    .retrieveData();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto(BASE_URL);
  });

  test('Realizar login com dados válidos', async () => {
    await loginPage.preencherLoginValido();
    await loginPage.validarLogin();
  });

  test('Realizar login com senha inválida', async () => {
    await loginPage.preencherSenhaInvalida();
    await loginPage.validarErroSenha();
  });

  test('Realizar login com usuário inválido', async () => {
    await loginPage.preencherUsuarioInvalido();
    await loginPage.validarErroUsuario();
  });

  test('Realizar logout após login', async () => {
    await loginPage.preencherLoginValido();
    await loginPage.validarLogin();
    await loginPage.realizarLogout();
    await loginPage.validarLogout();
  });
});
