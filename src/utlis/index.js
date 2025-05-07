export async function registryToE2C() {
  const e2cIp = process.env.E2C_IP;

  while (true) {
    fetch(e2cIp, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        privateIpAddress: process.env.PRIVATE_IP_ADDRESS,
        publicIpAddress: process.env.PUBLIC_IP_ADDRESS,
      }),
    })
    await sleep(5000);
  }
}


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
