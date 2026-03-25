import React, { useState, useEffect } from "react";
import ApiService from "../../service/ApiService";
import "../../style/adminRevenueReport.css";

const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
    "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

const AdminRevenueReport = () => {
    const [orders, setOrders] = useState([]);
    const [filterType, setFilterType] = useState("month"); // month | year | range
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [rangeStart, setRangeStart] = useState("");
    const [rangeEnd, setRangeEnd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await ApiService.getAllOrders();
            setOrders(res.orderItemList || []);
        } catch (e) {
            setError("Không thể tải dữ liệu đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    // Filter orders that are CONFIRMED or SHIPPED (doanh thu thực)
    const paidOrders = orders.filter(o =>
        o.status === "CONFIRMED" || o.status === "SHIPPED" || o.status === "RETURNED"
    );

    const filterOrders = () => {
        if (filterType === "month") {
            return paidOrders.filter(o => {
                const d = new Date(o.createdAt);
                return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
            });
        }
        if (filterType === "year") {
            return paidOrders.filter(o => new Date(o.createdAt).getFullYear() === selectedYear);
        }
        if (filterType === "range" && rangeStart && rangeEnd) {
            const start = new Date(rangeStart);
            const end = new Date(rangeEnd);
            end.setHours(23, 59, 59);
            return paidOrders.filter(o => {
                const d = new Date(o.createdAt);
                return d >= start && d <= end;
            });
        }
        return paidOrders;
    };

    const filtered = filterOrders();
    const totalRevenue = filtered.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalOrders = filtered.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Build chart data — group by day (month view) or month (year view)
    const buildChartData = () => {
        if (filterType === "month") {
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            const data = Array.from({ length: daysInMonth }, (_, i) => ({ label: `${i + 1}`, value: 0 }));
            filtered.forEach(o => {
                const day = new Date(o.createdAt).getDate() - 1;
                data[day].value += o.price || 0;
            });
            return data;
        }
        if (filterType === "year") {
            const data = MONTHS.map(m => ({ label: m.replace("Tháng ", "T"), value: 0 }));
            filtered.forEach(o => {
                const month = new Date(o.createdAt).getMonth();
                data[month].value += o.price || 0;
            });
            return data;
        }
        // range: generate all dates from rangeStart to rangeEnd
        if (rangeStart && rangeEnd) {
            const start = new Date(rangeStart);
            const end = new Date(rangeEnd);
            const data = [];
            const current = new Date(start);
            
            while (current <= end) {
                const dateStr = current.toLocaleDateString("vi-VN");
                data.push({ label: dateStr, value: 0 });
                current.setDate(current.getDate() + 1);
            }
            
            filtered.forEach(o => {
                const key = new Date(o.createdAt).toLocaleDateString("vi-VN");
                const item = data.find(d => d.label === key);
                if (item) item.value += o.price || 0;
            });
            
            return data;
        }
        return [];
    };

    const chartData = buildChartData();
    const maxVal = Math.max(...chartData.map(d => d.value), 1);

    // Status breakdown
    const statusCount = {};
    filtered.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });

    return (
        <div className="revenue-report">
            <div className="revenue-header">
                <h2>Báo cáo doanh thu</h2>
            </div>

            {/* FILTER BAR */}
            <div className="revenue-filters">
                <div className="filter-tabs">
                    {["month", "year", "range"].map(t => (
                        <button
                            key={t}
                            className={`filter-tab ${filterType === t ? "active" : ""}`}
                            onClick={() => setFilterType(t)}
                        >
                            {t === "month" ? "Theo tháng" : t === "year" ? "Theo năm" : "Khoảng ngày"}
                        </button>
                    ))}
                </div>

                <div className="filter-controls">
                    {filterType === "month" && (
                        <>
                            <select value={selectedMonth} onChange={e => setSelectedMonth(+e.target.value)}>
                                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </>
                    )}
                    {filterType === "year" && (
                        <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    )}
                    {filterType === "range" && (
                        <>
                            <input 
                                type="date" 
                                value={rangeStart} 
                                onChange={e => {
                                    setRangeStart(e.target.value);
                                    if (!e.target.value) setRangeEnd('');
                                }} 
                            />
                            <span>đến</span>
                            <input 
                                type="date" 
                                value={rangeEnd} 
                                onChange={e => setRangeEnd(e.target.value)} 
                                min={rangeStart}
                                max={rangeStart ? new Date(new Date(rangeStart).getFullYear(), new Date(rangeStart).getMonth() + 1, 0).toISOString().split('T')[0] : ''}
                                disabled={!rangeStart}
                            />
                        </>
                    )}
                </div>
            </div>

            {error && <p className="revenue-error">{error}</p>}
            {loading && <p className="revenue-loading">Đang tải...</p>}

            {/* STAT CARDS */}
            <div className="stat-cards">
                <div className="stat-card">
                    <span className="stat-label">Tổng doanh thu</span>
                    <span className="stat-value revenue">{totalRevenue.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Số đơn hàng</span>
                    <span className="stat-value">{totalOrders}</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Trung bình / đơn</span>
                    <span className="stat-value">{avgOrder.toLocaleString("vi-VN", { maximumFractionDigits: 0 })} ₫</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Tổng đơn (tất cả)</span>
                    <span className="stat-value">{orders.length}</span>
                </div>
            </div>

            {/* BAR CHART */}
            <div className="chart-section">
                <h3>Biểu đồ doanh thu</h3>
                <div className="bar-chart-wrapper">
                    <div className="bar-chart">
                        {chartData.map((d, i) => (
                            <div key={i} className="bar-col">
                                <div className="bar-tooltip">{d.value.toLocaleString("vi-VN")} ₫</div>
                                <div
                                    className="bar"
                                    style={{ height: `${(d.value / maxVal) * 180}px` }}
                                />
                                <span className="bar-label">{d.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* STATUS BREAKDOWN */}
            <div className="status-breakdown">
                <h3>Phân loại trạng thái</h3>
                <div className="status-pills">
                    {Object.entries(statusCount).map(([status, count]) => (
                        <div key={status} className={`status-pill status-${status.toLowerCase()}`}>
                            <span>{status}</span>
                            <strong>{count}</strong>
                        </div>
                    ))}
                    {Object.keys(statusCount).length === 0 && (
                        <p className="no-data">Không có dữ liệu trong khoảng thời gian này</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminRevenueReport;
