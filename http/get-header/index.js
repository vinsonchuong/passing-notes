export default function (requestOrResponse, headerName) {
  const headers = requestOrResponse.headers
  if (!headers) {
    return null
  }

  for (const [name, value] of Object.entries(headers)) {
    if (name.toLowerCase() === headerName.toLowerCase()) {
      return value
    }
  }

  return null
}
