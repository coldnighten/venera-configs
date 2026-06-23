import asyncio

DEFAULT_MAX_RETRIES = 3
DEFAULT_DELAY_MS = 2000

async def retry(fn, max_retries=DEFAULT_MAX_RETRIES, delay_ms=DEFAULT_DELAY_MS, on_retry=None):
    attempt = 0
    last_error = None
    
    while attempt < max_retries:
        try:
            return await fn()
        except Exception as error:
            last_error = error
            attempt += 1
            
            if on_retry:
                await on_retry(attempt, max_retries, error)
            
            if attempt < max_retries:
                await asyncio.sleep(delay_ms * attempt / 1000)
    
    raise last_error