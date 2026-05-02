import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';

const Tasks = () => {
    const { projectId } = useParams();
    const [tasks, setTasks] = useState([]);
    const [project, setProject] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDesc, setTaskDesc] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchTasks = async () => {
        try {
            const res = await API.get(`/tasks/project/${projectId}`);
            setTasks(res.data.tasks);
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        }
    };

    const fetchProject = async () => {
        try {
            const res = await API.get('/projects');
            const found = res.data.projects.find(p => p._id === projectId);
            setProject(found);
            setTeamMembers(found?.teamMembers || []);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchProject();
    }, [projectId]);

    const isAdmin = () => {
        return project?.createdBy?._id === user?._id || project?.createdBy === user?._id;
    };

    const isTaskAssignedToMe = (task) => {
        return task.assignedTo?._id === user?._id || task.assignedTo === user?._id;
    };

    const createTask = async (e) => {
        e.preventDefault();
        try {
            await API.post('/tasks', {
                title: taskTitle,
                description: taskDesc,
                dueDate,
                assignedTo,
                projectId
            });
            setShowForm(false);
            setTaskTitle('');
            setTaskDesc('');
            setDueDate('');
            setAssignedTo('');
            fetchTasks();
        } catch (error) {
            console.error('Create error:', error);
        }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await API.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const updateTask = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/tasks/${editingTask._id}`, {
                title: taskTitle,
                description: taskDesc,
                dueDate,
                assignedTo
            });
            setShowEditForm(false);
            setEditingTask(null);
            fetchTasks();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            await API.delete(`/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const openEditForm = (task) => {
        setEditingTask(task);
        setTaskTitle(task.title);
        setTaskDesc(task.description || '');
        setDueDate(task.dueDate.split('T')[0]);
        setAssignedTo(task.assignedTo?._id || task.assignedTo);
        setShowEditForm(true);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'todo': return '#fed7d7';
            case 'in-progress': return '#feebc8';
            case 'done': return '#c6f6d5';
            default: return '#e2e8f0';
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <button onClick={() => navigate('/projects')} style={styles.backBtn}>← Back to Projects</button>
            
            <div style={styles.header}>
                <h1>{project?.name} - Tasks</h1>
                <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>+ New Task</button>
            </div>

            {showForm && (
                <form onSubmit={createTask} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={taskDesc}
                        onChange={(e) => setTaskDesc(e.target.value)}
                        style={styles.textarea}
                    />
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        style={styles.input}
                        required
                    >
                        <option value="">Assign to...</option>
                        {teamMembers.map(member => (
                            <option key={member._id} value={member._id}>{member.name || member.email}</option>
                        ))}
                    </select>
                    <button type="submit" style={styles.submitBtn}>Create Task</button>
                </form>
            )}

            {/* Edit Task Modal */}
            {showEditForm && editingTask && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Edit Task</h3>
                        <form onSubmit={updateTask}>
                            <input
                                type="text"
                                placeholder="Task Title"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={taskDesc}
                                onChange={(e) => setTaskDesc(e.target.value)}
                                style={styles.textarea}
                            />
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                style={styles.input}
                                required
                            >
                                <option value="">Assign to...</option>
                                {teamMembers.map(member => (
                                    <option key={member._id} value={member._id}>{member.name || member.email}</option>
                                ))}
                            </select>
                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.submitBtn}>Save Changes</button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowEditForm(false);
                                        setEditingTask(null);
                                    }} 
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div>
                {tasks.length === 0 ? (
                    <p>No tasks yet. Create your first task!</p>
                ) : (
                    tasks.map(task => {
                        const canEdit = isAdmin() || isTaskAssignedToMe(task);
                        const canDelete = isAdmin(); // Only admin can delete
                        
                        return (
                            <div key={task._id} style={{ ...styles.taskCard, background: getStatusColor(task.status) }}>
                                <div style={styles.taskHeader}>
                                    <h3>{task.title}</h3>
                                    <select
                                        value={task.status}
                                        onChange={(e) => updateStatus(task._id, e.target.value)}
                                        style={styles.statusSelect}
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <p>{task.description}</p>
                                <div style={styles.taskMeta}>
                                    <span>👤 Assigned to: {task.assignedTo?.name || task.assignedTo?.email}</span>
                                    <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    <div style={styles.taskActions}>
                                        {canEdit && (
                                            <button onClick={() => openEditForm(task)} style={styles.editBtn}>
                                                ✏️ Edit
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={() => deleteTask(task._id)} style={styles.delBtn}>
                                                🗑️ Delete
                                            </button>
                                        )}
                                        {!canEdit && !canDelete && (
                                            <span style={styles.readOnlyBadge}>View Only</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

const styles = {
    backBtn: { background: '#6c757d', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '20px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    addBtn: { background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    form: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    textarea: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' },
    submitBtn: { background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    cancelBtn: { background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    taskCard: { padding: '15px', marginBottom: '15px', borderRadius: '8px', borderLeft: '4px solid #007bff' },
    taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' },
    statusSelect: { padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc' },
    taskMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '12px', color: '#666', flexWrap: 'wrap', gap: '10px' },
    taskActions: { display: 'flex', gap: '8px' },
    editBtn: { background: '#ffc107', color: '#333', padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    delBtn: { background: '#dc3545', color: 'white', padding: '4px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    readOnlyBadge: { background: '#6c757d', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '12px', minWidth: '400px' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '15px' }
};

export default Tasks;