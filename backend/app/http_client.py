import httpx

global_http_client: httpx.AsyncClient | None = None

def get_http_client() -> httpx.AsyncClient:
    global global_http_client
    if global_http_client is None or global_http_client.is_closed:
        global_http_client = httpx.AsyncClient(timeout=20)
    return global_http_client


async def close_http_client() -> None:
    global global_http_client
    if global_http_client is not None and not global_http_client.is_closed:
        await global_http_client.aclose()
    global_http_client = None
