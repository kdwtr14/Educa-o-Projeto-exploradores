import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trophy, 
  Users, 
  Star, 
  TrendingUp, 
  Trash2, 
  Edit2, 
  X, 
  Check, 
  ChevronRight,
  Award,
  Medal,
  Coins,
  Printer,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface Student {
  id: number;
  name: string;
  points: number;
  categoryPoints?: Record<string, number>;
}

interface CategoryStat {
  category: string;
  total: number;
}

// --- Constants ---

const CLASSES = [
  { name: 'Explorador Iniciante', min: 0, max: 100, color: 'bg-emerald-500', emoji: '🌱' },
  { name: 'Explorador Intermediário', min: 101, max: 200, color: 'bg-indigo-500', emoji: '⚡' },
  { name: 'Explorador Profissional', min: 201, max: 300, color: 'bg-orange-500', emoji: '🔥' },
  { name: 'Explorador Elite', min: 301, max: 400, color: 'bg-amber-500', emoji: '🏆' },
  { name: 'Explorador Mestre', min: 401, max: 500, color: 'bg-purple-500', emoji: '💎' },
  { name: 'Explorador Supremo', min: 501, max: Infinity, color: 'bg-rose-500', emoji: '👑' },
];

const CATEGORIES = ['Organização', 'Disciplina', 'Desempenho'];

// --- Helper Functions ---

const getStudentClass = (points: number) => {
  return CLASSES.find(c => points >= c.min && points <= c.max) || CLASSES[0];
};

const playPointSound = () => {
  console.log('Playing point sound...');
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.error('Audio play failed:', e));
};

// --- Components ---

interface StudentCardProps {
  student: Student;
  rank?: number;
  onAddPoints: (id: number) => void;
  onEdit: (id: number, name: string) => void | Promise<void>;
  onDelete: (id: number) => void | Promise<void>;
}

