const loginWith = async (page, user) => {
    await page.getByTestId('username').fill(user.username)
    await page.getByTestId('password').fill(user.password)
    await page.getByRole('button', { name: 'login' }).click() 
}

export { loginWith }