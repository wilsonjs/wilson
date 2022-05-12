import { createServer as createViteServer } from 'vite'
import { getViteConfig } from '../vite.js'
import fs from 'fs-extra'
import { initializePageSources } from '../state.js'
import PrettyError from 'pretty-error'
import { AddressInfo } from 'node:net'
import chalk from 'chalk'
import os from 'os'
import { NetworkInterfaceInfo } from 'node:os'

const getNetworkAddress = () => {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const { address, family, internal } of interfaces[
      name
    ] as NetworkInterfaceInfo[]) {
      if (family === 'IPv4' && !internal) {
        return address
      }
    }
  }
}

export async function startDevServer(
  root: string = process.cwd()
): Promise<void> {
  try {
    await fs.emptyDir(`${root}/.wilson`)
    await initializePageSources(`${root}/src/pages`)

    const config = await getViteConfig({ ssr: false })
    const devServer = await createViteServer(config)

    devServer.httpServer?.on('listening', () => {
      const port = (devServer.httpServer?.address() as AddressInfo).port
      console.log(`  ${chalk.green('Serving development build at:')}

  > Local:    ${chalk.cyan(`http://localhost:${chalk.bold(port)}`)}
  > Network:  ${chalk.cyan(`http://${getNetworkAddress()}:${chalk.bold(port)}`)}
      `)
    })
    await devServer.listen()
  } catch (e) {
    const pe = new PrettyError()
    console.error(pe.render(e as Error))
  }
}
