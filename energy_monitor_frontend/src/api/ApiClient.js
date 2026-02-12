/**
 * Lightweight fetch-based API client.
 */
export class ApiClient {
    /**
     * @param {string} baseUrl
     */
    constructor(baseUrl) {
        this.baseUrl_ = baseUrl.replace(/\/+$/, '');
    }

    /**
     * @param {string} path
     * @param {{method?: string, token?: (string|null), body?: (Object|null)}} options
     * @return {Promise<any>}
     */
    async request(path, options = {}) {
        const method = options.method || 'GET';
        const headers = /** @type {Record<string, string>} */ ({
            'Content-Type': 'application/json',
        });

        if (options.token) {
            headers.Authorization = `Bearer ${options.token}`;
        }

        const resp = await fetch(`${this.baseUrl_}${path}`, {
            method,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const text = await resp.text();
        const data = text ? JSON.parse(text) : null;

        if (!resp.ok) {
            const msg = data && data.detail ? data.detail : `Request failed (${resp.status})`;
            throw new Error(msg);
        }
        return data;
    }

    /**
     * @param {{email: string, password: string}} payload
     * @return {Promise<{access_token: string, token_type: string}>}
     */
    async login(payload) {
        return this.request('/auth/login', { method: 'POST', body: payload });
    }

    /**
     * @param {{email: string, password: string}} payload
     * @return {Promise<{id: string, email: string}>}
     */
    async signup(payload) {
        return this.request('/auth/signup', { method: 'POST', body: payload });
    }

    /**
     * @param {string} token
     * @return {Promise<{id: string, email: string}>}
     */
    async me(token) {
        return this.request('/auth/me', { token });
    }

    /**
     * @param {string} token
     * @return {Promise<Array<any>>}
     */
    async listDevices(token) {
        return this.request('/devices', { token });
    }

    /**
     * @param {string} token
     * @param {{name: string, location?: (string|undefined)}} payload
     * @return {Promise<any>}
     */
    async createDevice(token, payload) {
        return this.request('/devices', { method: 'POST', token, body: payload });
    }

    /**
     * @param {string} token
     * @param {string} deviceId
     * @return {Promise<void>}
     */
    async deleteDevice(token, deviceId) {
        await this.request(`/devices/${encodeURIComponent(deviceId)}`, { method: 'DELETE', token });
    }

    /**
     * @param {string} token
     * @param {{device_id?: string, start?: string, end?: string, limit?: number}} query
     * @return {Promise<Array<any>>}
     */
    async listReadings(token, query) {
        const params = new URLSearchParams();
        if (query.device_id) params.set('device_id', query.device_id);
        if (query.start) params.set('start', query.start);
        if (query.end) params.set('end', query.end);
        if (query.limit != null) params.set('limit', String(query.limit));
        const suffix = params.toString() ? `?${params.toString()}` : '';
        return this.request(`/readings${suffix}`, { token });
    }

    /**
     * @param {string} token
     * @return {Promise<any>}
     */
    async getSummary(token) {
        return this.request('/analytics/summary', { token });
    }

    /**
     * @param {string} token
     * @return {Promise<Array<any>>}
     */
    async listAlerts(token) {
        return this.request('/alerts', { token });
    }

    /**
     * @param {string} token
     * @param {{device_id: string, threshold_watts: number, enabled: boolean}} payload
     * @return {Promise<any>}
     */
    async createAlert(token, payload) {
        return this.request('/alerts', { method: 'POST', token, body: payload });
    }

    /**
     * @param {string} token
     * @param {string} alertId
     * @return {Promise<void>}
     */
    async deleteAlert(token, alertId) {
        await this.request(`/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE', token });
    }
}
