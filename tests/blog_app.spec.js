// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith } = require('./helper')



describe('Blog app', () => {

  const user = {
    username: 'terotee',
    password: 'testero'
  }
  
  const wrongUser = {
    username: 'terotes',
    password: 'teropitkamaki'
  }

  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Tero Testeri',
        username: 'terotee',
        password: 'testero'
      }

     
    })
    await page.goto('http://localhost:5174')
  })
  test('Login form is shown', async ({ page }) => {

    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
  })

  describe('Login', () => {
    

    // Wrong username or password
    test('Successful login', async ({ page }) => {
      await loginWith(page, user)
      await expect(page.getByText('Tero Testeri logged in')).toBeVisible()
    })

    test('wrong credentials, login failed', async ({ page }) => {

      const errorDiv = await page.locator('.error')
      await loginWith(page, wrongUser)
      await expect(errorDiv).toContainText('Wrong username or password')
      await expect(page.getByText('Tero Testeri logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach( async ({ page }) => {
      await loginWith(page, user)

      await page.getByRole('button', { name: 'New blog'}).click()
      await page.getByTestId('title').fill('My new blog')
      await page.getByTestId('author').fill('Bruno Bloggaaja')
      await page.getByTestId('url').fill('https://www.brunoblogger.com/blog1')
      await page.getByRole('button', { name: 'create blog'}).click()
    })

    test('a new blog can be created', async ({ page }) => {
      await expect(page.getByText('My new blog Bruno Bloggaaja')).toBeVisible()
    })

    test('Blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      await expect(page.getByText('likes 0')).toBeVisible()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('likes 1')).toBeVisible()
    })
  })

 
})

