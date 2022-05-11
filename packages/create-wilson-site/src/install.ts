import spawn from 'cross-spawn'

const install = (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const command = 'npm'
    const args = ['install', '--loglevel', 'error']

    const child = spawn(command, args, { stdio: 'inherit' })
    child.on('close', (code) => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`,
        })
        return
      }
      resolve()
    })
  })
}

export default install
