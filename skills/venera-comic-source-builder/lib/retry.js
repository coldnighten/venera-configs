const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_DELAY_MS = 2000;

async function retry(fn, options = {}) {
    const { 
        maxRetries = DEFAULT_MAX_RETRIES, 
        delayMs = DEFAULT_DELAY_MS,
        onRetry = null 
    } = options;
    
    let attempt = 0;
    let lastError = null;
    
    while (attempt < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            attempt++;
            
            if (onRetry) {
                onRetry(attempt, maxRetries, error);
            }
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            }
        }
    }
    
    throw lastError;
}

module.exports = {
    retry,
    DEFAULT_MAX_RETRIES,
    DEFAULT_DELAY_MS
};