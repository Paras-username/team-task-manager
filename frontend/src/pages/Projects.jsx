import  { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [memberEmail, setMemberEmail] = useState('');
    const [projectName, setProjectName] = useState('');
    const [projectDesc, setProjectDesc] = useState('');
    const [loading, setLoading] = useState(true);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        try {
            const res = await API.get('/projects');
            setProjects(res.data.projects);
        } catch (error) {
            console.error('Error:', error);
            if (error.response?.status === 401) {
                logout();
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const createProject = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/projects', {
                name: projectName,
                description: projectDesc
            });
            setProjects([res.data.project, ...projects]);
            setShowForm(false);
            setProjectName('');
            setProjectDesc('');
        } catch (error) {
            console.error('Create error:', error);
        }
    };

    const deleteProject = async (projectId) => {
        if (!confirm('Delete this project? All tasks will be deleted.')) return;
        try {
            await API.delete(`/projects/${projectId}`);
            setProjects(projects.filter(p => p._id !== projectId));
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const addTeamMember = async (e) => {
        e.preventDefault();
        try {
            await API.post(`/projects/${selectedProject._id}/add-member`, {
                email: memberEmail
            });
            alert(`User ${memberEmail} added to project!`);
            setShowMemberForm(false);
            setMemberEmail('');
            setSelectedProject(null);
            fetchProjects(); // Refresh project list
        } catch (error) {
            console.error('Add member error:', error);
            alert(error.response?.data?.message || 'Error adding member');
        }
    };

    const isAdmin = (project) => {
        return project.createdBy?._id === user?._id || project.createdBy === user?._id;
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Projects</h1>
                <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
                    + New Project
                </button>
            </div>

            {showForm && (
                <form onSubmit={createProject} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Project Name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        style={styles.input}
                        required
                    />
                    <textarea
                        placeholder="Description"
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        style={styles.textarea}
                    />
                    <button type="submit" style={styles.submitBtn}>Create</button>
                </form>
            )}

            {/* Add Member Modal */}
            {showMemberForm && selectedProject && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modal}>
                        <h3>Add Team Member to {selectedProject.name}</h3>
                        <form onSubmit={addTeamMember}>
                            <input
                                type="email"
                                placeholder="Enter user email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                style={styles.input}
                                required
                            />
                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.submitBtn}>Add Member</button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowMemberForm(false);
                                        setSelectedProject(null);
                                        setMemberEmail('');
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

            <div style={styles.projectGrid}>
                {projects.map(project => (
                    <div key={project._id} style={styles.projectCard}>
                        <h3>{project.name}</h3>
                        <p>{project.description || 'No description'}</p>
                        <p style={styles.meta}>Created by: {project.createdBy?.name || project.createdBy?.email}</p>
                        <p style={styles.meta}>Team: {project.teamMembers?.length} members</p>
                        
                        {/* Team Members List */}
                        <div style={styles.teamList}>
                            <strong>Team Members:</strong>
                            {project.teamMembers?.map(member => (
                                <span key={member._id} style={styles.teamMember}>
                                    {member.name || member.email}
                                </span>
                            ))}
                        </div>
                        
                        <div style={styles.cardActions}>
                            <button onClick={() => navigate(`/projects/${project._id}/tasks`)} style={styles.viewBtn}>
                                View Tasks
                            </button>
                            {isAdmin(project) && (
                                <>
                                    <button 
                                        onClick={() => {
                                            setSelectedProject(project);
                                            setShowMemberForm(true);
                                        }} 
                                        style={styles.memberBtn}
                                    >
                                        + Add Member
                                    </button>
                                    <button onClick={() => deleteProject(project._id)} style={styles.deleteBtn}>
                                        Delete
                                    </button>
                                </>
                            )}
                            {!isAdmin(project) && (
                                <span style={styles.memberBadge}>Member</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    addBtn: { background: '#28a745', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    form: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' },
    input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px' },
    textarea: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '4px', minHeight: '80px' },
    submitBtn: { background: '#007bff', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    cancelBtn: { background: '#6c757d', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    projectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
    projectCard: { background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: '4px solid #007bff' },
    meta: { fontSize: '12px', color: '#666', marginTop: '10px' },
    teamList: { marginTop: '10px', fontSize: '12px', display: 'flex', flexWrap: 'wrap', gap: '5px', alignItems: 'center' },
    teamMember: { background: '#e9ecef', padding: '3px 8px', borderRadius: '12px', fontSize: '11px' },
    cardActions: { display: 'flex', gap: '10px', marginTop: '15px' },
    viewBtn: { background: '#007bff', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
    memberBtn: { background: '#28a745', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
    deleteBtn: { background: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', flex: 1 },
    memberBadge: { background: '#6c757d', color: 'white', padding: '8px 16px', borderRadius: '4px', textAlign: 'center', flex: 1 },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '30px', borderRadius: '12px', minWidth: '300px' },
    modalActions: { display: 'flex', gap: '10px', marginTop: '15px' }
};

export default Projects;