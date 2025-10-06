import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/')
    
    const heading = page.getByRole('heading', { name: 'Plataforma de Clubes Deportivos' })
    await expect(heading).toBeVisible()
  })

  test('should display the description', async ({ page }) => {
    await page.goto('/')
    
    const description = page.getByText('Sistema de gestión integral para clubes deportivos')
    await expect(description).toBeVisible()
  })

  test('should display the welcome section', async ({ page }) => {
    await page.goto('/')
    
    const welcome = page.getByText('¡Bienvenido!')
    await expect(welcome).toBeVisible()
  })

  test('should display the feature list', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.getByText('• Gestionar disciplinas deportivas')).toBeVisible()
    await expect(page.getByText('• Administrar deportistas y entrenadores')).toBeVisible()
    await expect(page.getByText('• Controlar cuotas sociales')).toBeVisible()
    await expect(page.getByText('• Acceder con diferentes roles de usuario')).toBeVisible()
  })

  test('should display the iteration status', async ({ page }) => {
    await page.goto('/')
    
    const status = page.getByText('🚀 Iteración 1: Fundación Básica - Completada')
    await expect(status).toBeVisible()
  })

  test('should have correct page title', async ({ page }) => {
    await page.goto('/')
    
    await expect(page).toHaveTitle('Plataforma de Clubes Deportivos')
  })
})
