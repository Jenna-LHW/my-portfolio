"use client"

import React, { useState, useEffect } from 'react';
import { Moon, Sun, Menu, X, Mail, Github, Linkedin, Twitter, Plus, Edit2, Trash2, Save, LogOut, Search, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Theme Context
const ThemeContext = React.createContext();
const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark');
  }, []);
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>{children}</div>
    </ThemeContext.Provider>
  );
};
const useTheme = () => React.useContext(ThemeContext);

// Toast Notification
const Toast = ({ message, type, onClose }) => {
  const { isDark } = useTheme();
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return <div className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>{message}</div>;
};

// Auth Hook
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => { authListener?.subscription?.unsubscribe(); };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
    setLoading(false);
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut, isAdmin: !!user };
};

// Navigation
const Navigation = ({ currentPage, setCurrentPage, isAdmin, logout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  // const navItems = ['Home', 'About', 'Projects', 'Blog', 'Contact', 'Admin'];
  const navItems = ['Home', 'About', 'Projects', 'Blog', 'Contact'];
  if (isAdmin) navItems.push('Admin');
  
  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-md ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-pink-100'} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Jenna</div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map(item => (
              <button key={item} onClick={() => setCurrentPage(item)} className={`transition-colors ${currentPage === item ? isDark ? 'text-pink-400' : 'text-pink-600' : isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{item}</button>
            ))}
            <button onClick={toggleTheme} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-pink-50'}`}>
              {isDark ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>
            {isAdmin && <button onClick={logout} className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-800' : 'hover:bg-pink-50'}`}><LogOut className="w-5 h-5" /></button>}
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
      </div>
      {isOpen && (
        <div className={`md:hidden ${isDark ? 'bg-gray-900' : 'bg-white'} border-t ${isDark ? 'border-gray-800' : 'border-pink-100'}`}>
          <div className="px-4 py-4 space-y-3">
            {navItems.map(item => (
              <button key={item} onClick={() => { setCurrentPage(item); setIsOpen(false); }} className={`block w-full text-left px-4 py-2 rounded-lg ${currentPage === item ? isDark ? 'bg-gray-800 text-pink-400' : 'bg-pink-50 text-pink-600' : isDark ? 'text-gray-300' : 'text-gray-600'}`}>{item}</button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

// Login Page
const LoginPage = ({ onSuccess }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('Check your email for confirmation link!');
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen pt-16 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className={`max-w-md w-full mx-4 p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
        <h1 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{isSignUp ? 'Create Account' : 'Admin Login'}</h1>
        {error && <div className={`mb-4 p-3 rounded-lg ${error.includes('Check') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{error}</div>}
        <div className="space-y-4">
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} placeholder="admin@example.com" />
          </div>
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} placeholder="••••••••" />
          </div>
          <button onClick={handleSubmit} disabled={loading} className={`w-full py-3 rounded-lg font-medium transition-colors ${isDark ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-600 hover:bg-pink-700'} text-white disabled:opacity-50`}>{loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}</button>
          <button onClick={() => setIsSignUp(!isSignUp)} className={`w-full text-center ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}</button>
        </div>
      </div>
    </div>
  );
};

// Profile Settings
const ProfileSettings = ({ onSave }) => {
  const { isDark } = useTheme();
  const [profile, setProfile] = useState({ 
    name: '', 
    title: '', 
    bio: '', 
    github: '', 
    linkedin: '', 
    twitter: '', 
    email: '', 
    profile_image: '' 
  });
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profile').select('*').single();
      if (data) {
        // Ensure all fields have a value (at least empty string)
        setProfile({
          name: data.name || '',
          title: data.title || '',
          bio: data.bio || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          twitter: data.twitter || '',
          email: data.email || '',
          profile_image: data.profile_image || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `profile-${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(fileName, file, { upsert: true });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('portfolio-images')
        .getPublicUrl(fileName);
      
      console.log('Image URL:', urlData.publicUrl);
      setProfile({...profile, profile_image: urlData.publicUrl});
      setToast({ message: 'Image uploaded successfully!', type: 'success' });
      setUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      setToast({ message: `Error: ${error.message}`, type: 'error' });
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase.from('profile').upsert({ id: 1, ...profile });
      if (error) throw error;
      setToast({ message: 'Profile saved!', type: 'success' });
      if (onSave) onSave(profile);
    } catch (error) {
      setToast({ message: 'Error saving', type: 'error' });
    }
  };

  return (
    <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Settings</h2>
      <div className="space-y-4">
        <div>
          <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile Picture</label>
          <div className="flex items-center gap-4">
            {profile.profile_image ? (
              <img src={profile.profile_image} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}></div>
            )}
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} className={`flex-1 px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </div>
          {uploading && <p className="mt-2 text-sm text-pink-500">Uploading...</p>}
        </div>
        <div>
          <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Name</label>
          <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
        </div>
        <div>
          <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Title</label>
          <input type="text" value={profile.title} onChange={(e) => setProfile({...profile, title: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
        </div>
        <div>
          <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Bio</label>
          <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows="4" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>GitHub</label>
            <input type="url" value={profile.github} onChange={(e) => setProfile({...profile, github: e.target.value})} placeholder="https://github.com/username" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </div>
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>LinkedIn</label>
            <input type="url" value={profile.linkedin} onChange={(e) => setProfile({...profile, linkedin: e.target.value})} placeholder="https://linkedin.com/in/username" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </div>
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Twitter</label>
            <input type="url" value={profile.twitter} onChange={(e) => setProfile({...profile, twitter: e.target.value})} placeholder="https://twitter.com/username" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </div>
          <div>
            <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Email</label>
            <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} placeholder="your@email.com" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </div>
        </div>
        <button onClick={handleSave} className={`w-full py-3 rounded-lg font-medium ${isDark ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-600 hover:bg-pink-700'} text-white`}>
          <Save className="w-5 h-5 inline mr-2" />Save Profile
        </button>
      </div>
    </div>
  );
};

// Analytics Dashboard
const AnalyticsDashboard = () => {
  const { isDark } = useTheme();
  const [stats, setStats] = useState({ skills: 0, experience: 0, education: 0, projects: 0, blog: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [skills, experience, education, projects, blog] = await Promise.all([
        supabase.from('skills').select('*', { count: 'exact', head: true }),
        supabase.from('experience').select('*', { count: 'exact', head: true }),
        supabase.from('education').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true })
      ]);
      setStats({ skills: skills.count || 0, experience: experience.count || 0, education: education.count || 0, projects: projects.count || 0, blog: blog.count || 0 });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const statCards = [
    { label: 'Skills', value: stats.skills, color: 'from-blue-500 to-blue-600' },
    { label: 'Experience', value: stats.experience, color: 'from-green-500 to-green-600' },
    { label: 'Education', value: stats.education, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Projects', value: stats.projects, color: 'from-pink-500 to-pink-600' },
    { label: 'Blog Posts', value: stats.blog, color: 'from-purple-500 to-purple-600' }
  ];

  return (
    <div className="mb-8">
      <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <BarChart3 className="inline w-6 h-6 mr-2" />Analytics Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Home Page
const HomePage = ({ setCurrentPage, profile }) => {
  const { isDark } = useTheme();
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [currentRole, setCurrentRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedData();
  }, []);

  const fetchFeaturedData = async () => {
    try {
      const { data: skills } = await supabase.from('skills').select('*').eq('is_featured', true).limit(6);
      const { data: projects } = await supabase.from('projects').select('*').eq('is_featured', true).limit(2);
      const { data: experience } = await supabase.from('experience').select('*').eq('is_current', true).single();
      setFeaturedSkills(skills || []);
      setFeaturedProjects(projects || []);
      setCurrentRole(experience);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const socialLinks = [
    { Icon: Github, url: profile?.github },
    { Icon: Linkedin, url: profile?.linkedin },
    { Icon: Mail, url: profile?.email ? `mailto:${profile.email}` : '' }
  ];
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center justify-center text-center mb-24">
          {profile?.profile_image ? (
            <img src={profile.profile_image} alt="Profile" className="w-32 h-32 rounded-full mb-8 object-cover" />
          ) : (
            <div className={`w-32 h-32 rounded-full mb-8 ${isDark ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}></div>
          )}
          <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Hi, I'm <span className={isDark ? 'text-pink-400' : 'text-pink-600'}>{profile?.name || 'Your Name'}</span>
          </h1>
          <p className={`text-xl md:text-2xl mb-8 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl`}>{profile?.title || 'Full Stack Developer & Designer'}</p>
          <p className={`text-lg mb-12 ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-3xl`}>{profile?.bio || "I build beautiful, functional web applications with modern technologies."}</p>
          <div className="flex gap-4">
            <button onClick={() => setCurrentPage('Projects')} className={`px-8 py-3 rounded-lg font-medium transition-all ${isDark ? 'bg-pink-500 hover:bg-pink-600 text-white' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}>View My Work</button>
            <button onClick={() => setCurrentPage('Contact')} className={`px-8 py-3 rounded-lg font-medium transition-all ${isDark ? 'border border-gray-700 text-white hover:bg-gray-800' : 'border border-pink-200 text-pink-600 hover:bg-pink-50'}`}>Contact Me</button>
          </div>
          <div className="flex gap-6 mt-12">
            {socialLinks.map(({ Icon, url }, i) => url && (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-pink-50 text-gray-600'}`}>
                <Icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div></div>
        ) : (
          <>
            {featuredSkills.length > 0 && (
              <div className="mb-24">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Core Skills</h2>
                  <button onClick={() => setCurrentPage('About')} className={`text-sm font-medium ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>View All →</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {featuredSkills.map((skill) => (
                    <div key={skill.id} className={`p-4 rounded-xl text-center font-medium transition-transform hover:scale-105 ${isDark ? 'bg-gray-800 text-pink-400' : 'bg-white shadow-md text-pink-600'}`}>{skill.name}</div>
                  ))}
                </div>
              </div>
            )}

            {currentRole && (
              <div className="mb-24">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Role</h2>
                  <button onClick={() => setCurrentPage('About')} className={`text-sm font-medium ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>View Experience →</button>
                </div>
                <div className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentRole.title}</h3>
                  <p className={`text-lg ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>{currentRole.company} • {currentRole.period}</p>
                </div>
              </div>
            )}

            {featuredProjects.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Projects</h2>
                  <button onClick={() => setCurrentPage('Projects')} className={`text-sm font-medium ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}>View All Projects →</button>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {featuredProjects.map((project) => (
                    <div key={project.id} className={`p-6 rounded-2xl transition-transform hover:scale-105 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                      {project.image_url ? (
                        <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover rounded-xl mb-4" />
                      ) : (
                        <div className={`h-40 rounded-xl mb-4 ${isDark ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}></div>
                      )}
                      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{project.title}</h3>
                      <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tech && project.tech.map((t, j) => (
                          <span key={j} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// About Page
const AboutPage = ({ profile }) => {
  const { isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('experience');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data: skillsData } = await supabase.from('skills').select('*').order('created_at', { ascending: false });
      const { data: expData } = await supabase.from('experience').select('*').order('created_at', { ascending: false });
      const { data: eduData } = await supabase.from('education').select('*').order('created_at', { ascending: false });
      setSkills(skillsData || []);
      setExperience(expData || []);
      setEducation(eduData || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

const getSkillIcon = (skillName) => {
  const iconMap = {
    // Frontend
    'React': 'bi-react',
    'Next.js': 'bi-bootstrap', 
    'JavaScript': 'bi-braces',
    'HTML': 'bi-filetype-html',
    'CSS': 'bi-filetype-css', 

    // Backend
    'Python': 'bi-terminal', 
    'Django': 'bi-server',
    'Java': 'bi-cup-hot',
    'PHP': 'bi-filetype-php',
    'C': 'bi-filetype-c',

    // Database
    'SQL': 'bi-database',

    // Deployment / DevOps
    'Netlify': 'bi-cloud-upload',
    'Vercel': 'bi-lightning-charge',

    // Tools
    'Git': 'bi-git',
    'GitHub': 'bi-github',
    'VS Code': 'bi-window',
    'Figma': 'bi-palette',

    // Default fallback
    'default': 'bi-code-slash' 
  };

  return iconMap[skillName] || iconMap['default'];
};



  const getSkillPercentage = (skill) => {
    return skill.proficiency || 80;
  };

  const scrollbarStyle = {
    scrollbarWidth: 'thin',
    scrollbarColor: isDark ? '#ec4899 #374151' : '#db2777 #fce7f3'
  };
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>About Me</h1>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Whether it's through exploring app development, troubleshooting hardware or diving into new technologies, I'm always looking for ways to expand my problem-solving toolkit. My approach is simple: Every challenge is an opportunity to grow and innovate.
            <br />
            <br />
            As I look to the future, I'm excited to contribute to projects that not only solve problems but also demonstrate the potential for technology to positively impact the way we live and work.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="space-y-3">
              <button
                onClick={() => setActiveSection('experience')}
                className={`w-full px-6 py-4 rounded-lg font-medium text-left transition-all ${
                  activeSection === 'experience'
                    ? isDark ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50 shadow-md'
                }`}
              >
                Experience
              </button>
              <button
                onClick={() => setActiveSection('education')}
                className={`w-full px-6 py-4 rounded-lg font-medium text-left transition-all ${
                  activeSection === 'education'
                    ? isDark ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50 shadow-md'
                }`}
              >
                Education
              </button>
              <button
                onClick={() => setActiveSection('skills')}
                className={`w-full px-6 py-4 rounded-lg font-medium text-left transition-all ${
                  activeSection === 'skills'
                    ? isDark ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50 shadow-md'
                }`}
              >
                Skills
              </button>
            </div>
          </div>

          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
              </div>
            ) : (
              <>
                {activeSection === 'experience' && (
                  <div>
                    <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>My experience</h2>
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2" style={scrollbarStyle}>
                        {experience.map((exp, index) => (
                          <div key={exp.id} className={`pb-6 ${index !== experience.length - 1 ? 'border-b' : ''} ${isDark ? 'border-gray-700' : 'border-pink-100'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-pink-400' : 'bg-pink-600'}`}></div>
                              <div className="flex-1">
                                <p className={`text-sm mb-2 ${isDark ? 'text-pink-400' : 'text-pink-600'} font-medium`}>{exp.period}</p>
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{exp.title}</h3>
                                <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>• {exp.company}</p>
                                {exp.description && (
                                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{exp.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div>
                    <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>My education</h2>
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2" style={scrollbarStyle}>
                        {education.map((edu, index) => (
                          <div key={edu.id} className={`pb-6 ${index !== education.length - 1 ? 'border-b' : ''} ${isDark ? 'border-gray-700' : 'border-pink-100'}`}>
                            <div className="flex items-start gap-4">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${isDark ? 'bg-pink-400' : 'bg-pink-600'}`}></div>
                              <div className="flex-1">
                                <p className={`text-sm mb-2 ${isDark ? 'text-pink-400' : 'text-pink-600'} font-medium`}>{edu.year}</p>
                                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{edu.degree}</h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>• {edu.school}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div>
                    <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>My skills</h2>
                    <div className={`rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2" style={scrollbarStyle}>
                        {skills.map((skill) => (
                          <div key={skill.id}>
                            <div className="flex items-center gap-4 mb-3">
                              <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${isDark ? 'bg-gray-700' : 'bg-pink-50'}`}>
                                <i className={`${getSkillIcon(skill.name)} text-2xl ${isDark ? 'text-pink-400' : 'text-pink-600'}`}></i>
                              </div>
                              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{skill.name}</h3>
                            </div>
                            <div className="relative">
                              <div className={`h-3 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-pink-100'}`}>
                                <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${isDark ? 'bg-pink-500' : 'bg-pink-600'}`}
                                  style={{ width: `${getSkillPercentage(skill)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Projects Page
const ProjectsPage = ({ onSelectProject }) => {
  const { isDark } = useTheme();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [activeFilter, projects]);

  const fetchProjects = async () => {
    try {
      const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      setProjects(data || []);
      setFilteredProjects(data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    if (activeFilter === 'all') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => project.status === activeFilter);
      setFilteredProjects(filtered);
    }
  };

  const getStatusBadge = (project) => {
    if (project.status === 'completed') return 'COMPLETED';
    if (project.status === 'in-progress') return 'IN PROGRESS';
    if (project.status === 'planning') return 'PLANNING';
    return 'IN PROGRESS';
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'text-green-500';
    if (status === 'IN PROGRESS') return 'text-yellow-500';
    if (status === 'PLANNING') return 'text-blue-500';
    return 'text-yellow-500';
  };

  const getProjectCount = (filter) => {
    if (filter === 'all') return projects.length;
    return projects.filter(p => p.status === filter).length;
  };

  const filters = [
    { id: 'all', label: 'All Projects', color: 'pink' },
    { id: 'completed', label: 'Completed', color: 'green' },
    { id: 'in-progress', label: 'In Progress', color: 'yellow' },
    { id: 'planning', label: 'Planning', color: 'blue' }
  ];

  const getFilterButtonStyle = (filter) => {
    const isActive = activeFilter === filter.id;
    
    if (isActive) {
      if (filter.color === 'pink') return isDark ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white';
      if (filter.color === 'green') return isDark ? 'bg-green-500 text-white' : 'bg-green-600 text-white';
      if (filter.color === 'yellow') return isDark ? 'bg-yellow-500 text-white' : 'bg-yellow-600 text-white';
      if (filter.color === 'blue') return isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white';
    }
    
    return isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-pink-50 shadow-md';
  };
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>My Projects</h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Explore my latest work and side projects
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-lg font-medium transition-all hover:scale-105 ${getFilterButtonStyle(filter)}`}
            >
              {filter.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                activeFilter === filter.id 
                  ? 'bg-white/20' 
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {getProjectCount(filter.id)}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className={`text-6xl mb-4`}>📁</div>
            <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No projects found
            </h3>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Try selecting a different filter
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className={`rounded-2xl overflow-hidden transition-all hover:scale-[1.02] cursor-pointer ${
                  isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white/80 backdrop-blur shadow-lg'
                }`}
                onClick={() => onSelectProject(project)}
              >
                {/* Project Image */}
                <div className="relative h-64">
                  {project.image_url ? (
                    <img 
                      src={project.image_url} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}>
                      <div className="text-white text-6xl">📱</div>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isDark ? 'bg-gray-900/80 backdrop-blur' : 'bg-white/80 backdrop-blur'
                    } ${getStatusColor(getStatusBadge(project))}`}>
                      {getStatusBadge(project)}
                    </span>
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-6">
                  <h3 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {project.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.description}
                  </p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech && project.tech.slice(0, 3).map((t, j) => (
                      <span key={j} className={`px-3 py-1 rounded-lg text-xs font-medium ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* View Details Button */}
                  <button className={`w-full py-3 rounded-lg font-medium transition-all ${
                    isDark 
                      ? 'bg-pink-500/20 text-pink-400 hover:bg-pink-500/30' 
                      : 'bg-pink-600/10 text-pink-600 hover:bg-pink-600/20'
                  }`}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Project Detail Page
const ProjectDetailPage = ({ project, onBack }) => {
  const { isDark } = useTheme();

  const getStatusBadge = () => {
    if (project.status === 'completed') return 'COMPLETED';
    if (project.status === 'in-progress') return 'IN PROGRESS';
    if (project.status === 'planning') return 'PLANNING';
    return 'IN PROGRESS'; // default
  };

  const getStatusColor = (status) => {
    if (status === 'COMPLETED') return 'text-green-500';
    if (status === 'IN PROGRESS') return 'text-yellow-500';
    if (status === 'PLANNING') return 'text-blue-500';
    return 'text-yellow-500';
  };

  const formatDate = () => {
    if (project.created_at) {
      const date = new Date(project.created_at);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return 'October 2025';
  };
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className={`mb-8 px-6 py-3 rounded-full border-2 transition-all hover:scale-105 ${
            isDark 
              ? 'border-pink-500 text-pink-400 hover:bg-pink-500/10' 
              : 'border-pink-600 text-pink-600 hover:bg-pink-50'
          }`}
        >
          ← Back to Projects
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Image */}
            <div className="rounded-2xl overflow-hidden">
              {project.image_url ? (
                <img 
                  src={project.image_url} 
                  alt={project.title}
                  className="w-full h-96 object-cover"
                />
              ) : (
                <div className={`w-full h-96 flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-pink-500 to-purple-600' : 'bg-gradient-to-br from-pink-400 to-pink-600'}`}>
                  <div className="text-white text-8xl">📱</div>
                </div>
              )}
            </div>

            {/* Project Title & Status */}
            <div>
              <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {project.title}
              </h1>
              <div className="flex items-center gap-4 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isDark ? 'bg-gray-900/80 backdrop-blur' : 'bg-white/80 backdrop-blur'
                } ${getStatusColor(getStatusBadge())}`}>
                  {getStatusBadge()}
                </span>
                <span className={`flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate()}
                </span>
              </div>
            </div>

            {/* Project Description */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'}`}>
              <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {project.description}
              </p>
            </div>

            {/* About This Project */}
            {project.description && (
              <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  About This Project
                </h2>
                <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {project.description}
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Info Cards */}
          <div className="space-y-6">
            {/* Project Links */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                Project Links
              </h3>
              
              {project.link ? (
                <div className="space-y-3">
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      isDark 
                        ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                        : 'bg-pink-600 hover:bg-pink-700 text-white'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Live Demo
                  </a>
                  {project.github_url ? (
                    <a 
                      href={project.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                        isDark 
                          ? 'border-pink-500 text-pink-400 hover:bg-pink-500/10' 
                          : 'border-pink-600 text-pink-600 hover:bg-pink-50'
                      }`}
                    >
                      <Github className="w-5 h-5" />
                      View Source Code
                    </a>
                  ) : (
                    <div className={`w-full py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed ${
                      isDark ? 'border-gray-700 text-gray-500' : 'border-gray-300 text-gray-400'
                    }`}>
                      <Github className="w-5 h-5" />
                      Source Code Private
                    </div>
                  )}
                  <button className={`w-full py-3 px-4 rounded-lg font-medium transition-all border-2 flex items-center justify-center gap-2 ${
                    isDark 
                      ? 'border-pink-500 text-pink-400 hover:bg-pink-500/10' 
                      : 'border-pink-600 text-pink-600 hover:bg-pink-50'
                  }`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share Project
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <svg className={`w-8 h-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Private Project
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    This project is not publicly available yet
                  </p>
                </div>
              )}
            </div>

            {/* Technologies Used */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/80 shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.tech && project.tech.map((t, j) => (
                  <span key={j} className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Page
const BlogPage = ({ onSelectPost }) => {
  const { isDark } = useTheme();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await supabase.from('blog_posts').select('*').order('published_date', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className={`text-4xl md:text-5xl font-bold mb-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>Blog</h1>
        {loading ? (
          <div className="text-center py-12"><div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div></div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article key={post.id} className={`p-8 rounded-2xl transition-all hover:scale-[1.02] ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{post.published_date}</p>
                <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h2>
                <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{post.excerpt}</p>
                <button 
                  onClick={() => onSelectPost(post)}
                  className={`inline-flex items-center font-medium ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}
                >
                  Read More →
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Blog Post Detail Page
const BlogPostPage = ({ post, onBack }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <button 
          onClick={onBack}
          className={`mb-8 flex items-center gap-2 ${isDark ? 'text-pink-400 hover:text-pink-300' : 'text-pink-600 hover:text-pink-700'}`}
        >
          ← Back to Blog
        </button>
        <article className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
          <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{post.published_date}</p>
          <h1 className={`text-4xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h1>
          <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
            <p className={`text-lg leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {post.content}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
};

// Contact Page
const ContactPage = () => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [profile, setProfile] = useState(null);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profile').select('*').single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSending(true);

    try {
      // Step 1: Save to Supabase database
      const { error: dbError } = await supabase
        .from('contact_messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'No subject',
          message: formData.message
        }]);
      
      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to save message');
      }
      
      // Step 2: Send email notification
      const emailResponse = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!emailResponse.ok) {
        console.error('Email sending failed');
      }
      
      setToast({ message: 'Message sent successfully! I\'ll get back to you soon.', type: 'success' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      setToast({ message: 'Error sending message. Please try again.', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleDirectEmail = () => {
    window.location.href = `mailto:${profile?.email || 'your@email.com'}`;
  };
  
  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Get In Touch</h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Have a project in mind or just want to say hello? I'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Contact Form */}
          <div className="lg:col-span-2">
            <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white/80 backdrop-blur shadow-lg'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Send Me a Message</h2>
              
              <div className="space-y-6">
                {/* Name and Email Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name *</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-pink-500 ${
                        isDark 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white/50 border-pink-200 text-gray-900 placeholder-gray-500'
                      }`}
                      required
                      disabled={sending}
                    />
                  </div>
                  <div>
                    <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-pink-500 ${
                        isDark 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white/50 border-pink-200 text-gray-900 placeholder-gray-500'
                      }`}
                      required
                      disabled={sending}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Subject</label>
                  <input
                    type="text"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-pink-500 ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/50 border-pink-200 text-gray-900 placeholder-gray-500'
                    }`}
                    disabled={sending}
                  />
                </div>

                {/* Message */}
                <div>
                  <label className={`block mb-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Message *</label>
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="6"
                    className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-pink-500 resize-none ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/50 border-pink-200 text-gray-900 placeholder-gray-500'
                    }`}
                    required
                    disabled={sending}
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  className={`w-full py-4 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark 
                      ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-lg shadow-pink-500/50' 
                      : 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-600/30'
                  }`}
                >
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Info & Connect */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white/80 backdrop-blur shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Contact Information</h3>
              
              <div className="space-y-4">
                {/* Email */}
                {profile?.email && (
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-pink-500/20' : 'bg-pink-50'}`}>
                      <Mail className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</h4>
                      <a href={`mailto:${profile.email}`} className={`text-sm ${isDark ? 'text-gray-400 hover:text-pink-400' : 'text-gray-600 hover:text-pink-600'}`}>
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-pink-500/20' : 'bg-pink-50'}`}>
                    <svg className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className={`font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Location</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Port Louis, Mauritius</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect With Me */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800/50 backdrop-blur' : 'bg-white/80 backdrop-blur shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Connect With Me</h3>
              
              <div className="flex gap-4">
                {profile?.github && (
                  <a 
                    href={profile.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${
                      isDark 
                        ? 'border-pink-500 hover:bg-pink-500/20 text-pink-400' 
                        : 'border-pink-600 hover:bg-pink-50 text-pink-600'
                    }`}
                  >
                    <Github className="w-6 h-6" />
                  </a>
                )}
                {profile?.linkedin && (
                  <a 
                    href={profile.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${
                      isDark 
                        ? 'border-pink-500 hover:bg-pink-500/20 text-pink-400' 
                        : 'border-pink-600 hover:bg-pink-50 text-pink-600'
                    }`}
                  >
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
                {profile?.twitter && (
                  <a 
                    href={profile.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110 ${
                      isDark 
                        ? 'border-pink-500 hover:bg-pink-500/20 text-pink-400' 
                        : 'border-pink-600 hover:bg-pink-50 text-pink-600'
                    }`}
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>

            {/* Prefer Direct Contact */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur' : 'bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>Prefer Direct Contact?</h3>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Feel free to reach out directly via email
              </p>
              <button
                onClick={handleDirectEmail}
                className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? 'bg-pink-500 hover:bg-pink-600 text-white' 
                    : 'bg-pink-600 hover:bg-pink-700 text-white'
                }`}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Admin Page - Content Management System
const AdminPage = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [profile, setProfile] = useState(null);
  
  const tabs = ['dashboard', 'profile', 'skills', 'experience', 'education', 'projects', 'blog'];

  useEffect(() => {
    if (activeTab !== 'dashboard' && activeTab !== 'profile') {
      fetchItems();
    }
  }, [activeTab]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = items.filter(item => {
        const searchStr = searchQuery.toLowerCase();
        return (
          (item.name && item.name.toLowerCase().includes(searchStr)) ||
          (item.title && item.title.toLowerCase().includes(searchStr)) ||
          (item.degree && item.degree.toLowerCase().includes(searchStr)) ||
          (item.company && item.company.toLowerCase().includes(searchStr))
        );
      });
      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchQuery, items]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const tableName = activeTab === 'blog' ? 'blog_posts' : activeTab;
      const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
      setItems(data || []);
      setFilteredItems(data || []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      const tableName = activeTab === 'blog' ? 'blog_posts' : activeTab;
      await supabase.from(tableName).delete().eq('id', id);
      setToast({ message: 'Deleted!', type: 'success' });
      fetchItems();
    } catch (error) {
      setToast({ message: 'Error deleting', type: 'error' });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    if (!confirm(`Delete ${selectedItems.length} items?`)) return;
    try {
      const tableName = activeTab === 'blog' ? 'blog_posts' : activeTab;
      await Promise.all(selectedItems.map(id => supabase.from(tableName).delete().eq('id', id)));
      setToast({ message: `${selectedItems.length} items deleted!`, type: 'success' });
      setSelectedItems([]);
      fetchItems();
    } catch (error) {
      setToast({ message: 'Error', type: 'error' });
    }
  };

  const handleToggleFeatured = async (item) => {
    if (activeTab !== 'skills' && activeTab !== 'projects') return;
    try {
      await supabase.from(activeTab).update({ is_featured: !item.is_featured }).eq('id', item.id);
      setToast({ message: 'Updated!', type: 'success' });
      fetchItems();
    } catch (error) {
      setToast({ message: 'Error', type: 'error' });
    }
  };

  const handleToggleCurrent = async (item) => {
    if (activeTab !== 'experience') return;
    try {
      await supabase.from('experience').update({ is_current: false }).neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('experience').update({ is_current: !item.is_current }).eq('id', item.id);
      setToast({ message: 'Updated!', type: 'success' });
      fetchItems();
    } catch (error) {
      setToast({ message: 'Error', type: 'error' });
    }
  };

  const toggleSelectItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const AddEditForm = ({ item, onClose }) => {
    const [formData, setFormData] = useState(item || {});
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `project-${Date.now()}.${fileExt}`;
        
        // Upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);
        
        console.log('Project image URL:', urlData.publicUrl);
        setFormData({...formData, image_url: urlData.publicUrl});
        setToast({ message: 'Image uploaded successfully!', type: 'success' });
        setUploading(false);
      } catch (error) {
        console.error('Error uploading image:', error);
        setToast({ message: `Error: ${error.message}`, type: 'error' });
        setUploading(false);
      }
    };

    const handleSubmit = async () => {
      try {
        const tableName = activeTab === 'blog' ? 'blog_posts' : activeTab;
        if (item) {
          await supabase.from(tableName).update(formData).eq('id', item.id);
          setToast({ message: 'Updated!', type: 'success' });
        } else {
          await supabase.from(tableName).insert([formData]);
          setToast({ message: 'Added!', type: 'success' });
        }
        fetchItems();
        onClose();
      } catch (error) {
        setToast({ message: 'Error saving', type: 'error' });
      }
    };

    const renderFields = () => {
      if (activeTab === 'skills') {
        return (
          <>
            <input type="text" placeholder="Skill Name" value={formData.name || ''} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="text" placeholder="Category" value={formData.category || ''} onChange={(e) => setFormData({...formData, category: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <input type="checkbox" checked={formData.is_featured || false} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5" />
              Featured
            </label>
          </>
        );
      } else if (activeTab === 'experience') {
        return (
          <>
            <input type="text" placeholder="Job Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="text" placeholder="Company" value={formData.company || ''} onChange={(e) => setFormData({...formData, company: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="text" placeholder="Period" value={formData.period || ''} onChange={(e) => setFormData({...formData, period: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <textarea placeholder="Description" value={formData.description || ''} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <input type="checkbox" checked={formData.is_current || false} onChange={(e) => setFormData({...formData, is_current: e.target.checked})} className="w-5 h-5" />
              Current
            </label>
          </>
        );
      } else if (activeTab === 'education') {
        return (
          <>
            <input type="text" placeholder="Degree" value={formData.degree || ''} onChange={(e) => setFormData({...formData, degree: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="text" placeholder="School" value={formData.school || ''} onChange={(e) => setFormData({...formData, school: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="text" placeholder="Year" value={formData.year || ''} onChange={(e) => setFormData({...formData, year: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </>
        );
      } else if (activeTab === 'projects') {
          return (
            <>
              <input 
                type="text" 
                placeholder="Project Title" 
                value={formData.title || ''} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
              />
              <textarea 
                placeholder="Description" 
                value={formData.description || ''} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                rows="3" 
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
              />
              <input 
                type="text" 
                placeholder="Technologies (comma separated)" 
                value={formData.tech ? formData.tech.join(', ') : ''} 
                onChange={(e) => setFormData({...formData, tech: e.target.value.split(',').map(t => t.trim())})} 
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
              />
              <input 
                type="text" 
                placeholder="Project Link" 
                value={formData.link || ''} 
                onChange={(e) => setFormData({...formData, link: e.target.value})} 
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
              />
              <input 
                type="text" 
                placeholder="GitHub Repository URL" 
                value={formData.github_url || ''} 
                onChange={(e) => setFormData({...formData, github_url: e.target.value})} 
                className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
              />                      
              {/* Status Dropdown */}
              <div>
                <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Project Status</label>
                <select
                  value={formData.status || 'completed'}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`}
                >
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="planning">Planning</option>
                </select>
              </div>

              <div>
                <label className={`block mb-2 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Project Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  disabled={uploading} 
                  className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} 
                />
                {uploading && <p className="mt-2 text-sm text-pink-500">Uploading...</p>}
                {formData.image_url && (
                  <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-32 object-cover rounded-lg" />
                )}
              </div>
              
              <label className={`flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <input 
                  type="checkbox" 
                  checked={formData.is_featured || false} 
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} 
                  className="w-5 h-5" 
                />
                Featured
              </label>
            </>
          );
      } else if (activeTab === 'blog') {
        return (
          <>
            <input type="text" placeholder="Title" value={formData.title || ''} onChange={(e) => setFormData({...formData, title: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <textarea placeholder="Excerpt" value={formData.excerpt || ''} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows="2" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <textarea placeholder="Content" value={formData.content || ''} onChange={(e) => setFormData({...formData, content: e.target.value})} rows="6" className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
            <input type="date" value={formData.published_date || ''} onChange={(e) => setFormData({...formData, published_date: e.target.value})} className={`w-full px-4 py-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
          </>
        );
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item ? 'Edit' : 'Add'} {activeTab}</h3>
          <div className="space-y-4 mb-6">{renderFields()}</div>
          <div className="flex gap-4">
            <button onClick={handleSubmit} className={`flex-1 py-3 rounded-lg font-medium ${isDark ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-600 hover:bg-pink-700'} text-white`}>
              <Save className="w-5 h-5 inline mr-2" />Save
            </button>
            <button onClick={onClose} className={`flex-1 py-3 rounded-lg font-medium ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDark ? 'text-white' : 'text-gray-900'}`}>Cancel</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen pt-16 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-white to-pink-100'}`}>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
        
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-lg font-medium capitalize transition-colors whitespace-nowrap ${activeTab === tab ? isDark ? 'bg-pink-500 text-white' : 'bg-pink-600 text-white' : isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 shadow'}`}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <AnalyticsDashboard />}
        
        {activeTab === 'profile' && <ProfileSettings onSave={(p) => setProfile(p)} />}
        
        {activeTab !== 'dashboard' && activeTab !== 'profile' && (
          <div className={`p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className={`text-2xl font-bold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>Manage {activeTab}</h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-pink-200 text-gray-900'}`} />
                </div>
                {selectedItems.length > 0 && (
                  <button onClick={handleBulkDelete} className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white">
                    <Trash2 className="w-5 h-5 inline mr-1" />Delete ({selectedItems.length})
                  </button>
                )}
                <button onClick={() => setShowAddForm(true)} className={`px-4 py-2 rounded-lg ${isDark ? 'bg-pink-500 hover:bg-pink-600' : 'bg-pink-600 hover:bg-pink-700'} text-white whitespace-nowrap`}>
                  <Plus className="w-5 h-5 inline mr-1" />Add New
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12"><div className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</div></div>
            ) : filteredItems.length === 0 ? (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{searchQuery ? 'No results found' : 'No items yet. Click "Add New" to create one.'}</div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-pink-100'}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selectedItems.includes(item.id)} onChange={() => toggleSelectItem(item.id)} className="mt-1 w-5 h-5" />
                      <div className="flex-1">
                        <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.title || item.name || item.degree}</h3>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {activeTab === 'skills' && item.category}
                          {activeTab === 'experience' && `${item.company} • ${item.period}`}
                          {activeTab === 'education' && `${item.school} • ${item.year}`}
                          {activeTab === 'projects' && item.description}
                          {activeTab === 'blog' && item.excerpt}
                        </p>
                        {(activeTab === 'skills' || activeTab === 'projects') && (
                          <button onClick={() => handleToggleFeatured(item)} className={`mt-2 text-xs px-3 py-1 rounded-full ${item.is_featured ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {item.is_featured ? '★ Featured' : '☆ Not Featured'}
                          </button>
                        )}
                        {activeTab === 'experience' && (
                          <button onClick={() => handleToggleCurrent(item)} className={`mt-2 text-xs px-3 py-1 rounded-full ${item.is_current ? 'bg-pink-500 text-white' : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            {item.is_current ? '✓ Current' : 'Past'}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingItem(item)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-pink-50'}`}>
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className={`p-2 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-pink-50'}`}>
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(showAddForm || editingItem) && (
        <AddEditForm item={editingItem} onClose={() => { setShowAddForm(false); setEditingItem(null); }} />
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('Home');
  const [selectedBlogPost, setSelectedBlogPost] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [profile, setProfile] = useState(null);
  const { user, loading, signOut, isAdmin } = useAuth();

  // Load Bootstrap Icons
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleKeydown = (e) => {
      console.log("Pressed:", e.key, "ctrl:", e.ctrlKey); // DEBUG
      if (e.ctrlKey && e.key === '.') {
        setCurrentPage('Admin');
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase.from('profile').select('*').single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const renderPage = () => {
    if (currentPage === 'Admin' && !isAdmin) {
      return <LoginPage onSuccess={() => setCurrentPage('Admin')} />;
    }

    if (currentPage === 'Blog' && selectedBlogPost) {
      return <BlogPostPage post={selectedBlogPost} onBack={() => setSelectedBlogPost(null)} />;
    }

    if (currentPage === 'Projects' && selectedProject) {
      return <ProjectDetailPage project={selectedProject} onBack={() => setSelectedProject(null)} />;
    }

    switch(currentPage) {
      case 'Home': return <HomePage setCurrentPage={setCurrentPage} profile={profile} />;
      case 'About': return <AboutPage profile={profile} />;
      case 'Projects': return <ProjectsPage onSelectProject={setSelectedProject} />;
      case 'Blog': return <BlogPage onSelectPost={setSelectedBlogPost} />;
      case 'Contact': return <ContactPage />;
      case 'Admin': return isAdmin ? <AdminPage /> : <LoginPage onSuccess={() => setCurrentPage('Admin')} />;
      default: return <HomePage setCurrentPage={setCurrentPage} profile={profile} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} isAdmin={isAdmin} logout={() => { signOut(); setCurrentPage('Home'); }} />
        {renderPage()}
      </div>
    </ThemeProvider>
  );
};

export default App;