const StudentCard: React.FC<StudentCardProps> = ({ 
  student, 
  rank,
  onAddPoints, 
  onEdit, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const studentClass = getStudentClass(student.points);
  
  const initials = student.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSave = () => {
    onEdit(student.id, editName);
    setIsEditing(false);
  };

  const getMedal = (r?: number) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return null;
  };

  const medal = getMedal(rank);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border ${rank && rank <= 3 ? 'border-brand-accent/30 bg-brand-accent/5' : 'border-slate-100'} hover:shadow-md transition-shadow relative group`}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${studentClass.color} shadow-inner`}>
            {initials}
          </div>
          {medal && (
            <div className="absolute -top-2 -left-2 text-xl drop-shadow-sm">
              {medal}
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input 
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border-b-2 border-brand-primary outline-none font-bold text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} className="text-emerald-500"><Check size={20}/></button>
              <button onClick={() => setIsEditing(false)} className="text-slate-400"><X size={20}/></button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg truncate text-slate-800">{student.name}</h3>
              <button 
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-brand-primary"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg text-white ${studentClass.color} flex items-center gap-1`}>
              <span>{studentClass.emoji}</span>
              {studentClass.name}
            </span>
            {(Object.entries(student.categoryPoints || {}) as [string, number][]).map(([cat, pts]) => (
              pts > 0 && (
                <span key={cat} className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                  {cat.slice(0, 3)}: {pts}
                </span>
              )
            ))}
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-brand-primary flex items-center justify-end gap-1">
            {student.points}
            <Coins size={16} className="text-brand-accent" />
          </div>
          <button 
            onClick={() => onAddPoints(student.id)}
            className="mt-1 text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 ml-auto no-print"
          >
            Atribuir Pontos <ChevronRight size={12} />
          </button>
        </div>
      </div>

      <button 
        onClick={() => onDelete(student.id)}
        className="absolute -top-2 -right-2 bg-white text-slate-300 hover:text-brand-danger p-1 rounded-full shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [view, setView] = useState<'dashboard' | 'ranking'>('dashboard');

  const handlePrint = () => {
    window.print();
  };

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;
    
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newStudentName }),
    });
    
    setNewStudentName('');
    setShowAddModal(false);
    fetchStudents();
  };

  const handleAddPoints = async (points: number, category: string) => {
    if (!selectedStudentId) return;
    
    await fetch(`/api/students/${selectedStudentId}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ points, category }),
    });
    
    playPointSound();
    setSelectedStudentId(null);
    fetchStudents();
  };

  const handleEditStudent = async (id: number, name: string) => {
    await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    fetchStudents();
  };

  const handleDeleteStudent = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este aluno?')) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    fetchStudents();
  };

  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = async () => {
    console.log('handleReset called');
    setShowResetConfirm(false);
    setResetStatus('Resetando...');
    try {
      console.log('Sending reset request...');
      const response = await fetch('/api/reset', { method: 'POST' });
      console.log('Reset response status:', response.status);
      if (response.ok) {
        await fetchStudents();
        console.log('Students refetched after reset');
        setResetStatus('Sucesso!');
        setTimeout(() => setResetStatus(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Reset failed:', errorData);
        setResetStatus('Erro!');
        setTimeout(() => setResetStatus(null), 3000);
      }
    } catch (error) {
      console.error('Reset error:', error);
      setResetStatus('Erro de conexão!');
      setTimeout(() => setResetStatus(null), 3000);
    }
  };

  const top3 = useMemo(() => students.slice(0, 3), [students]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-primary p-2 rounded-xl text-white">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 leading-none">Exploradores do Conhecimento 4ºB</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Projeto Exploradores do Conhecimento</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 no-print">
            {showResetConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xl border border-red-100">
                <span className="text-[10px] font-bold text-red-600 px-2 uppercase">Zerar tudo?</span>
                <button 
                  onClick={handleReset}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
                >
                  Sim
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="bg-slate-200 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                >
                  Não
                </button>
              </div>
            ) : (
              <>
                {resetStatus && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    resetStatus === 'Sucesso!' ? 'bg-emerald-100 text-emerald-600' : 
                    resetStatus === 'Resetando...' ? 'bg-blue-100 text-blue-600' : 
                    'bg-red-100 text-red-600'
                  }`}>
                    {resetStatus}
                  </span>
                )}
                <button 
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-xl font-bold text-sm text-slate-400 hover:text-brand-danger hover:bg-brand-danger/5 transition-colors flex items-center gap-2"
                  title="Resetar Temporada"
                >
                  <Trash2 size={16} />
                  Zerar
                </button>
              </>
            )}
            <button 
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-brand-primary hover:bg-slate-100 transition-colors no-print"
              title="Imprimir Relatório"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors no-print ${view === 'dashboard' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Painel
            </button>
            <button 
              onClick={() => setView('ranking')}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors no-print ${view === 'ranking' ? 'bg-brand-primary/10 text-brand-primary' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Ranking
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {view === 'dashboard' ? (
          <>
            <div className="flex items-center justify-between mb-8 no-print">
              <div>
                <h2 className="text-3xl font-black text-slate-800">Projeto Exploradores do Conhecimento</h2>
                <p className="text-slate-500 font-medium">Professor Clodovalter de Oliveira</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Adicionar Aluno
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student, index) => (
                <StudentCard 
                  key={student.id} 
                  student={student} 
                  rank={index + 1}
                  onAddPoints={(id) => setSelectedStudentId(id)}
                  onEdit={handleEditStudent}
                  onDelete={handleDeleteStudent}
                />
              ))}
              {students.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <Users size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Nenhum aluno cadastrado</h3>
                  <p className="text-slate-500">Comece adicionando os alunos da sua turma.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black text-slate-800">Ranking da Turma</h2>
              <p className="text-slate-500 font-medium">Os maiores exploradores da temporada.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              {students.map((student, index) => {
                const studentClass = getStudentClass(student.points);
                return (
                  <div 
                    key={student.id}
                    className={`flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 ${index < 3 ? 'bg-brand-primary/5' : ''}`}
                  >
                    <div className="w-8 text-center font-black text-slate-400">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${studentClass.color}`}>
                      {student.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-slate-800">{student.name}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{studentClass.name}</div>
                        {(Object.entries(student.categoryPoints || {}) as [string, number][]).map(([cat, pts]) => (
                          pts > 0 && (
                            <span key={cat} className="text-[8px] font-bold bg-slate-50 text-slate-400 px-1 py-0.5 rounded">
                              {cat[0]}: {pts}
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                    <div className="text-xl font-black text-brand-primary">
                      {student.points}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-800">Novo Aluno</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleAddStudent}>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Nome Completo</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: Maria Vitória"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-brand-primary transition-colors font-bold"
                  />
                </div>
                <button type="submit" className="w-full btn-primary py-4 text-lg">
                  Cadastrar Aluno
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {selectedStudentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Atribuir Pontos</h3>
                  <p className="text-slate-500 font-medium">Selecione o valor e a categoria.</p>
                </div>
                <button onClick={() => setSelectedStudentId(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Valor</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[5, 10].map(val => (
                      <button 
                        key={val}
                        onClick={() => {
                          const category = (document.getElementById('category-select') as HTMLSelectElement).value;
                          handleAddPoints(val, category);
                        }}
                        className="bg-brand-primary/5 hover:bg-brand-primary text-brand-primary hover:text-white border-2 border-brand-primary/20 rounded-2xl py-4 font-black text-2xl transition-all flex flex-col items-center"
                      >
                        +{val}
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Pontos</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Categoria</label>
                  <select 
                    id="category-select"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-4 py-3 outline-none focus:border-brand-primary transition-colors font-bold appearance-none"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-100 py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-6">
          {CLASSES.map(c => (
            <div key={c.name} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full ${c.color}`}></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{c.name}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
