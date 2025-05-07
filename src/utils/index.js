export async function registryToE2C(port) {
  const proxyIp = process.env.PROXY_IP;
  console.log(process.env.PRIVATE_IP_ADDRESS, process.env.PUBLIC_IP_ADDRESS, proxyIp);
  while (true) {
    if (!globalThis.lastFetchTs || Date.now() - globalThis.lastFetchTs > 5000) {
      try {
        const data = await fetch(`http://${proxyIp}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            privateIpAddress: process.env.PRIVATE_IP_ADDRESS,
            publicIpAddress: process.env.PUBLIC_IP_ADDRESS,
            port,
            name: process.env.NAME,
          }),
        })
        console.log(await data.json());
      } catch (error) {
        console.log(error);
      }
    }

    await sleep(5000);
  }
}


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
