export const httpService = (() => {
    async function request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });

            const text = await response.text();
            
            // Parse JSON de forma segura
            let json;
            try {
                json = JSON.parse(text);
            } catch (err) {
                json = text; // fallback: devolver texto si no es JSON
            }

            if (!response.ok) {
                return {
                    success: false,
                    error: text
                };
            }

            return {
                success: true,
                data: json
            };
        } catch (err) {
            console.error("HTTP Error:", err);
            return {
                success: false,
                error: "Error de conexión"
            };
        }
    }

    function get(url) {
        return request(url, { method: 'GET' });
    }

    function post(url, body) {
        return request(url, { method: 'POST', body: JSON.stringify(body) });
    }

    function put(url, body) {
        return request(url, { method: 'PUT', body: JSON.stringify(body) });
    }

    function del(url) {
        return request(url, { method: 'DELETE' });
    }

    return { get, post, put, del };
})();
