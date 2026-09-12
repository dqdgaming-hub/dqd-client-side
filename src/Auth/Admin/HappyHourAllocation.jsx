import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { adminApi } from "../api/adminapi";
import AdminLayout from "./AdminLayout";

// ============================================================
// DESIGN TOKENS — matches DQD cyberpunk admin system
// ============================================================
const TOKENS = {
    void: "#05050a",
    panel: "#0b0b14",
    panelAlt: "#0f0f1a",
    cyan: "#00ffe1",
    pink: "#ff006e",
    yellow: "#f5ff00",
    line: "rgba(0,255,225,0.18)",
    lineSoft: "rgba(255,255,255,0.06)",
    textDim: "rgba(230,240,245,0.55)",
    danger: "#ff2d55",
};

const emptyForm = {
    date: "",
    start_time: "",
    end_time: "",
    offer_percentage: 0,
    loyalty_points: 0,
    is_free: false,
    max_bookings: 1,
    is_active: true,
    notes: "",
};

const emptyFilters = {
    date: "",
    activeOnly: false,
};

// chamfered clip-path helper (cuts corners, DQD signature look)
const CHAMFER = "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)";
const CHAMFER_SM = "polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)";

const HappyHourAllocation = () => {
    const [allocations, setAllocations] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [filters, setFilters] = useState(emptyFilters);

    // --------------------------------
    // Load allocations
    // --------------------------------
    const loadAllocations = async (activeFilters = filters) => {
        try {
            setLoading(true);
            setError("");

            const params = {};
            if (activeFilters.date) params.date = activeFilters.date;
            if (activeFilters.activeOnly) params.is_active = true;

            const data = await adminApi.fetchHappyHourAllocations(params);
            setAllocations(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load happy hour allocations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --------------------------------
    // Filters
    // --------------------------------
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const applyFilters = (e) => {
        e.preventDefault();
        loadAllocations(filters);
    };

    const clearFilters = () => {
        setFilters(emptyFilters);
        loadAllocations(emptyFilters);
    };

    // --------------------------------
    // Handle input
    // --------------------------------
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // --------------------------------
    // Submit
    // --------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            if (editingId) {
                await adminApi.editHappyHourAllocation(editingId, form);
            } else {
                await adminApi.addHappyHourAllocation(form);
            }

            setForm(emptyForm);
            setEditingId(null);
            await loadAllocations();
        } catch (err) {
            console.error(err);
            const responseData = err.response?.data;
            if (responseData) {
                setError(Object.values(responseData).flat().join(" "));
            } else {
                setError("Something went wrong.");
            }
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // Edit
    // --------------------------------
    const handleEdit = (allocation) => {
        setEditingId(allocation.id);
        setForm({
            date: allocation.date,
            start_time: allocation.start_time,
            end_time: allocation.end_time,
            offer_percentage: allocation.offer_percentage,
            loyalty_points: allocation.loyalty_points,
            is_free: allocation.is_free,
            max_bookings: allocation.max_bookings,
            is_active: allocation.is_active,
            notes: allocation.notes || "",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // --------------------------------
    // Delete (chamfered confirm modal instead of window.confirm)
    // --------------------------------
    const requestDelete = (id) => setDeleteTarget(id);

    const confirmDelete = async () => {
        const id = deleteTarget;
        setDeleteTarget(null);
        try {
            setLoading(true);
            await adminApi.removeHappyHourAllocation(id);
            await loadAllocations();
        } catch (err) {
            console.error(err);
            setError("Failed to delete allocation.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------
    // Cancel edit
    // --------------------------------
    const handleCancel = () => {
        setEditingId(null);
        setForm(emptyForm);
        setError("");
    };

    const isUpcoming = (date, endTime) => {
        if (!date) return false;
        const end = new Date(`${date}T${endTime || "23:59"}`);
        return end.getTime() >= Date.now();
    };

    return (
        <AdminLayout>
            <div className="hh-root">
                {/* ============================= */}
                {/* HEADER */}
                {/* ============================= */}
                <motion.div
                    className="hh-header"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="hh-header-glyph" aria-hidden="true">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                            <path d="M13 2 3 14h7l-1 8 11-14h-8l1-6z" fill="currentColor" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="hh-title">
                            HAPPY HOUR <span>ALLOCATIONS</span>
                        </h2>
                        <p className="hh-subtitle">
                            Configure timed offer windows &amp; loyalty drops
                        </p>
                    </div>
                    <div className="hh-header-stat">
                        <span className="hh-header-stat-num">{allocations.length}</span>
                        <span className="hh-header-stat-label">Total Slots</span>
                    </div>
                </motion.div>

                {/* ============================= */}
                {/* FILTER BAR */}
                {/* ============================= */}
                <motion.form
                    onSubmit={applyFilters}
                    className="hh-filter-bar"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.02 }}
                >
                    <span className="hh-form-tag hh-filter-tag">// FILTER</span>

                    <div className="hh-filter-field">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <label className={`hh-toggle hh-filter-toggle ${filters.activeOnly ? "is-on" : ""}`}>
                        <input
                            type="checkbox"
                            name="activeOnly"
                            checked={filters.activeOnly}
                            onChange={handleFilterChange}
                        />
                        <span className="hh-toggle-track">
                            <span className="hh-toggle-thumb" />
                        </span>
                        Active Only
                    </label>

                    <div className="hh-filter-actions">
                        <button type="submit" className="hh-btn hh-btn-primary hh-btn-sm">
                            APPLY
                        </button>
                        <button
                            type="button"
                            className="hh-btn hh-btn-ghost hh-btn-sm"
                            onClick={clearFilters}
                        >
                            CLEAR
                        </button>
                    </div>
                </motion.form>

                {/* ============================= */}
                {/* FORM */}
                {/* ============================= */}
                <motion.form
                    onSubmit={handleSubmit}
                    className="hh-form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                >
                    <div className="hh-form-head">
                        <span className="hh-form-tag">
                            {editingId ? "// EDIT MODE" : "// NEW ALLOCATION"}
                        </span>
                        {editingId && (
                            <span className="hh-form-editing-id">ID: {editingId}</span>
                        )}
                    </div>

                    <div className="hh-grid">
                        <div className="hh-field">
                            <label>Date</label>
                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="hh-field">
                            <label>Start Time</label>
                            <input
                                type="time"
                                name="start_time"
                                value={form.start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="hh-field">
                            <label>End Time</label>
                            <input
                                type="time"
                                name="end_time"
                                value={form.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="hh-field">
                            <label>Offer %</label>
                            <input
                                type="number"
                                name="offer_percentage"
                                value={form.offer_percentage}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                required
                            />
                        </div>

                        <div className="hh-field">
                            <label>Loyalty Points</label>
                            <input
                                type="number"
                                name="loyalty_points"
                                value={form.loyalty_points}
                                onChange={handleChange}
                                min="0"
                                required
                            />
                        </div>

                        <div className="hh-field">
                            <label>Max Bookings</label>
                            <input
                                type="number"
                                name="max_bookings"
                                value={form.max_bookings}
                                onChange={handleChange}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="hh-toggles">
                        <label className={`hh-toggle ${form.is_free ? "is-on" : ""}`}>
                            <input
                                type="checkbox"
                                name="is_free"
                                checked={form.is_free}
                                onChange={handleChange}
                            />
                            <span className="hh-toggle-track">
                                <span className="hh-toggle-thumb" />
                            </span>
                            Free Slot
                        </label>

                        <label className={`hh-toggle ${form.is_active ? "is-on" : ""}`}>
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={form.is_active}
                                onChange={handleChange}
                            />
                            <span className="hh-toggle-track">
                                <span className="hh-toggle-thumb" />
                            </span>
                            Active
                        </label>
                    </div>

                    <div className="hh-field hh-field-full">
                        <label>Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Optional notes..."
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="hh-error"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="hh-actions">
                        <motion.button
                            type="submit"
                            className="hh-btn hh-btn-primary"
                            disabled={loading}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                        >
                            {loading ? "SYNCING..." : editingId ? "UPDATE SLOT" : "CREATE SLOT"}
                        </motion.button>

                        {editingId && (
                            <motion.button
                                type="button"
                                className="hh-btn hh-btn-ghost"
                                onClick={handleCancel}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                CANCEL
                            </motion.button>
                        )}
                    </div>
                </motion.form>

                {/* ============================= */}
                {/* TABLE (desktop) / CARDS (mobile) */}
                {/* ============================= */}
                <motion.div
                    className="hh-list-section"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="hh-list-head">
                        <span className="hh-form-tag">// ACTIVE SCHEDULE</span>
                    </div>

                    {loading && allocations.length === 0 ? (
                        <div className="hh-empty">
                            <div className="hh-scan-line" />
                            LOADING ALLOCATIONS...
                        </div>
                    ) : allocations.length === 0 ? (
                        <div className="hh-empty">NO HAPPY HOUR ALLOCATIONS FOUND</div>
                    ) : (
                        <>
                            {/* Desktop table */}
                            <div className="hh-table-wrap">
                                <table className="hh-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Offer</th>
                                            <th>Free</th>
                                            <th>Loyalty</th>
                                            <th>Max</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence>
                                            {allocations.map((a) => (
                                                <motion.tr
                                                    key={a.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className={
                                                        !isUpcoming(a.date, a.end_time) ? "is-past" : ""
                                                    }
                                                >
                                                    <td>{a.date}</td>
                                                    <td className="hh-mono">
                                                        {a.start_time} — {a.end_time}
                                                    </td>
                                                    <td>
                                                        <span className="hh-chip hh-chip-cyan">
                                                            {a.offer_percentage}%
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {a.is_free ? (
                                                            <span className="hh-chip hh-chip-yellow">YES</span>
                                                        ) : (
                                                            <span className="hh-dim">—</span>
                                                        )}
                                                    </td>
                                                    <td className="hh-mono">{a.loyalty_points}</td>
                                                    <td className="hh-mono">{a.max_bookings}</td>
                                                    <td>
                                                        <span
                                                            className={`hh-status ${
                                                                a.is_active ? "is-active" : "is-inactive"
                                                            }`}
                                                        >
                                                            <i />
                                                            {a.is_active ? "ACTIVE" : "INACTIVE"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="hh-row-actions">
                                                            <button
                                                                type="button"
                                                                className="hh-icon-btn"
                                                                onClick={() => handleEdit(a)}
                                                                title="Edit"
                                                            >
                                                                <svg
                                                                    width="15"
                                                                    height="15"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.7"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="hh-icon-btn hh-icon-btn-danger"
                                                                onClick={() => requestDelete(a.id)}
                                                                title="Delete"
                                                            >
                                                                <svg
                                                                    width="15"
                                                                    height="15"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                >
                                                                    <path
                                                                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"
                                                                        stroke="currentColor"
                                                                        strokeWidth="1.7"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile cards */}
                            <div className="hh-cards">
                                <AnimatePresence>
                                    {allocations.map((a) => (
                                        <motion.div
                                            key={a.id}
                                            className={`hh-card ${
                                                !isUpcoming(a.date, a.end_time) ? "is-past" : ""
                                            }`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="hh-card-top">
                                                <span className="hh-card-date">{a.date}</span>
                                                <span
                                                    className={`hh-status ${
                                                        a.is_active ? "is-active" : "is-inactive"
                                                    }`}
                                                >
                                                    <i />
                                                    {a.is_active ? "ACTIVE" : "INACTIVE"}
                                                </span>
                                            </div>
                                            <div className="hh-card-time hh-mono">
                                                {a.start_time} — {a.end_time}
                                            </div>
                                            <div className="hh-card-chips">
                                                <span className="hh-chip hh-chip-cyan">
                                                    {a.offer_percentage}% OFF
                                                </span>
                                                {a.is_free && (
                                                    <span className="hh-chip hh-chip-yellow">FREE</span>
                                                )}
                                                <span className="hh-chip hh-chip-pink">
                                                    {a.loyalty_points} PTS
                                                </span>
                                                <span className="hh-chip">MAX {a.max_bookings}</span>
                                            </div>
                                            {a.notes && <p className="hh-card-notes">{a.notes}</p>}
                                            <div className="hh-row-actions hh-card-actions">
                                                <button
                                                    type="button"
                                                    className="hh-btn hh-btn-ghost hh-btn-sm"
                                                    onClick={() => handleEdit(a)}
                                                >
                                                    EDIT
                                                </button>
                                                <button
                                                    type="button"
                                                    className="hh-btn hh-btn-danger hh-btn-sm"
                                                    onClick={() => requestDelete(a.id)}
                                                >
                                                    DELETE
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </motion.div>

                {/* ============================= */}
                {/* DELETE CONFIRM MODAL */}
                {/* ============================= */}
                <AnimatePresence>
                    {deleteTarget && (
                        <motion.div
                            className="hh-modal-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDeleteTarget(null)}
                        >
                            <motion.div
                                className="hh-modal"
                                initial={{ opacity: 0, scale: 0.92, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3>DELETE ALLOCATION?</h3>
                                <p>This action cannot be undone. The slot will be permanently removed.</p>
                                <div className="hh-modal-actions">
                                    <button
                                        className="hh-btn hh-btn-ghost"
                                        onClick={() => setDeleteTarget(null)}
                                    >
                                        CANCEL
                                    </button>
                                    <button className="hh-btn hh-btn-danger" onClick={confirmDelete}>
                                        DELETE
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <style>{`
                    .hh-root {
                        --cyan: ${TOKENS.cyan};
                        --pink: ${TOKENS.pink};
                        --yellow: ${TOKENS.yellow};
                        --void: ${TOKENS.void};
                        --panel: ${TOKENS.panel};
                        --panel-alt: ${TOKENS.panelAlt};
                        --line: ${TOKENS.line};
                        --line-soft: ${TOKENS.lineSoft};
                        --text-dim: ${TOKENS.textDim};
                        --danger: ${TOKENS.danger};
                        font-family: 'Share Tech Mono', monospace;
                        color: #e7f7f5;
                        padding: 28px clamp(14px, 3vw, 32px) 60px;
                        max-width: 1240px;
                        margin: 0 auto;
                        position: relative;
                    }

                    .hh-root * { box-sizing: border-box; }

                    /* ---------- HEADER ---------- */
                    .hh-header {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        padding: 18px 22px;
                        margin-bottom: 24px;
                        background: linear-gradient(135deg, var(--panel) 0%, var(--void) 100%);
                        border: 1px solid var(--line);
                        clip-path: ${CHAMFER};
                        position: relative;
                        overflow: hidden;
                    }
                    .hh-header::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        background: linear-gradient(90deg, transparent, var(--cyan), transparent);
                        opacity: 0.6;
                        height: 1px;
                        top: 0;
                    }
                    .hh-header-glyph {
                        width: 44px;
                        height: 44px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: var(--void);
                        background: var(--yellow);
                        clip-path: ${CHAMFER_SM};
                        flex-shrink: 0;
                        box-shadow: 0 0 18px rgba(245,255,0,0.45);
                    }
                    .hh-title {
                        font-family: 'Orbitron', sans-serif;
                        font-weight: 700;
                        letter-spacing: 0.06em;
                        font-size: clamp(18px, 2.4vw, 24px);
                        color: #f2fffc;
                        margin: 0;
                        text-transform: uppercase;
                    }
                    .hh-title span { color: var(--cyan); text-shadow: 0 0 14px rgba(0,255,225,0.5); }
                    .hh-subtitle {
                        margin: 4px 0 0;
                        font-size: 12px;
                        color: var(--text-dim);
                        letter-spacing: 0.03em;
                    }
                    .hh-header-stat {
                        margin-left: auto;
                        text-align: right;
                        border-left: 1px solid var(--line);
                        padding-left: 18px;
                        display: none;
                    }
                    .hh-header-stat-num {
                        display: block;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 24px;
                        color: var(--pink);
                        text-shadow: 0 0 12px rgba(255,0,110,0.5);
                    }
                    .hh-header-stat-label {
                        font-size: 10px;
                        color: var(--text-dim);
                        letter-spacing: 0.08em;
                    }
                    @media (min-width: 560px) { .hh-header-stat { display: block; } }

                    /* ---------- FILTER BAR ---------- */
                    .hh-filter-bar {
                        display: flex;
                        align-items: center;
                        flex-wrap: wrap;
                        gap: 16px;
                        padding: 14px 20px;
                        margin-bottom: 22px;
                        background: var(--panel-alt);
                        border: 1px solid var(--line-soft);
                        clip-path: ${CHAMFER_SM};
                    }
                    .hh-filter-tag { flex-shrink: 0; }
                    .hh-filter-field {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .hh-filter-field label {
                        font-size: 11px;
                        letter-spacing: 0.06em;
                        color: var(--text-dim);
                        text-transform: uppercase;
                    }
                    .hh-filter-field input {
                        background: var(--panel);
                        border: 1px solid var(--line-soft);
                        color: #eafffb;
                        padding: 7px 10px;
                        font-family: 'Share Tech Mono', monospace;
                        font-size: 12.5px;
                        clip-path: ${CHAMFER_SM};
                        outline: none;
                    }
                    .hh-filter-field input:focus {
                        border-color: var(--cyan);
                        box-shadow: 0 0 0 1px var(--cyan);
                    }
                    .hh-filter-toggle { font-size: 11px; }
                    .hh-filter-actions {
                        display: flex;
                        gap: 8px;
                        margin-left: auto;
                    }

                    /* ---------- FORM ---------- */
                    .hh-form {
                        background: var(--panel);
                        border: 1px solid var(--line);
                        clip-path: ${CHAMFER};
                        padding: 22px clamp(16px, 3vw, 28px) 26px;
                        margin-bottom: 30px;
                        position: relative;
                    }
                    .hh-form-head {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 18px;
                        padding-bottom: 12px;
                        border-bottom: 1px dashed var(--line-soft);
                    }
                    .hh-form-tag {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 11px;
                        letter-spacing: 0.12em;
                        color: var(--cyan);
                    }
                    .hh-form-editing-id {
                        font-size: 11px;
                        color: var(--yellow);
                        letter-spacing: 0.05em;
                    }

                    .hh-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 16px 18px;
                    }
                    @media (min-width: 720px) {
                        .hh-grid { grid-template-columns: repeat(3, 1fr); }
                    }

                    .hh-field { display: flex; flex-direction: column; gap: 6px; }
                    .hh-field-full { margin-top: 18px; }
                    .hh-field label {
                        font-size: 11px;
                        letter-spacing: 0.08em;
                        color: var(--text-dim);
                        text-transform: uppercase;
                    }
                    .hh-field input,
                    .hh-field textarea {
                        background: var(--panel-alt);
                        border: 1px solid var(--line-soft);
                        color: #eafffb;
                        padding: 10px 12px;
                        font-family: 'Share Tech Mono', monospace;
                        font-size: 13px;
                        clip-path: ${CHAMFER_SM};
                        outline: none;
                        transition: border-color 0.2s, box-shadow 0.2s;
                        width: 100%;
                    }
                    .hh-field input:focus,
                    .hh-field textarea:focus {
                        border-color: var(--cyan);
                        box-shadow: 0 0 0 1px var(--cyan), 0 0 14px rgba(0,255,225,0.25);
                    }
                    .hh-field textarea { resize: vertical; min-height: 70px; }

                    /* ---------- TOGGLES ---------- */
                    .hh-toggles {
                        display: flex;
                        gap: 28px;
                        margin-top: 20px;
                        flex-wrap: wrap;
                    }
                    .hh-toggle {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        font-size: 12px;
                        letter-spacing: 0.05em;
                        color: var(--text-dim);
                        cursor: pointer;
                        user-select: none;
                    }
                    .hh-toggle input { display: none; }
                    .hh-toggle-track {
                        width: 38px;
                        height: 20px;
                        background: var(--panel-alt);
                        border: 1px solid var(--line-soft);
                        border-radius: 999px;
                        position: relative;
                        transition: border-color 0.2s, background 0.2s;
                    }
                    .hh-toggle-thumb {
                        position: absolute;
                        top: 2px;
                        left: 2px;
                        width: 14px;
                        height: 14px;
                        border-radius: 50%;
                        background: var(--text-dim);
                        transition: transform 0.25s ease, background 0.25s;
                    }
                    .hh-toggle.is-on { color: #eafffb; }
                    .hh-toggle.is-on .hh-toggle-track {
                        border-color: var(--cyan);
                        background: rgba(0,255,225,0.12);
                    }
                    .hh-toggle.is-on .hh-toggle-thumb {
                        transform: translateX(18px);
                        background: var(--cyan);
                        box-shadow: 0 0 8px rgba(0,255,225,0.7);
                    }

                    /* ---------- ERROR ---------- */
                    .hh-error {
                        margin-top: 18px;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        background: rgba(255,45,85,0.1);
                        border: 1px solid rgba(255,45,85,0.4);
                        color: #ff8fa3;
                        padding: 10px 14px;
                        font-size: 12px;
                        clip-path: ${CHAMFER_SM};
                        overflow: hidden;
                    }

                    /* ---------- BUTTONS ---------- */
                    .hh-actions {
                        display: flex;
                        gap: 12px;
                        margin-top: 22px;
                    }
                    .hh-btn {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 12px;
                        letter-spacing: 0.08em;
                        padding: 12px 22px;
                        border: 1px solid var(--cyan);
                        background: transparent;
                        color: var(--cyan);
                        cursor: pointer;
                        clip-path: ${CHAMFER_SM};
                        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
                    }
                    .hh-btn-sm { padding: 8px 14px; font-size: 10px; }
                    .hh-btn-primary {
                        background: var(--cyan);
                        color: var(--void);
                        box-shadow: 0 0 16px rgba(0,255,225,0.35);
                    }
                    .hh-btn-primary:hover { box-shadow: 0 0 24px rgba(0,255,225,0.6); }
                    .hh-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
                    .hh-btn-ghost {
                        border-color: var(--line-soft);
                        color: var(--text-dim);
                    }
                    .hh-btn-ghost:hover { border-color: var(--pink); color: var(--pink); }
                    .hh-btn-danger {
                        border-color: var(--danger);
                        color: var(--danger);
                        background: rgba(255,45,85,0.08);
                    }
                    .hh-btn-danger:hover {
                        background: var(--danger);
                        color: #0b0b14;
                        box-shadow: 0 0 16px rgba(255,45,85,0.5);
                    }

                    /* ---------- LIST SECTION ---------- */
                    .hh-list-head { margin-bottom: 14px; }
                    .hh-empty {
                        text-align: center;
                        padding: 50px 20px;
                        border: 1px dashed var(--line-soft);
                        color: var(--text-dim);
                        font-size: 12px;
                        letter-spacing: 0.08em;
                        clip-path: ${CHAMFER};
                        position: relative;
                        overflow: hidden;
                    }
                    .hh-scan-line {
                        position: absolute;
                        left: 0; right: 0; height: 2px;
                        background: linear-gradient(90deg, transparent, var(--cyan), transparent);
                        animation: hh-scan 1.6s linear infinite;
                        top: 0;
                    }
                    @keyframes hh-scan {
                        0% { top: 0; }
                        100% { top: 100%; }
                    }

                    /* ---------- TABLE (desktop) ---------- */
                    .hh-table-wrap {
                        display: none;
                        border: 1px solid var(--line);
                        clip-path: ${CHAMFER};
                        overflow: hidden;
                        background: var(--panel);
                    }
                    @media (min-width: 860px) { .hh-table-wrap { display: block; overflow-x: auto; } }

                    .hh-table { width: 100%; border-collapse: collapse; min-width: 760px; }
                    .hh-table thead tr { background: var(--panel-alt); }
                    .hh-table th {
                        text-align: left;
                        padding: 13px 16px;
                        font-family: 'Orbitron', sans-serif;
                        font-size: 10px;
                        letter-spacing: 0.1em;
                        color: var(--cyan);
                        border-bottom: 1px solid var(--line);
                        text-transform: uppercase;
                    }
                    .hh-table td {
                        padding: 13px 16px;
                        font-size: 12.5px;
                        border-bottom: 1px solid var(--line-soft);
                        color: #dff7f2;
                    }
                    .hh-table tr:hover td { background: rgba(0,255,225,0.03); }
                    .hh-table tr.is-past td { opacity: 0.45; }
                    .hh-mono { font-family: 'Share Tech Mono', monospace; letter-spacing: 0.02em; }
                    .hh-dim { color: var(--text-dim); }

                    .hh-chip {
                        display: inline-block;
                        padding: 3px 9px;
                        font-size: 10.5px;
                        letter-spacing: 0.04em;
                        border: 1px solid var(--line-soft);
                        color: var(--text-dim);
                        clip-path: ${CHAMFER_SM};
                    }
                    .hh-chip-cyan { border-color: var(--cyan); color: var(--cyan); background: rgba(0,255,225,0.08); }
                    .hh-chip-pink { border-color: var(--pink); color: var(--pink); background: rgba(255,0,110,0.08); }
                    .hh-chip-yellow { border-color: var(--yellow); color: var(--yellow); background: rgba(245,255,0,0.08); }

                    .hh-status {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        font-size: 10.5px;
                        letter-spacing: 0.06em;
                    }
                    .hh-status i {
                        width: 6px; height: 6px; border-radius: 50%;
                        display: inline-block;
                    }
                    .hh-status.is-active { color: var(--cyan); }
                    .hh-status.is-active i { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); }
                    .hh-status.is-inactive { color: var(--text-dim); }
                    .hh-status.is-inactive i { background: #555; }

                    .hh-row-actions { display: flex; gap: 8px; }
                    .hh-icon-btn {
                        width: 30px; height: 30px;
                        display: flex; align-items: center; justify-content: center;
                        background: var(--panel-alt);
                        border: 1px solid var(--line-soft);
                        color: var(--text-dim);
                        cursor: pointer;
                        clip-path: ${CHAMFER_SM};
                        transition: all 0.2s;
                    }
                    .hh-icon-btn:hover { border-color: var(--cyan); color: var(--cyan); }
                    .hh-icon-btn-danger:hover { border-color: var(--danger); color: var(--danger); }

                    /* ---------- CARDS (mobile) ---------- */
                    .hh-cards { display: flex; flex-direction: column; gap: 14px; }
                    @media (min-width: 860px) { .hh-cards { display: none; } }

                    .hh-card {
                        background: var(--panel);
                        border: 1px solid var(--line);
                        clip-path: ${CHAMFER};
                        padding: 16px 18px;
                    }
                    .hh-card.is-past { opacity: 0.5; }
                    .hh-card-top {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                    }
                    .hh-card-date { font-family: 'Orbitron', sans-serif; font-size: 13px; color: #f2fffc; }
                    .hh-card-time { font-size: 13px; color: var(--cyan); margin-bottom: 10px; }
                    .hh-card-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
                    .hh-card-notes {
                        font-size: 11.5px;
                        color: var(--text-dim);
                        border-top: 1px dashed var(--line-soft);
                        padding-top: 8px;
                        margin: 0 0 10px;
                    }
                    .hh-card-actions { justify-content: flex-end; }

                    /* ---------- DELETE MODAL ---------- */
                    .hh-modal-backdrop {
                        position: fixed;
                        inset: 0;
                        background: rgba(2,2,6,0.75);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 100;
                        padding: 20px;
                    }
                    .hh-modal {
                        width: 100%;
                        max-width: 380px;
                        background: var(--panel);
                        border: 1px solid var(--pink);
                        clip-path: ${CHAMFER};
                        padding: 24px;
                        box-shadow: 0 0 40px rgba(255,0,110,0.25);
                    }
                    .hh-modal h3 {
                        font-family: 'Orbitron', sans-serif;
                        font-size: 15px;
                        letter-spacing: 0.06em;
                        color: var(--pink);
                        margin: 0 0 10px;
                    }
                    .hh-modal p {
                        font-size: 12.5px;
                        color: var(--text-dim);
                        margin: 0 0 20px;
                        line-height: 1.5;
                    }
                    .hh-modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
                `}</style>
            </div>
        </AdminLayout>
    );
};

export default HappyHourAllocation;