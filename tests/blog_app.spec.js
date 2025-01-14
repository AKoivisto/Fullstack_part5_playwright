// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith } = require('./helper')

describe('Blog app', () => {
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
    const user = {
      username: 'terotee',
      password: 'testero'
    }

    const wrongUser = {
      username: 'terotes',
      password: 'teropitkamaki'
    }

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

 
})

