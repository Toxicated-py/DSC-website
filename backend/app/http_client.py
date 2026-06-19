import httpx

global_http_client: httpx.AsyncClient | None = None

def get_http_client() -> httpx.AsyncClient:
    if global_http_client is None:
        raise RuntimeError("HTTP client is not initialized. Ensure app lifespan has run.")
    return global_http_client
