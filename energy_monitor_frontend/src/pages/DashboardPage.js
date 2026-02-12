import React, { useEffect, useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../auth/AuthContext';

/**
 * @param {string} iso
 * @return {string}
 */
function fmtTime(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * @return {JSX.Element}
 */
export function DashboardPage() {
    const auth = useAuth();

    const [summary, setSummary] = useState(null);
    const [readings, setReadings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chartData = useMemo(() => readings.map((r) => ({
        t: fmtTime(r.ts),
        watts: r.watts,
    })), [readings]);

    useEffect(() => {
        async function load() {
            setError('');
            setIsLoading(true);
            try {
                const [s, r] = await Promise.all([
                    auth.api.getSummary(auth.token),
                    auth.api.listReadings(auth.token, { limit: 60 }),
                ]);
                setSummary(s);
                setReadings(r);
            } catch (e) {
                setError(e.message || 'Failed to load dashboard.');
            } finally {
                setIsLoading(false);
            }
        }
        load();
    }, [auth]);

    return (
        <div className="grid">
            <div className="panel col-12">
                <div className="panel-title">Dashboard</div>
                <div className="panel-subtitle">Real-time snapshot + recent power trace.</div>

                {error ? <div className="notice">{error}</div> : null}

                <div className="kpi-row">
                    <div className="kpi">
                        <div className="kpi-label">Devices</div>
                        <div className="kpi-value">{summary ? summary.devices_count : (isLoading ? '…' : '—')}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-label">Last 24h (kWh)</div>
                        <div className="kpi-value">{summary ? summary.kwh_24h.toFixed(2) : (isLoading ? '…' : '—')}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-label">Current (W)</div>
                        <div className="kpi-value">{summary ? Math.round(summary.current_watts) : (isLoading ? '…' : '—')}</div>
                    </div>
                    <div className="kpi">
                        <div className="kpi-label">Alerts enabled</div>
                        <div className="kpi-value">{summary ? summary.alerts_enabled_count : (isLoading ? '…' : '—')}</div>
                    </div>
                </div>
            </div>

            <div className="panel col-12">
                <div className="panel-title">Recent power (W)</div>
                <div className="panel-subtitle">Last {readings.length} samples.</div>

                <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <XAxis dataKey="t" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Line type="monotone" dataKey="watts" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
