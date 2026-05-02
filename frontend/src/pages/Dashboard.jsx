import  { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        
        const fetchDashboard = async () => {
            try {
                const res = await API.get('/dashboard');
                if (isMounted) {
                    setDashboard(res.data.dashboard);
                }
            } catch (error) {
                console.error('Dashboard error:', error);
                if (error.response?.status === 401 && isMounted) {
                    logout();
                    navigate('/login');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDashboard();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div style={styles.container}>Loading...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Team Task Manager</h1>
                <div style={styles.headerRight}>
                    <div style={styles.navButtons}>
                        <button onClick={() => navigate('/dashboard')} style={styles.navBtnActive}>Dashboard</button>
                        <button onClick={() => navigate('/projects')} style={styles.navBtn}>Projects</button>
                    </div>
                    <div style={styles.userInfo}>
                        <span style={styles.userName}>Welcome, {user?.name} 👋</span>
                        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <h3>Total Projects</h3>
                    <p style={styles.statNumber}>{dashboard?.stats?.totalProjects || 0}</p>
                    <button onClick={() => navigate('/projects')} style={styles.statBtn}>View Projects →</button>
                </div>
                <div style={styles.statCard}>
                    <h3>Total Tasks</h3>
                    <p style={styles.statNumber}>{dashboard?.stats?.totalTasks || 0}</p>
                    <button onClick={() => {
                        if (dashboard?.stats?.totalProjects > 0) {
                            navigate('/projects');
                        } else {
                            alert('Create a project first to view tasks');
                        }
                    }} style={styles.statBtn}>View Tasks →</button>
                </div>
                <div style={styles.statCard}>
                    <h3>Todo</h3>
                    <p style={styles.statNumber}>{dashboard?.stats?.todoTasks || 0}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>In Progress</h3>
                    <p style={styles.statNumber}>{dashboard?.stats?.inProgressTasks || 0}</p>
                </div>
                <div style={styles.statCard}>
                    <h3>Completed</h3>
                    <p style={styles.statNumber}>{dashboard?.stats?.doneTasks || 0}</p>
                </div>
            </div>

            {/* Quick Action Cards */}
            <div style={styles.quickNavGrid}>
                <div style={styles.quickNavCard}>
                    <div style={styles.quickNavIcon}>📁</div>
                    <h3>Manage Projects</h3>
                    <p>Create, view, and delete projects</p>
                    <button onClick={() => navigate('/projects')} style={styles.quickNavBtn}>
                        Go to Projects →
                    </button>
                </div>
                <div style={styles.quickNavCard}>
                    <div style={styles.quickNavIcon}>✅</div>
                    <h3>Manage Tasks</h3>
                    <p>Create, update, and track tasks</p>
                    <button onClick={() => {
                        if (dashboard?.stats?.totalProjects > 0) {
                            navigate('/projects');
                        } else {
                            alert('Create a project first to add tasks');
                        }
                    }} style={styles.quickNavBtn}>
                        Go to Tasks →
                    </button>
                </div>
            </div>

            {/* Overdue Tasks */}
            <div style={styles.section}>
                <h2>⚠️ Overdue Tasks ({dashboard?.overdueTasks?.count || 0})</h2>
                {dashboard?.overdueTasks?.tasks?.length === 0 ? (
                    <p>No overdue tasks 🎉</p>
                ) : (
                    <ul style={styles.taskList}>
                        {dashboard?.overdueTasks?.tasks?.map(task => (
                            <li key={task.id} style={styles.overdueTask}>
                                <strong>{task.title}</strong> - {task.projectName} - Due: {new Date(task.dueDate).toLocaleDateString()}
                                <button 
                                    onClick={() => navigate(`/projects/${task.projectId}/tasks`)} 
                                    style={styles.taskLinkBtn}
                                >
                                    View Task →
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Recent Tasks */}
            <div style={styles.section}>
                <h2>📋 Recent Tasks</h2>
                {dashboard?.recentTasks?.length === 0 ? (
                    <p>No tasks yet. <button onClick={() => navigate('/projects')} style={styles.linkBtn}>Create a project first →</button></p>
                ) : (
                    <ul style={styles.taskList}>
                        {dashboard?.recentTasks?.map(task => (
                            <li key={task.id} style={styles.taskItem}>
                                <div>
                                    <strong>{task.title}</strong> - {task.projectName}
                                    <br />
                                    <small>Status: {task.status} | Due: {new Date(task.dueDate).toLocaleDateString()}</small>
                                </div>
                                <button 
                                    onClick={() => navigate(`/projects/${task.projectId}/tasks`)} 
                                    style={styles.taskLinkBtn}
                                >
                                    View →
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '10px 0', borderBottom: '1px solid #ddd', flexWrap: 'wrap', gap: '15px' },
    headerRight: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
    navButtons: { display: 'flex', gap: '10px' },
    navBtn: { padding: '8px 16px', background: '#f0f2f5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    navBtnActive: { padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
    userName: { fontWeight: 'bold' },
    logoutBtn: { padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
    
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '30px' },
    statCard: { background: '#f8f9fa', padding: '20px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    statNumber: { fontSize: '36px', fontWeight: 'bold', margin: '10px 0', color: '#007bff' },
    statBtn: { marginTop: '10px', padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
    
    quickNavGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' },
    quickNavCard: { background: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    quickNavIcon: { fontSize: '48px', marginBottom: '10px' },
    quickNavBtn: { marginTop: '15px', padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
    
    section: { marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    taskList: { listStyle: 'none', padding: 0 },
    taskItem: { padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    overdueTask: { padding: '10px', borderBottom: '1px solid #eee', background: '#fff3f3', color: '#dc3545', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    taskLinkBtn: { padding: '4px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
    linkBtn: { background: 'none', color: '#007bff', border: 'none', cursor: 'pointer', textDecoration: 'underline' }
};

export default Dashboard;