import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * @return {JSX.Element}
 */
export function AlertsPage() {
    const auth = useAuth();

    const [devices, setDevices] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [deviceId, setDeviceId] = useState('');
    const [thresholdWatts, setThresholdWatts] = useState('500');
    const [enabled, setEnabled] = useState(true);

    const deviceById = useMemo(() => {
        /** @type {Record<string, any>} */
        const m = {};
        devices.forEach((d) => {
            m[d.id] = d;
        });
        return m;
    }, [devices]);

    async function load() {
        setError('');
        setIsLoading(true);
        try {
            const [d, a] = await Promise.all([
                auth.api.listDevices(auth.token),
                auth.api.listAlerts(auth.token),
            ]);
            setDevices(d);
            setAlerts(a);
            if (!deviceId && d.length) {
                setDeviceId(d[0].id);
            }
        } catch (e) {
            setError(e.message || 'Failed to load alerts.');
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auth]);

    async function onAdd(e) {
        e.preventDefault();
        setError('');

        const t = Number(thresholdWatts);
        if (!deviceId) {
            setError('Choose a device.');
            return;
        }
        if (!Number.isFinite(t) || t <= 0) {
            setError('Threshold must be a positive number.');
            return;
        }

        try {
            await auth.api.createAlert(auth.token, { device_id: deviceId, threshold_watts: t, enabled });
            await load();
        } catch (err) {
            setError(err.message || 'Failed to create alert.');
        }
    }

    async function onDelete(id) {
        if (!window.confirm('Delete this alert?')) return;
        setError('');
        try {
            await auth.api.deleteAlert(auth.token, id);
            await load();
        } catch (err) {
            setError(err.message || 'Failed to delete alert.');
        }
    }

    return (
        <div className="grid">
            <div className="panel col-12">
                <div className="panel-title">Alerts</div>
                <div className="panel-subtitle">Configure simple threshold alerts per device.</div>

                {error ? <div className="notice">{error}</div> : null}

                <form className="form" onSubmit={onAdd}>
                    <div className="row">
                        <div className="field" style={{ flex: 1, minWidth: 220 }}>
                            <div className="label">Device</div>
                            <select className="select" value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                                {devices.map((d) => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field" style={{ width: 200 }}>
                            <div className="label">Threshold (W)</div>
                            <input
                                className="input"
                                value={thresholdWatts}
                                onChange={(e) => setThresholdWatts(e.target.value)}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="field" style={{ width: 180 }}>
                            <div className="label">Enabled</div>
                            <select className="select" value={enabled ? 'yes' : 'no'} onChange={(e) => setEnabled(e.target.value === 'yes')}>
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        <div className="field" style={{ alignSelf: 'end' }}>
                            <button className="btn" disabled={isLoading} type="submit">Add alert</button>
                        </div>
                    </div>
                </form>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Device</th>
                            <th>Threshold (W)</th>
                            <th>Enabled</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {alerts.map((a) => (
                            <tr key={a.id}>
                                <td>{deviceById[a.device_id] ? deviceById[a.device_id].name : a.device_id}</td>
                                <td>{Math.round(a.threshold_watts)}</td>
                                <td className="muted">{a.enabled ? 'Yes' : 'No'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button className="btn btn-danger btn-small" onClick={() => onDelete(a.id)} type="button">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!alerts.length && !isLoading ? (
                            <tr>
                                <td colSpan={4} className="muted">No alerts yet.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
