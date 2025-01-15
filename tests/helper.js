const loginWith = async (page, user) => {
    await page.getByTestId('username').fill(user.username)
    await page.getByTestId('password').fill(user.password)
    await page.getByRole('button', { name: 'login' }).click() 
}

const createBlog = async (page, title, author, url) => {
    await page.getByRole('button', {name: 'New blog'} ).click()
    await page.getByTestId('title').fill(title)
    await page.getByTestId('author').fill(author)
    await page.getByTestId('url').fill(url)
    await page.getByRole('button', { name: 'create blog' }).click() 
}

export { loginWith, createBlog }