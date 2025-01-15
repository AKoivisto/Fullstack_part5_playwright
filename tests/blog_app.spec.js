// @ts-check
const { test, expect, describe, beforeEach } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')



describe('Blog app', () => {

  const user = {
    username: 'terotee',
    password: 'testero'
  }
  
  const wrongUser = {
    username: 'terotes',
    password: 'teropitkamaki'
  }

  const anotherUser = {
    username: 'teija',
    password: 'testeija'
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
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Teija Testeri',
        username: 'teija',
        password: 'testeija'
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
      await createBlog(page, 'My new blog', 'Bruno Bloggaaja', 'https://www.brunoblogger.com/blog1')
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

    test('Blog can be deleted', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Remove')
        await dialog.accept()
      })
      await page.getByRole('button', { name: 'delete'}).click()
      await expect(page.getByText('My new blog Bruno Bloggaaja')).not.toBeVisible()
      
    })

    test('Not deleting blog if cancel is pressed when confirming deletion', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      page.on('dialog', async dialog => {
        expect(dialog.message()).toContain('Remove')
        await dialog.dismiss()
      })
      await page.getByRole('button', { name: 'delete'}).click()
      await expect(page.getByText('My new blog Bruno Bloggaaja')).toBeVisible()
      
    })

    test('Blogs are sorted by likes, in descending order', async ( {page}) => {
      test.setTimeout(10000)

      await createBlog(page, 'Second blog', 'Tero', 'http://www.toinen.com')
      await createBlog(page, 'Third blog 3', 'Teija', 'https://ww.teija.ax')
      await expect(page.getByText('Third blog 3 Teija')).toBeVisible()
      await expect(page.getByText('Second blog Tero')).toBeVisible()
      await expect(page.getByText('My new blog Bruno Bloggaaja')).toBeVisible()

      const blog2 = page.locator('text=Second blog Tero').locator('..')
      await blog2.getByRole('button', { name: 'view'}).click()
      await blog2.getByRole('button', { name: 'like'}).click()
      await blog2.getByText('likes 1').waitFor()
      await blog2.getByRole('button', { name: 'like'}).click()
      await blog2.getByText('likes 2').waitFor()
      await expect(blog2.getByText('likes 2')).toBeVisible()

      const blog3 = page.locator('text=third blog 3 Teija').locator('..')
      await blog3.getByRole('button', { name: 'view'}).click()
      await blog3.getByRole('button', { name: 'like'}).click()
      await blog3.getByText('likes 1').waitFor()
      await expect(blog3.getByText('likes 1')).toBeVisible()
      await page.waitForTimeout(500)
      //const blog1 = page.locator('text=My new blog Bruno Bloggaaja').locator('..')
  
      await expect(page.locator('.blog').nth(0)).toContainText('Second blog Tero')
      await expect(page.locator('.blog').nth(1)).toContainText('Third blog 3 Teija')
      await expect(page.locator('.blog').nth(2)).toContainText('My new blog Bruno Bloggaaja')

    })
  })

  describe('Another user', () => {
    beforeEach( async ({ page }) => {
      await loginWith(page, anotherUser)
  })

  test('Delete-button is only visible to user who added blog', async ({ page }) => {

    await createBlog(page,'Teijan tehonurkkaus', 'Teija Testeri', 'https://www.teijatest.ax/test')
    await page.getByRole('button', { name: 'view'}).click()
    await expect(page.getByText('delete blog')).toBeVisible()
    await page.getByRole('button', { name: 'log out'}).click()
    await page.reload()
    await loginWith(page, user)
    await page.getByRole('button', { name: 'view'}).click() 
    await expect(page.getByText('delete blog')).not.toBeVisible()
    await expect(page.getByText('likes 0')).toBeVisible()

  })
})
})