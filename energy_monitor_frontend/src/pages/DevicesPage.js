import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * @param {any} device
 * @return {string}
 */
function deviceLabel(device) {
    const loc = device.location ? ` • ${device.location}` : '';
    return `${device.name}${loc}`;
}

/**
 * @return {JSX.Element}
 */
export function DevicesPage() {
    const auth = useAuth();

    const [devices, setDevices] = useState([]);
    const [readings, setReadings] = useState([]);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');

    const lastReadingByDevice = useMemo(() => {
        /** @type {Record<string, any>} */
        const m = {};
        readings.forEach((r) => {
            if (!m[r.device_id]) {
                m[r.device_id] = r;
            }
        });
        return m;
    }, [readings]);

    const load = useCallback(async () => {
        setError('');
        setIsLoading(true);
        try {
            const [d, r] = await Promise.all([
                auth.api.listDevices(auth.token),
                auth.api.listReadings(auth.token, { limit: 200 }),
            ]);
            setDevices(d);
            setReadings(r);
        } catch (e) {
            setError(e.message || 'Failed to load devices.');
        } finally {
            setIsLoading(false);
        }
    }, [auth.api, auth.token]);

    useEffect(() => {
        load();
    }, [load]);

    async function onAddDevice(e) {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Device name is required.');
            return;
        }

        try {
            await auth.api.createDevice(auth.token, { name: name.trim(), location: location.trim() || undefined });
            setName('');
            setLocation('');
            await load();
        } catch (err) {
            setError(err.message || 'Failed to create device.');
        }
    }

    async function onDelete(id) {
        if (!window.confirm('Delete this device?')) {
            return;
        }
        setError('');
        try {
            await auth.api.deleteDevice(auth.token, id);
            await load();
        } catch (err) {
            setError(err.message || 'Failed to delete device.');
        }
    }

    return (
        <div className="grid">
            <div className="panel col-12">
                <div className="panel-title">Devices</div>
                <div className="panel-subtitle">Manage smart plugs/meters you track.</div>

                {error ? <div className="notice">{error}</div> : null}

                <form className="form" onSubmit={onAddDevice}>
                    <div className="row">
                        <div className="field" style={{ flex: 1, minWidth: 220 }}>
                            <div className="label">Name</div>
                            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="field" style={{ flex: 1, minWidth: 220 }}>
                            <div className="label">Location</div>
                            <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                        <div className="field" style={{ alignSelf: 'end' }}>
                            <button className="btn" disabled={isLoading} type="submit">
                                Add device
                            </button>
                        </div>
                    </div>
                </form>

                <table className="table">
                    <thead>
                        <tr>
                            <th>Device</th>
                            <th>Last sample</th>
                            <th>Watts</th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((d) => {
                            const last = lastReadingByDevice[d.id];
                            return (
                                <tr key={d.id}>
                                    <td>{deviceLabel(d)}</td>
                                    <td className="muted">{last ? new Date(last.ts).toLocaleString() : '—'}</td>
                                    <td>{last ? Math.round(last.watts) : '—'}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button className="btn btn-danger btn-small" onClick={() => onDelete(d.id)} type="button">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {!devices.length && !isLoading ? (
                            <tr>
                                <td colSpan={4} className="muted">No devices yet. Add one above.</td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
