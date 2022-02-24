export async function revalidate(domain: string, slug: any) {
  try {
    await fetch(`${domain}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urlPath: `/`
      })
    })
    await fetch(`${domain}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        urlPath: `/${slug}`
      })
    })
  } catch (e) {
    console.error(e)
  }
}
