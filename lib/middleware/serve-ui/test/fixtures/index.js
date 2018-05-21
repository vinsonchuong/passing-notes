/* @flow */

async function run(text: string): Promise<void> {
  await new Promise(resolve => {
    setTimeout(resolve, 1000)
  })

  window.root.textContent = text
}
run('Hello World!')
