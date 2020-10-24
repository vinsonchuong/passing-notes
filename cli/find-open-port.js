import getPort from 'get-port'

export default function (...portsToTry) {
  return getPort({
    port: portsToTry.filter((n) => typeof n === 'number' && !Number.isNaN(n))
  })
}
