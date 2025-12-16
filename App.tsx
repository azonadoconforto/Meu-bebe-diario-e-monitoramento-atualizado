
import React, { useState, useMemo, FC, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceArea, ComposedChart, Scatter, LabelList } from 'recharts';
import type { Screen, BabyProfile, LoggedEvent, EventType, EventDefinition, Reminder, VaccineInfo, EventCategory, BabyDocument, DashboardWidget, WidgetType } from './types';
import { Icon } from './components/icons';
import { AuthScreen } from './components/Auth';

// -- MOCK DATA & CONSTANTS -- //

const getInitialBirthDate = (): string => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 11);
    return date.toISOString().split('T')[0];
};

const initialProfile: BabyProfile = {
    name: 'João',
    birthDate: getInitialBirthDate(),
    themeColor: 'blue',
    gender: 'male',
};

// Color mapping for categories to mimic the colorful iOS icons
const CATEGORY_COLORS: Record<string, string> = {
    food: 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400',
    activity: 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400',
    growth: 'bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400',
    health: 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400',
    milestone: 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const EVENT_DEFINITIONS: EventDefinition[] = [
    { type: 'breastfeeding', label: 'Amamentação', category: 'food', icon: 'breastfeeding' },
    { type: 'bottle', label: 'Mamadeira', category: 'food', icon: 'bottle' },
    { type: 'baby_food', label: 'Papinha', category: 'food', icon: 'baby_food' },
    { type: 'diaper', label: 'Fralda', category: 'activity', icon: 'diaper' },
    { type: 'sleep', label: 'Sono', category: 'activity', icon: 'sleep' },
    { type: 'stroll', label: 'Passeio', category: 'activity', icon: 'stroll' },
    { type: 'bath', label: 'Banho', category: 'activity', icon: 'bath' },
    { type: 'weight', label: 'Peso', category: 'growth', icon: 'weight', hideInMenu: true },
    { type: 'length', label: 'Altura', category: 'growth', icon: 'length', hideInMenu: true },
    { type: 'measurements', label: 'Medidas', category: 'growth', icon: 'measurements' },
    { type: 'head_circumference', label: 'Perímetro Cefálico', category: 'growth', icon: 'head_circumference' },
    { type: 'doctor', label: 'Consulta', category: 'health', icon: 'doctor' },
    { type: 'vaccine', label: 'Vacinas', category: 'health', icon: 'vaccine' },
    { type: 'temperature', label: 'Temperatura', category: 'health', icon: 'temperature', hideInMenu: true },
    { type: 'illness', label: 'Doenças', category: 'health', icon: 'illness' },
    { type: 'medication', label: 'Remédios', category: 'health', icon: 'medication' },
    { type: 'smiled', label: 'Sorriu', category: 'milestone', icon: 'smiled' },
    { type: 'sat_up', label: 'Sentou', category: 'milestone', icon: 'sat_up' },
    { type: 'crawled', label: 'Engatinhou', category: 'milestone', icon: 'crawled' },
    { type: 'first_step', label: '1º Passos', category: 'milestone', icon: 'first_step' },
    { type: 'walked', label: 'Andou', category: 'milestone', icon: 'walked' },
    { type: 'first_word', label: '1ª Palavra', category: 'milestone', icon: 'first_word' },
    { type: 'first_tooth', label: '1º Dente', category: 'milestone', icon: 'first_tooth' },
    { type: 'custom_milestone', label: 'Evento', category: 'milestone', icon: 'star' },
];

const VACCINATION_SCHEDULE: VaccineInfo[] = [
    // Ao Nascer
    { id: 'bcg', name: 'BCG', description: 'Tuberculose (Dose única)', monthDue: 0 },
    { id: 'hepb_0', name: 'Hepatite B', description: 'Ao nascer', monthDue: 0 },

    // 2 Meses
    { id: 'penta_1', name: 'Pentavalente (D1)', description: 'Difteria, Tétano, Coq, Hep B, Hib', monthDue: 2 },
    { id: 'vip_1', name: 'VIP (Poliomielite) (D1)', description: 'Inativada', monthDue: 2 },
    { id: 'rota_1', name: 'Rotavírus (D1)', description: 'Vacina oral', monthDue: 2 },
    { id: 'pneumo_1', name: 'Pneumocócica 10V (D1)', description: 'Prevenção pneumonia/otite', monthDue: 2 },
    { id: 'meningo_b_1', name: 'Meningocócica B (D1)', description: 'Meningite B', monthDue: 2, isPrivateOnly: true },
    { id: 'meningo_acwy_1', name: 'Meningocócica ACWY (D1)', description: 'Meningites A, C, W, Y', monthDue: 2, isPrivateOnly: true },

    // 3 Meses
    { id: 'meningo_c_1', name: 'Meningocócica C (D1)', description: 'Meningite C', monthDue: 3 },
    { id: 'meningo_b_2', name: 'Meningocócica B (D2)', description: 'Meningite B', monthDue: 3, isPrivateOnly: true },
    { id: 'meningo_acwy_2', name: 'Meningocócica ACWY (D2)', description: 'Meningites A, C, W, Y', monthDue: 3, isPrivateOnly: true },

    // 4 Meses
    { id: 'penta_2', name: 'Pentavalente (D2)', description: 'Difteria, Tétano, Coq, Hep B, Hib', monthDue: 4 },
    { id: 'vip_2', name: 'VIP (Poliomielite) (D2)', description: 'Inativada', monthDue: 4 },
    { id: 'rota_2', name: 'Rotavírus (D2)', description: 'Vacina oral', monthDue: 4 },
    { id: 'pneumo_2', name: 'Pneumocócica 10V (D2)', description: 'Prevenção pneumonia/otite', monthDue: 4 },
    { id: 'meningo_b_3', name: 'Meningocócica B (D3)', description: 'Meningite B', monthDue: 4, isPrivateOnly: true },
    { id: 'meningo_acwy_3', name: 'Meningocócica ACWY (D3)', description: 'Meningites A, C, W, Y', monthDue: 4, isPrivateOnly: true },

    // 5 Meses
    { id: 'meningo_c_2', name: 'Meningocócica C (D2)', description: 'Meningite C', monthDue: 5 },
    { id: 'meningo_b_4', name: 'Meningocócica B (Extra)', description: 'Conforme indicação', monthDue: 5, isPrivateOnly: true },
    { id: 'meningo_acwy_4', name: 'Meningocócica ACWY (Extra)', description: 'Conforme indicação', monthDue: 5, isPrivateOnly: true },

    // 6 Meses
    { id: 'penta_3', name: 'Pentavalente (D3)', description: 'Difteria, Tétano, Coq, Hep B, Hib', monthDue: 6 },
    { id: 'vip_3', name: 'VIP (Poliomielite) (D3)', description: 'Inativada', monthDue: 6 },
    { id: 'flu_1', name: 'Influenza (Gripe)', description: 'Dose anual (início)', monthDue: 6 },

    // 9 Meses
    { id: 'febre_amarela', name: 'Febre Amarela', description: 'Dose inicial', monthDue: 9 },

    // 12 Meses (1 Ano)
    { id: 'triplice_viral_1', name: 'Tríplice Viral (D1)', description: 'Sarampo, Caxumba, Rubéola', monthDue: 12 },
    { id: 'pneumo_ref', name: 'Pneumocócica 10V (Ref)', description: 'Reforço', monthDue: 12 },
    { id: 'meningo_c_ref', name: 'Meningocócica C (Ref)', description: 'Reforço', monthDue: 12 },
    { id: 'meningo_b_ref', name: 'Meningocócica B (Ref)', description: 'Reforço', monthDue: 12, isPrivateOnly: true },
    { id: 'meningo_acwy_ref', name: 'Meningocócica ACWY (Ref)', description: 'Reforço', monthDue: 12, isPrivateOnly: true },

    // 15 Meses
    { id: 'dtp_ref1', name: 'DTP (1º Reforço)', description: 'Difteria, Tétano, Coqueluche', monthDue: 15 },
    { id: 'vop_ref1', name: 'VOP (Poliomielite) (1º Ref)', description: 'Gotinha', monthDue: 15 },
    { id: 'hepa', name: 'Hepatite A', description: 'Dose única no SUS', monthDue: 15 },
    { id: 'tetraviral', name: 'Tetraviral', description: 'Sarampo, Caxumba, Rubéola, Varicela', monthDue: 15 },

    // 4 Anos (48 Meses)
    { id: 'dtp_ref2', name: 'DTP (2º Reforço)', description: 'Difteria, Tétano, Coqueluche', monthDue: 48 },
    { id: 'vop_ref2', name: 'VOP (Poliomielite) (2º Ref)', description: 'Gotinha', monthDue: 48 },
    { id: 'varicela_2', name: 'Varicela (D2)', description: 'Catapora', monthDue: 48 },
    { id: 'febre_amarela_ref', name: 'Febre Amarela (Ref)', description: 'Reforço', monthDue: 48 },
];

const generateMockGrowthData = (birthDate: string): LoggedEvent[] => {
    const data: LoggedEvent[] = [];
    try {
        const startDate = new Date(birthDate.replace(/-/g, '/'));
        if (isNaN(startDate.getTime())) return [];

        for (let i = 0; i < 12; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth() + i, 15);
            if (isNaN(date.getTime())) continue;

            data.push({
                id: `weight-${i}`,
                type: 'weight',
                timestamp: date.toISOString(),
                value: parseFloat((3.5 + i * 0.7 + (Math.random() - 0.5)).toFixed(2)),
                unit: 'kg'
            });
            data.push({
                id: `length-${i}`,
                type: 'length',
                timestamp: date.toISOString(),
                value: parseFloat((50 + i * 2.5 + (Math.random() - 0.5)).toFixed(2)),
                unit: 'cm'
            });
        }
    } catch (e) {
        console.error("Error generating mock data:", e);
    }
    return data;
};

const generateMockSleepData = (): LoggedEvent[] => {
    const events: LoggedEvent[] = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const nightDuration = 8 + Math.random() * 3;
        const nightAwakenings = Math.floor(Math.random() * 4);
        events.push({
            id: `mock-sleep-night-${i}`,
            type: 'sleep',
            timestamp: `${dateStr}T07:00:00`,
            startTime: `${dateStr}T20:00:00`,
            endTime: `${dateStr}T07:00:00`,
            sleepType: 'night',
            value: parseFloat(nightDuration.toFixed(1)),
            unit: 'horas',
            awakenings: nightAwakenings,
            notes: `Sono noturno com ${nightAwakenings} despertares`
        });

        const numNaps = 2 + Math.floor(Math.random() * 3);

        for (let j = 0; j < numNaps; j++) {
            const napDuration = 0.5 + Math.random();
            const hour = 9 + (j * 3) + Math.floor(Math.random());

            events.push({
                id: `mock-sleep-nap-${i}-${j}`,
                type: 'sleep',
                timestamp: `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`,
                startTime: `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`,
                endTime: `${dateStr}T${(hour + 1).toString().padStart(2, '0')}:30:00`,
                sleepType: 'nap',
                value: parseFloat(napDuration.toFixed(1)),
                unit: 'horas',
                notes: `Soneca ${j + 1}`
            });
        }
    }
    return events;
};

const initialEvents: LoggedEvent[] = [
    { id: '1', type: 'first_tooth', timestamp: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(), notes: 'O primeiro dentinho de baixo apareceu!' },
    { id: '2', type: 'sat_up', timestamp: new Date(new Date().setDate(new Date().getDate() - 150)).toISOString(), notes: 'Conseguiu sentar sem apoio por 10 segundos.' },
    ...generateMockGrowthData(initialProfile.birthDate),
    ...generateMockSleepData()
];

const initialReminders: Reminder[] = [
    { id: 'r1', title: 'Pediatra de Rotina', date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), time: '14:30', type: 'doctor', notes: 'Levar exames' },
    { id: 'r2', title: 'Vacina de 1 ano', date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(), time: '09:00', type: 'vaccine' }
];

const initialDocuments: BabyDocument[] = [
    { id: 'd1', title: 'Certidão de Nascimento', type: 'id', notes: 'Matrícula: 123456789' }
];

// -- HELPER FUNCTIONS -- //
const calculateAge = (birthDateString: string, targetDateString: string = new Date().toISOString()): string => {
    if (!birthDateString) return "";
    const birthDate = new Date(birthDateString); // Removed incomplete regex replace, trust standard parsing
    const targetDate = new Date(targetDateString);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return "";

    let years = targetDate.getFullYear() - birthDate.getFullYear();
    let months = targetDate.getMonth() - birthDate.getMonth();
    let days = targetDate.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    if (years === 0 && months === 0 && days === 0) return "No dia do nascimento";
    if (years < 0) return "Pré-nascimento";

    let result = "";
    if (years > 0) result += `${years} ano${years > 1 ? 's' : ''} `;
    if (months > 0) result += `${months} m `;
    if (days > 0) result += `${days} d`;
    return result.trim();
};

const calculateAgeInMonths = (birthDateString: string, targetDateString: string = new Date().toISOString()): number => {
    if (!birthDateString) return 0;
    const birthDate = new Date(birthDateString);
    const targetDate = new Date(targetDateString);

    if (isNaN(birthDate.getTime()) || isNaN(targetDate.getTime())) return 0;

    const diffTime = targetDate.getTime() - birthDate.getTime();
    return Math.max(0, diffTime / (1000 * 60 * 60 * 24 * 30.44));
};

const calculateDuration = (start: string, end: string): string => {
    if (!start || !end) return "0h 0m";
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    let diffM = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffM < 0) diffM += 24 * 60; // Handle overnight

    const h = Math.floor(diffM / 60);
    const m = diffM % 60;
    return `${h}h ${m}m`;
};

// -- UI COMPONENTS -- //

const Header: FC<{ title: string; onBack?: () => void; rightAction?: React.ReactNode }> = ({ title, onBack, rightAction }) => (
    <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <div className="flex items-center">
            {onBack && (
                <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <Icon name="chevron_left" className="w-6 h-6" />
                </button>
            )}
            <h1 className="text-xl font-bold text-gray-800 dark:text-white transition-colors">{title}</h1>
        </div>
        {rightAction}
    </div>
);

const BottomNav: FC<{ active: Screen; setActive: (screen: Screen) => void, profile: BabyProfile }> = ({ active, setActive, profile }) => {
    const navItems: { screen: Screen; icon: string; label: string }[] = [
        { screen: 'home', icon: 'home', label: 'Início' },
        { screen: 'diary', icon: 'diary', label: 'Diário' },
        { screen: 'stats', icon: 'stats', label: 'Gráficos' },
        { screen: 'settings', icon: 'settings', label: 'Ajustes' },
    ];

    const activeColor = profile.themeColor === 'pink' ? 'text-pink-500' : profile.themeColor === 'purple' ? 'text-purple-500' : profile.themeColor === 'green' ? 'text-green-500' : 'text-blue-500';

    return (
        <div className="grid grid-cols-4 gap-1 pb-safe bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)] transition-colors">
            {navItems.map(item => (
                <button
                    key={item.screen}
                    onClick={() => setActive(item.screen)}
                    className={`flex flex-col items-center justify-center pt-3 pb-1 transition-colors ${active === item.screen ? activeColor : 'text-gray-400 dark:text-gray-500'}`}
                >
                    <Icon name={item.icon} className={`w-6 h-6 mb-1 ${active === item.screen ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
                    <span className="text-[10px] font-medium">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

// -- HELPER FOR SHORTCUTS -- //
const HomeShortcutsControl: FC<{
    eventType: EventType,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ eventType, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {

    // Check if it's pinned to milestones (top bar)
    const isPinnedToMilestones = pinnedMilestones.includes(eventType);

    // Determine widget type based on event category
    const def = EVENT_DEFINITIONS.find(d => d.type === eventType);
    const widgetType: WidgetType = def?.category === 'milestone' ? 'last_milestone' : 'quick_actions';

    // Check if the relevant widget exists in summary
    const isPinnedToSummary = widgets.some(w => w.type === widgetType);

    const toggleMilestone = () => {
        if (isPinnedToMilestones) {
            setPinnedMilestones(pinnedMilestones.filter(m => m !== eventType));
        } else {
            setPinnedMilestones([...pinnedMilestones, eventType]);
        }
    };

    const toggleSummary = () => {
        if (isPinnedToSummary) {
            // Remove all widgets of this type (simple approach)
            setWidgets(widgets.filter(w => w.type !== widgetType));
        } else {
            setWidgets([...widgets, { id: Date.now().toString(), type: widgetType }]);
        }
    };

    return (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-3 tracking-wider">Atalhos da Tela Inicial</h4>
            <div className="flex gap-3">
                <button
                    onClick={toggleMilestone}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${isPinnedToMilestones ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-transparent bg-white dark:bg-gray-700 text-gray-500'}`}
                >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPinnedToMilestones ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {isPinnedToMilestones && <Icon name="check_circle" className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-bold">Fixar em Marcos</span>
                </button>
                <button
                    onClick={toggleSummary}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${isPinnedToSummary ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'border-transparent bg-white dark:bg-gray-700 text-gray-500'}`}
                >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isPinnedToSummary ? 'border-orange-500 bg-orange-500' : 'border-gray-300'}`}>
                        {isPinnedToSummary && <Icon name="check_circle" className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-bold">Fixar em Resumo</span>
                </button>
            </div>
        </div>
    );
};

// -- MODAL COMPONENTS -- //

const MeasurementsModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent[]) => void, // Accepts array to save both if needed
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            const now = new Date();
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            setWeight('');
            setHeight('');
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        const events: LoggedEvent[] = [];
        const timestamp = new Date(`${date}T${time}`).toISOString();

        if (weight) {
            events.push({
                id: Date.now().toString(),
                type: 'weight',
                timestamp,
                value: parseFloat(weight),
                unit: 'kg',
                notes: notes ? notes : undefined
            });
        }

        if (height) {
            events.push({
                id: (Date.now() + 1).toString(), // Ensure unique ID
                type: 'length',
                timestamp,
                value: parseFloat(height),
                unit: 'cm',
                notes: notes ? notes : undefined
            });
        }

        onSave(events);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="measurements" className="w-5 h-5 text-green-500" />
                        Medidas
                    </h2>
                    <button onClick={handleSave} className="text-green-500 font-bold" disabled={!weight && !height}>Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-2 text-green-500">
                                <Icon name="weight" className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 mb-2">PESO</h3>
                            <div className="relative w-full">
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={e => setWeight(e.target.value)}
                                    placeholder="0.00"
                                    step="0.01"
                                    className="w-full text-center text-3xl font-bold bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-300"
                                />
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">kg</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-2 text-blue-500">
                                <Icon name="length" className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-500 mb-2">ALTURA</h3>
                            <div className="relative w-full">
                                <input
                                    type="number"
                                    value={height}
                                    onChange={e => setHeight(e.target.value)}
                                    placeholder="0.0"
                                    step="0.1"
                                    className="w-full text-center text-3xl font-bold bg-transparent border-none outline-none text-gray-800 dark:text-white placeholder-gray-300"
                                />
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">cm</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                    </div>

                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Observações..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[80px]"
                    />

                    <HomeShortcutsControl eventType="measurements" pinnedMilestones={pinnedMilestones} setPinnedMilestones={setPinnedMilestones} widgets={widgets} setWidgets={setWidgets} />
                </div>
            </div>
        </div>
    );
};

const PlagiocephalyInfo: FC<{ currentAsymmetry?: number, currentAge?: number }> = ({ currentAsymmetry, currentAge }) => {
    // Defines the stacked area chart data for Plagiocephaly severity zones.
    // Zones stack: Green (Mild), Yellow (Medium), Red (Severe).
    // Y-axis is mm.
    // Step logic: 
    // 0-5 months: Mild < 4, Medium 4-20, Severe > 20
    // 6-18 months: Mild < 4, Medium 4-10, Severe > 10
    const data = [
        { age: 0, mild: 4, medium: 16, severe: 10 }, // 4+16=20, 20+10=30
        { age: 5, mild: 4, medium: 16, severe: 10 },
        { age: 6, mild: 4, medium: 6, severe: 20 },  // 4+6=10, 10+20=30
        { age: 18, mild: 4, medium: 6, severe: 20 },
    ];

    const pointData = (currentAsymmetry !== undefined && currentAge !== undefined) ? [
        { age: currentAge, value: currentAsymmetry }
    ] : [];

    return (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <h4 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <Icon name="info" className="w-5 h-5 text-blue-500" />
                Protocolo Plagiocefalia
            </h4>
            <div className="h-56 w-full mb-4 bg-white dark:bg-gray-900 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <XAxis dataKey="age" type="number" domain={[0, 18]} label={{ value: 'Meses', position: 'insideBottomRight', offset: -5, fontSize: 10 }} allowDataOverflow={false} ticks={[0, 5, 10, 15, 18]} />
                        <YAxis type="number" domain={[0, 25]} label={{ value: 'mm', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />

                        {/* Stacked Areas for Zones */}
                        <Area type="stepAfter" dataKey="mild" stackId="1" stroke="none" fill="#4ade80" fillOpacity={0.5} name="Leve" />
                        <Area type="stepAfter" dataKey="medium" stackId="1" stroke="none" fill="#facc15" fillOpacity={0.5} name="Médio" />
                        <Area type="stepAfter" dataKey="severe" stackId="1" stroke="none" fill="#f87171" fillOpacity={0.5} name="Severo" />

                        {/* Current User Point */}
                        {pointData.length > 0 && (
                            <Scatter data={pointData} fill="#3b82f6" shape="circle">
                                <LabelList dataKey="value" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#3b82f6' }} formatter={(val: number) => `${val}mm`} />
                            </Scatter>
                        )}
                        <ReferenceArea x1={0} x2={18} y1={0} y2={25} fill="transparent" stroke="none" />
                    </ComposedChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-center text-gray-400 mt-1">Índice de assimetria (mm) x Idade (meses)</p>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span><strong>Severo:</strong> Encaminhamento para neurocirurgião (Capacete).</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span><strong>Médio:</strong> Almofada Mimos e tratamento postural.</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span><strong>Leve:</strong> Acompanhamento.</span>
                </div>
                <p className="mt-2 italic">A curva indica o limite máximo aceitável de assimetria (mm) conforme a idade avança. Quanto mais velho o bebê, menor a tolerância para correção natural.</p>
            </div>
        </div>
    );
}

const BreastfeedingModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [mode, setMode] = useState<'timer' | 'manual'>('timer');
    const [duration, setDuration] = useState(0); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [side, setSide] = useState<'left' | 'right' | 'both'>('left');
    const [manualDuration, setManualDuration] = useState(''); // minutes
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        let interval: any;
        if (isRunning) {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setNotes(initialEvent.notes || '');
                setSide(initialEvent.breastfeedingSide || 'left');
                if (initialEvent.breastfeedingDuration) {
                    setManualDuration(initialEvent.breastfeedingDuration.toString());
                    setMode('manual');
                } else {
                    setMode('manual');
                }
                setIsRunning(false);
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setDuration(0);
                setIsRunning(false);
                setSide('left');
                setNotes('');
                setManualDuration('');
                setMode('timer');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    const handleSave = () => {
        let finalDuration = 0;
        if (mode === 'timer') {
            finalDuration = Math.ceil(duration / 60);
        } else {
            finalDuration = parseInt(manualDuration) || 0;
        }

        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'breastfeeding',
            timestamp: new Date(`${date}T${time}`).toISOString(),
            value: finalDuration,
            unit: 'min',
            breastfeedingSide: side,
            breastfeedingDuration: finalDuration,
            notes: notes || `Amamentação (${side === 'left' ? 'Esq' : side === 'right' ? 'Dir' : 'Ambos'}) - ${finalDuration} min`,
        };
        onSave(event);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="breastfeeding" className="w-5 h-5 text-orange-500" />
                        Amamentação
                    </h2>
                    <button onClick={handleSave} className="text-orange-500 font-bold">Salvar</button>
                </div>

                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-none sm:rounded-none w-full">
                    <button onClick={() => setMode('timer')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${mode === 'timer' ? 'bg-white dark:bg-gray-700 shadow text-orange-500' : 'text-gray-400'}`}>Cronômetro</button>
                    <button onClick={() => setMode('manual')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider transition-all ${mode === 'manual' ? 'bg-white dark:bg-gray-700 shadow text-orange-500' : 'text-gray-400'}`}>Manual</button>
                </div>

                <div className="p-6 flex flex-col items-center space-y-6 overflow-y-auto">
                    {mode === 'timer' ? (
                        <>
                            {/* Timer Display */}
                            <div className="flex flex-col items-center justify-center w-56 h-56 rounded-full border-8 border-orange-100 dark:border-orange-900/30 relative shadow-inner bg-orange-50/50 dark:bg-transparent">
                                <span className="text-5xl font-mono font-bold text-gray-800 dark:text-white tabular-nums">{formatTime(duration)}</span>
                                <span className="text-xs font-bold text-orange-400 uppercase tracking-widest mt-2">{isRunning ? 'Em Andamento' : 'Pausado'}</span>
                                {isRunning && (
                                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-4 w-full px-4">
                                <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 py-4 rounded-2xl font-bold text-white shadow-lg transform active:scale-95 transition-all text-lg flex items-center justify-center gap-2 ${isRunning ? 'bg-orange-300' : 'bg-orange-500'}`}>
                                    <Icon name={isRunning ? 'pause' : 'play'} className="w-6 h-6" />
                                    {isRunning ? 'Pausar' : 'Iniciar'}
                                </button>
                                <button onClick={() => { setIsRunning(false); setDuration(0); }} className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center justify-center active:bg-gray-200 dark:active:bg-gray-700 transition">
                                    <Icon name="close" className="w-6 h-6" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="w-full">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Duração (minutos)</label>
                            <input
                                type="number"
                                value={manualDuration}
                                onChange={e => setManualDuration(e.target.value)}
                                placeholder="0"
                                className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-3xl font-bold text-center text-gray-800 dark:text-white outline-none focus:ring-2 ring-orange-500"
                            />
                        </div>
                    )}

                    {/* Side Selector */}
                    <div className="w-full">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lado</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'left', label: 'Esquerda', emoji: '⬅' },
                                { id: 'right', label: 'Direita', emoji: '➡' },
                                { id: 'both', label: 'Ambos', emoji: '↔️' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSide(opt.id as any)}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${side === opt.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div className="flex gap-4 w-full">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                    </div>

                    {/* Notes */}
                    <div className="w-full">
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Comentários..."
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[80px]"
                        />
                    </div>

                    {/* Home Shortcuts */}
                    <div className="w-full">
                        <HomeShortcutsControl
                            eventType="breastfeeding"
                            pinnedMilestones={pinnedMilestones}
                            setPinnedMilestones={setPinnedMilestones}
                            widgets={widgets}
                            setWidgets={setWidgets}
                        />
                    </div>

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

const EventModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    profile: BabyProfile,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, profile, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [notes, setNotes] = useState('');
    const [eventType, setEventType] = useState<EventType>('custom_milestone');

    // Diaper Specifics
    const [diaperPee, setDiaperPee] = useState(false);
    const [diaperPoop, setDiaperPoop] = useState(false);

    // Medication Specifics
    const [medicationName, setMedicationName] = useState('');
    const [medicationDosage, setMedicationDosage] = useState('');
    const [medicationDuration, setMedicationDuration] = useState('');

    // Plagiocephaly Info Toggle & Input
    const [showPlagioInfo, setShowPlagioInfo] = useState(false);
    const [plagioAsymmetry, setPlagioAsymmetry] = useState('');

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && initialEvent) {
            const dt = new Date(initialEvent.timestamp);
            setDate(dt.toISOString().split('T')[0]);
            setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            setNotes(initialEvent.notes || '');
            setEventType(initialEvent.type);

            if (initialEvent.type === 'diaper') {
                const content = initialEvent.diaperContent || [];
                setDiaperPee(content.includes('pee'));
                setDiaperPoop(content.includes('poop'));
            }

            if (initialEvent.type === 'medication') {
                setMedicationName(initialEvent.medicationName || '');
                setMedicationDosage(initialEvent.medicationDosage || '');
                setMedicationDuration(initialEvent.medicationDuration || '');
            }

            if (initialEvent.type === 'head_circumference' && initialEvent.plagiocephalyAsymmetry !== undefined) {
                setPlagioAsymmetry(initialEvent.plagiocephalyAsymmetry.toString());
            }

            setPhotoPreview(initialEvent.attachmentData || null);
        } else if (isOpen) {
            const now = new Date();
            setDate(now.toISOString().split('T')[0]);
            setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            setNotes('');
            setDiaperPee(false);
            setDiaperPoop(false);
            setMedicationName('');
            setMedicationDosage('');
            setMedicationDuration('');
            setPhotoPreview(null);
            setShowPlagioInfo(false);
            setPlagioAsymmetry('');
            // If opening fresh, use the passed event type if available
            if (initialEvent) setEventType(initialEvent.type);
        }
    }, [isOpen, initialEvent]);

    if (!isOpen || !initialEvent) return null;

    const definition = EVENT_DEFINITIONS.find(d => d.type === eventType) || EVENT_DEFINITIONS.find(d => d.type === 'custom_milestone')!;
    const calculatedAge = calculateAge(profile.birthDate, date);
    const calculatedAgeInMonths = calculateAgeInMonths(profile.birthDate, date);

    const handleSave = () => {
        const updatedEvent: LoggedEvent = {
            ...initialEvent,
            type: eventType,
            timestamp: new Date(`${date}T${time}`).toISOString(),
            notes,
            attachmentData: photoPreview || undefined
        };

        if (eventType === 'diaper') {
            updatedEvent.diaperContent = [];
            if (diaperPee) updatedEvent.diaperContent.push('pee');
            if (diaperPoop) updatedEvent.diaperContent.push('poop');
            // Auto-generate note if empty
            if (!notes) updatedEvent.notes = `Fralda com ${diaperPee ? 'xixi' : ''}${diaperPee && diaperPoop ? ' e ' : ''}${diaperPoop ? 'cocô' : ''}`;
        }

        if (eventType === 'medication') {
            updatedEvent.medicationName = medicationName;
            updatedEvent.medicationDosage = medicationDosage;
            updatedEvent.medicationDuration = medicationDuration;
            if (!notes) updatedEvent.notes = `${medicationName} - ${medicationDosage}`;
        }

        if (eventType === 'head_circumference') {
            updatedEvent.plagiocephalyAsymmetry = plagioAsymmetry ? parseFloat(plagioAsymmetry) : undefined;
        }

        onSave(updatedEvent);
        onClose();
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 p-2">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name={definition.icon} className="w-5 h-5 text-blue-500" />
                        {definition.label}
                    </h2>
                    <button onClick={handleSave} className="text-blue-500 font-bold p-2">Salvar</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Date Picker */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hora</label>
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-blue-500 font-medium text-center bg-blue-50 dark:bg-blue-900/20 py-2 rounded-lg -mt-4">
                        Idade: {calculatedAge}
                    </p>

                    {/* Head Circumference Info Toggle & Input */}
                    {eventType === 'head_circumference' && (
                        <div>
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Assimetria (mm)</label>
                                <input
                                    type="number"
                                    value={plagioAsymmetry}
                                    onChange={e => setPlagioAsymmetry(e.target.value)}
                                    placeholder="Ex: 4"
                                    className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={() => setShowPlagioInfo(!showPlagioInfo)}
                                className="w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Icon name="info" className="w-5 h-5" />
                                {showPlagioInfo ? 'Ocultar Protocolo' : 'Ver Protocolo Plagiocefalia'}
                            </button>
                            {showPlagioInfo && <PlagiocephalyInfo currentAsymmetry={plagioAsymmetry ? parseFloat(plagioAsymmetry) : undefined} currentAge={calculatedAgeInMonths} />}
                        </div>
                    )}

                    {/* Diaper Specific Fields (Unchanged) */}
                    {eventType === 'diaper' && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Conteúdo</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDiaperPee(!diaperPee)}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center ${diaperPee ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <span className="text-4xl mb-2">💧</span>
                                    <span className={`text-sm font-bold ${diaperPee ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'}`}>Xixi</span>
                                </button>
                                <button
                                    onClick={() => setDiaperPoop(!diaperPoop)}
                                    className={`flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center ${diaperPoop ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <span className="text-4xl mb-2">💩</span>
                                    <span className={`text-sm font-bold ${diaperPoop ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`}>Cocô</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Medication Specific Fields (Unchanged) */}
                    {eventType === 'medication' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medicamento</label>
                                <input type="text" placeholder="Ex: Paracetamol" value={medicationName} onChange={e => setMedicationName(e.target.value)} className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dosagem / Como usar</label>
                                <input type="text" placeholder="Ex: 10 gotas ou 5ml" value={medicationDosage} onChange={e => setMedicationDosage(e.target.value)} className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Por quanto tempo</label>
                                <input type="text" placeholder="Ex: 5 dias" value={medicationDuration} onChange={e => setMedicationDuration(e.target.value)} className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white outline-none" />
                            </div>
                        </div>
                    )}

                    {/* Media Attachments (Prominent for Stroll/Bath/Diaper) */}
                    {(['stroll', 'bath', 'diaper', 'custom_milestone'].includes(eventType) || definition.category === 'milestone') && (
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Foto do Momento</label>
                            {photoPreview ? (
                                <div className="relative rounded-xl overflow-hidden h-48 w-full group">
                                    <img src={photoPreview} className="w-full h-full object-cover" />
                                    <button onClick={() => setPhotoPreview(null)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"><Icon name="close" className="w-4 h-4" /></button>
                                </div>
                            ) : (
                                <div className="flex space-x-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-8 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition border-2 border-dashed border-gray-300 dark:border-gray-700">
                                        <Icon name="camera" className="w-8 h-8 mb-2" />
                                        <span className="text-xs font-bold">Adicionar Foto</span>
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            {eventType === 'diaper' ? 'Observações (Cor, textura)' : 'Comentários'}
                        </label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Escreva aqui..."
                            className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 min-h-[100px] resize-none"
                        />
                    </div>

                    {/* Home Shortcuts */}
                    <HomeShortcutsControl
                        eventType={eventType}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={widgets}
                        setWidgets={setWidgets}
                    />

                    {onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const BottleModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [amount, setAmount] = useState<number>(120);
    const [content, setContent] = useState<'formula' | 'breast_milk' | 'cow_milk' | 'water' | 'juice'>('formula');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setAmount(initialEvent.bottleAmount || 120);
                setContent(initialEvent.bottleContent || 'formula');
                setNotes(initialEvent.notes || '');
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setAmount(120);
                setContent('formula');
                setNotes('');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const handleSave = () => {
        const contentLabels = { formula: 'Fórmula', breast_milk: 'Leite Materno', cow_milk: 'Leite de Vaca', water: 'Água', juice: 'Suco' };

        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'bottle',
            timestamp: new Date(`${date}T${time}`).toISOString(),
            value: amount,
            unit: 'ml',
            bottleAmount: amount,
            bottleContent: content,
            notes: notes || `${contentLabels[content]} - ${amount}ml`,
        };
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="bottle" className="w-5 h-5 text-blue-500" />
                        Mamadeira
                    </h2>
                    <button onClick={handleSave} className="text-blue-500 font-bold">Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Amount Slider/Input */}
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold text-blue-500 mb-2">{amount}<span className="text-xl text-gray-400 ml-1">ml</span></span>
                        <input
                            type="range"
                            min="0"
                            max="300"
                            step="10"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="flex gap-2 mt-4">
                            {[60, 90, 120, 150, 180, 210].map(val => (
                                <button key={val} onClick={() => setAmount(val)} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">{val}</button>
                            ))}
                        </div>
                    </div>

                    {/* Content Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Conteúdo</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'formula', label: 'Fórmula', emoji: '🍼' },
                                { id: 'breast_milk', label: 'Leite Materno', emoji: '🤱' },
                                { id: 'cow_milk', label: 'Leite Vaca', emoji: '🐮' },
                                { id: 'water', label: 'Água/Suco', emoji: '🧃' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setContent(opt.id as any)}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${content === opt.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date/Time */}
                    <div className="flex gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                    </div>

                    {/* Notes */}
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Marca da fórmula ou observações..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[80px]"
                    />

                    <HomeShortcutsControl eventType="bottle" pinnedMilestones={pinnedMilestones} setPinnedMilestones={setPinnedMilestones} widgets={widgets} setWidgets={setWidgets} />

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const FoodModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
    const [acceptance, setAcceptance] = useState<'all' | 'most' | 'some' | 'refused'>('all');
    const [ingredients, setIngredients] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setMealType(initialEvent.mealType || 'lunch');
                setAcceptance(initialEvent.foodAcceptance || 'all');
                setIngredients(initialEvent.foodIngredients || '');
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setIngredients('');
                setAcceptance('all');
                setMealType('lunch');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const handleSave = () => {
        const mealLabels = { breakfast: 'Café da Manhã', lunch: 'Almoço', dinner: 'Jantar', snack: 'Lanche' };
        const acceptanceLabels = { all: 'Comeu tudo', most: 'Comeu bem', some: 'Comeu pouco', refused: 'Recusou' };

        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'baby_food',
            timestamp: new Date(`${date}T${time}`).toISOString(),
            mealType,
            foodAcceptance: acceptance,
            foodIngredients: ingredients,
            notes: `${mealLabels[mealType]} - ${acceptanceLabels[acceptance]}. ${ingredients}`,
        };
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="baby_food" className="w-5 h-5 text-green-500" />
                        Refeição
                    </h2>
                    <button onClick={handleSave} className="text-green-500 font-bold">Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Meal Type */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Refeição</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'breakfast', label: 'Café', emoji: '🥑' },
                                { id: 'lunch', label: 'Almoço', emoji: '🍴' },
                                { id: 'snack', label: 'Lanche', emoji: '🍎' },
                                { id: 'dinner', label: 'Jantar', emoji: '🍴' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setMealType(opt.id as any)}
                                    className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all ${mealType === opt.id ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">O que comeu?</label>
                        <textarea
                            value={ingredients}
                            onChange={e => setIngredients(e.target.value)}
                            placeholder="Ex: Arroz, feijão, cenoura..."
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[60px]"
                        />
                    </div>

                    {/* Acceptance */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Aceitação</label>
                        <div className="flex justify-between gap-2">
                            {[
                                { id: 'all', label: 'Tudo', emoji: '😋' },
                                { id: 'most', label: 'Bem', emoji: '🙂' },
                                { id: 'some', label: 'Pouco', emoji: '😕' },
                                { id: 'refused', label: 'Nada', emoji: '🤐' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setAcceptance(opt.id as any)}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${acceptance === opt.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Date/Time */}
                    <div className="flex gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                    </div>

                    <HomeShortcutsControl eventType="baby_food" pinnedMilestones={pinnedMilestones} setPinnedMilestones={setPinnedMilestones} widgets={widgets} setWidgets={setWidgets} />

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const IllnessModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [temp, setTemp] = useState<string>('');
    const [medication, setMedication] = useState('');
    const [treatment, setTreatment] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    const commonSymptoms = [
        { label: 'Febre', emoji: '🤒' },
        { label: 'Tosse', emoji: '😷' },
        { label: 'Vômito', emoji: '🤮' },
        { label: 'Diarreia', emoji: '💩' },
        { label: 'Coriza', emoji: '🤧' },
        { label: 'Erupção', emoji: '🔴' },
        { label: 'Dor de ouvido', emoji: '👂' },
        { label: 'Sem apetite', emoji: '🤐' },
        { label: 'Cansaço', emoji: '😴' }
    ];

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setDiagnosis(initialEvent.illnessDiagnosis || '');
                setSymptoms(initialEvent.illnessSymptoms || []);
                setTemp(initialEvent.illnessTemperature ? initialEvent.illnessTemperature.toString() : '');
                setMedication(initialEvent.medicationName || '');
                setTreatment(initialEvent.illnessTreatment || '');
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setDiagnosis('');
                setSymptoms([]);
                setTemp('');
                setMedication('');
                setTreatment('');
            }
        }
    }, [isOpen, initialEvent]);

    const toggleSymptom = (sym: string) => {
        if (symptoms.includes(sym)) setSymptoms(symptoms.filter(s => s !== sym));
        else setSymptoms([...symptoms, sym]);
    };

    if (!isOpen) return null;

    const handleSave = () => {
        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'illness',
            timestamp: new Date(`${date}T${time}`).toISOString(),
            illnessDiagnosis: diagnosis,
            illnessSymptoms: symptoms,
            illnessTemperature: temp ? parseFloat(temp) : undefined,
            illnessTreatment: treatment,
            notes: `Diagnóstico: ${diagnosis || 'Não especificado'}. ${symptoms.length > 0 ? 'Sintomas: ' + symptoms.join(', ') : ''}. ${medication ? 'Remédio: ' + medication : ''}`,
            medicationName: medication // storing here for quick access too
        };
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="illness" className="w-5 h-5 text-red-500" />
                        Registro de Doença
                    </h2>
                    <button onClick={handleSave} className="text-red-500 font-bold">Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Diagnosis */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome / Diagnóstico</label>
                        <input type="text" placeholder="Ex: Gripe, Otite, Virose..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-lg font-bold outline-none" />
                    </div>

                    {/* Symptoms */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sintomas</label>
                        <div className="flex flex-wrap gap-2">
                            {commonSymptoms.map(sym => (
                                <button
                                    key={sym.label}
                                    onClick={() => toggleSymptom(sym.label)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${symptoms.includes(sym.label) ? 'bg-red-500 text-white border-red-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <span className="mr-1">{sym.emoji}</span>
                                    {sym.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Temp & Date */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Temp (°C)</label>
                            <input type="number" placeholder="36.5" step="0.1" value={temp} onChange={e => setTemp(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        </div>
                        <div className="w-24">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Hora</label>
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        </div>
                    </div>

                    {/* Medication */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Medicamento Prescrito</label>
                        <input type="text" placeholder="Nome e dosagem" value={medication} onChange={e => setMedication(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                    </div>

                    {/* Treatment Notes */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tratamento / Notas</label>
                        <textarea
                            value={treatment}
                            onChange={e => setTreatment(e.target.value)}
                            placeholder="Repouso, muita água, observar febre..."
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[80px]"
                        />
                    </div>
                    <HomeShortcutsControl eventType="illness" pinnedMilestones={pinnedMilestones} setPinnedMilestones={setPinnedMilestones} widgets={widgets} setWidgets={setWidgets} />

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
};

const DoctorModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [specialty, setSpecialty] = useState('Pediatra');
    const [doctorName, setDoctorName] = useState('');
    const [reason, setReason] = useState('Rotina');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setSpecialty(initialEvent.doctorSpecialty || 'Pediatra');
                setDoctorName(initialEvent.doctorName || '');
                setReason(initialEvent.visitReason || 'Rotina');
                setWeight(initialEvent.value ? initialEvent.value.toString() : '');
                // Note: We don't have separate field for height in event root, usually notes or custom fields. 
                // For simplicity assuming stored in notes or derived. 
                // Given previous implementation structure, let's keep blank or extract from notes if parsed.
                // For this fix, let's just reset height unless we add a specific field to LoggedEvent.
                setNotes(initialEvent.notes || '');
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setDoctorName('');
                setReason('Rotina');
                setWeight('');
                setHeight('');
                setNotes('');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const handleSave = () => {
        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'doctor',
            timestamp: new Date(`${date}T${time}`).toISOString(),
            doctorName,
            doctorSpecialty: specialty,
            visitReason: reason,
            value: weight ? parseFloat(weight) : undefined, // Store weight as main value if present
            unit: weight ? 'kg' : undefined,
            notes: `Motivo: ${reason}. Médico: ${doctorName || 'Não informado'}. ${weight ? 'Peso: ' + weight + 'kg. ' : ''}${height ? 'Altura: ' + height + 'cm. ' : ''}\nNotas: ${notes}`,
        };
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="doctor" className="w-5 h-5 text-blue-500" />
                        Consulta
                    </h2>
                    <button onClick={handleSave} className="text-blue-500 font-bold">Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-5">
                    {/* ... fields ... */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Especialidade</label>
                            <input type="text" value={specialty} onChange={e => setSpecialty(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Motivo</label>
                            <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nome do Médico</label>
                        <input type="text" placeholder="Dr. Fulano" value={doctorName} onChange={e => setDoctorName(e.target.value)} className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-lg font-bold" />
                    </div>

                    <div className="flex gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                    </div>

                    {/* Measurements */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Medidas na Consulta</h4>
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <input type="number" placeholder="0.0" step="0.01" value={weight} onChange={e => setWeight(e.target.value)} className="w-full p-3 pl-3 pr-8 bg-white dark:bg-gray-800 rounded-xl outline-none border border-gray-200 dark:border-gray-600" />
                                <span className="absolute right-3 top-3 text-gray-400 text-sm">kg</span>
                            </div>
                            <div className="flex-1 relative">
                                <input type="number" placeholder="0.0" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full p-3 pl-3 pr-8 bg-white dark:bg-gray-800 rounded-xl outline-none border border-gray-200 dark:border-gray-600" />
                                <span className="absolute right-3 top-3 text-gray-400 text-sm">cm</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes/Prescriptions */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Anotações / Prescrições</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="Resumo da consulta..."
                            className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[100px]"
                        />
                    </div>
                    <HomeShortcutsControl eventType="doctor" pinnedMilestones={pinnedMilestones} setPinnedMilestones={setPinnedMilestones} widgets={widgets} setWidgets={setWidgets} />

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const MilestoneConfigModal: FC<{
    isOpen: boolean;
    onClose: () => void;
    pinnedMilestones: string[];
    setPinnedMilestones: (types: string[]) => void;
}> = ({ isOpen, onClose, pinnedMilestones, setPinnedMilestones }) => {
    if (!isOpen) return null;

    const allMilestones: EventDefinition[] = EVENT_DEFINITIONS.filter(e => e.category === 'milestone');

    const toggleMilestone = (type: string) => {
        if (pinnedMilestones.includes(type)) {
            setPinnedMilestones(pinnedMilestones.filter(t => t !== type));
        } else {
            setPinnedMilestones([...pinnedMilestones, type]);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-bounce-in flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Editar Atalhos de Marcos</h3>
                    <button onClick={onClose} className="text-blue-500 font-bold">Pronto</button>
                </div>
                <p className="text-sm text-gray-500 mb-4">Selecione quais marcos aparecem na tela inicial.</p>
                <div className="overflow-y-auto space-y-3 pb-safe">
                    {allMilestones.map(m => (
                        <div key={m.type} onClick={() => toggleMilestone(m.type)} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500 flex items-center justify-center">
                                    <Icon name={m.icon} className="w-6 h-6" />
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white">{m.label}</span>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${pinnedMilestones.includes(m.type) ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-600'}`}>
                                {pinnedMilestones.includes(m.type) && <Icon name="check_circle" className="w-4 h-4 text-white" />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SleepModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    onDelete?: (id: string) => void,
    initialEvent: LoggedEvent | null,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void,
    widgets: DashboardWidget[],
    setWidgets: (w: DashboardWidget[]) => void
}> = ({ isOpen, onClose, onSave, onDelete, initialEvent, pinnedMilestones, setPinnedMilestones, widgets, setWidgets }) => {
    const [sleepType, setSleepType] = useState<'night' | 'nap'>('night');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [awakenings, setAwakenings] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setStartTime(initialEvent.startTime || dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setEndTime(initialEvent.endTime || dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setSleepType(initialEvent.sleepType || 'night');
                setAwakenings(initialEvent.awakenings || 0);
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setStartTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                // Default end time 1 hour later
                now.setHours(now.getHours() + 1);
                setEndTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setAwakenings(0);
                setSleepType('night');
            }
        }
    }, [isOpen, initialEvent]);

    if (!isOpen) return null;

    const handleSave = () => {
        const [startH, startM] = startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);

        let diffM = (endH * 60 + endM) - (startH * 60 + startM);
        if (diffM < 0) diffM += 24 * 60;
        const durationHours = parseFloat((diffM / 60).toFixed(2));

        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'sleep',
            timestamp: new Date(date + 'T' + startTime).toISOString(),
            startTime,
            endTime,
            sleepType,
            awakenings: sleepType === 'night' ? awakenings : undefined,
            value: durationHours,
            unit: 'horas',
            notes: sleepType === 'night' ? `Sono Noturno com ${awakenings} despertares` : 'Soneca'
        };
        onSave(event);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 p-2">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="sleep" className="w-5 h-5 text-blue-500" />
                        Registro de Sono
                    </h2>
                    <button onClick={handleSave} className="text-blue-500 font-bold p-2">Salvar</button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Toggle Type */}
                    <div className="flex gap-2">
                        {[
                            { id: 'night', label: 'Sono Noturno', emoji: '🌙' },
                            { id: 'nap', label: 'Soneca', emoji: '💤' }
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSleepType(opt.id as any)}
                                className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${sleepType === opt.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                            >
                                <span className="text-2xl mb-1">{opt.emoji}</span>
                                <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{opt.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 border border-gray-100 dark:border-gray-700"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Início</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 border border-gray-100 dark:border-gray-700"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fim</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-lg font-semibold text-gray-800 dark:text-white outline-none focus:ring-2 ring-blue-500 border border-gray-100 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    {/* Duration Display */}
                    <div className="flex justify-center">
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-2 rounded-full">
                            <span className="text-sm text-blue-500 font-medium">Duração Total: </span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{calculateDuration(startTime, endTime)}</span>
                        </div>
                    </div>

                    {/* Awakenings (Only for Night Sleep) */}
                    {sleepType === 'night' && (
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">Despertares</h4>
                                    <p className="text-xs text-gray-400">Quantas vezes acordou?</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button onClick={() => setAwakenings(Math.max(0, awakenings - 1))} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">-</button>
                                    <span className="text-2xl font-bold text-gray-800 dark:text-white w-8 text-center">{awakenings}</span>
                                    <button onClick={() => setAwakenings(awakenings + 1)} className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400">+</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Home Shortcuts */}
                    <HomeShortcutsControl
                        eventType="sleep"
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={widgets}
                        setWidgets={setWidgets}
                    />

                    {initialEvent && onDelete && (
                        <button
                            onClick={() => { onDelete(initialEvent.id); onClose(); }}
                            className="w-full py-3 mt-4 text-red-500 font-medium border border-red-200 dark:border-red-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                            Excluir Registro
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const WhiteNoiseWidget: FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedSound, setSelectedSound] = useState<'womb' | 'shush'>('womb');
    const [timer, setTimer] = useState<number | null>(null);

    // Audio Context Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    // Visualizer bars
    const bars = [1, 2, 3, 2, 1];

    useEffect(() => {
        return () => {
            if (sourceNodeRef.current) {
                try {
                    sourceNodeRef.current.stop();
                } catch (e) {
                    // ignore
                }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                if (timer && timer > 0) setTimer(t => t! - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timer]);

    const createNoiseBuffer = (ctx: AudioContext, type: 'white' | 'pink' | 'brown') => {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);

        if (type === 'white') {
            for (let i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        } else if (type === 'pink') {
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.075076;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11; // (roughly) compensate for gain
                b6 = white * 0.115926;
            }
        } else if (type === 'brown') {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5; // (roughly) compensate for gain
            }
        }
        return buffer;
    };

    const playSound = async (type: string) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContextRef.current;

        // Stop previous sound
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }

        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);
        gainNodeRef.current = gainNode;

        let noiseType: 'white' | 'pink' | 'brown' = 'brown';
        let filterFreq = 1000;

        // Sound characteristics configuration
        if (type === 'womb') { noiseType = 'brown'; filterFreq = 200; gainNode.gain.value = 1.0; }
        else if (type === 'shush') { noiseType = 'pink'; filterFreq = 1500; gainNode.gain.value = 0.5; }

        const buffer = createNoiseBuffer(ctx, noiseType);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        // Apply basic filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = filterFreq;

        source.connect(filter);
        filter.connect(gainNode);

        source.start();
        sourceNodeRef.current = source;
        setIsPlaying(true);
    };

    const stopSound = () => {
        if (sourceNodeRef.current) {
            sourceNodeRef.current.stop();
        }
        setIsPlaying(false);
    };

    const togglePlay = () => {
        if (isPlaying) stopSound();
        else playSound(selectedSound);
    };

    const handleSoundSelection = (soundId: 'womb' | 'shush') => {
        setSelectedSound(soundId);
        playSound(soundId);
    };

    const sounds: { id: string; label: string; icon: string }[] = [
        { id: 'womb', label: 'Útero', icon: 'baby_face' },
        { id: 'shush', label: 'Shh', icon: 'microphone' },
    ];

    const handleNext = () => {
        const currentIndex = sounds.findIndex(s => s.id === selectedSound);
        const nextIndex = (currentIndex + 1) % sounds.length;
        handleSoundSelection(sounds[nextIndex].id as any);
    };

    const handlePrev = () => {
        const currentIndex = sounds.findIndex(s => s.id === selectedSound);
        const prevIndex = (currentIndex - 1 + sounds.length) % sounds.length;
        handleSoundSelection(sounds[prevIndex].id as any);
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm flex items-center gap-2">
                    <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-500">
                        <Icon name="music" className="w-4 h-4" />
                    </div>
                    Ruído Branco
                </h4>
                {isPlaying && (
                    <div className="flex items-end gap-0.5 h-4">
                        {bars.map((h, i) => (
                            <div key={i} className="w-1 bg-purple-500 animate-pulse rounded-full" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-xl mb-4 overflow-x-auto scrollbar-hide">
                {sounds.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => handleSoundSelection(s.id as any)}
                        className={`flex flex-col items-center p-2 rounded-lg transition-all min-w-[60px] ${selectedSound === s.id ? 'bg-white dark:bg-gray-600 shadow-sm text-purple-500' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                        <Icon name={s.icon} className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-bold">{s.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <button onClick={handlePrev} className="p-3 text-gray-400 hover:text-purple-500 transition-colors">
                    <Icon name="skip_previous" className="w-6 h-6" />
                </button>
                <button
                    onClick={togglePlay}
                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${isPlaying ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-purple-500 text-white shadow-md hover:bg-purple-600'}`}
                >
                    <Icon name={isPlaying ? 'pause' : 'play'} className="w-6 h-6" />
                    {isPlaying ? 'Pausar' : 'Tocar'}
                </button>
                <button onClick={handleNext} className="p-3 text-gray-400 hover:text-purple-500 transition-colors">
                    <Icon name="skip_next" className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

// ... HomeScreen, SettingsScreen, AddEventScreen, DiaryScreen, StatsScreen, ProfileScreen, VaccinationScreen, AgendaScreen remain largely unchanged structurally, 
// just ensure AddEventScreen uses correct hideInMenu check and DiaryScreen calls handleOpenDetailedModal properly

const HomeScreen: FC<{
    profile: BabyProfile;
    setScreen: (screen: Screen) => void;
    events: LoggedEvent[];
    reminders: Reminder[];
    widgets: DashboardWidget[];
    setWidgets: (w: DashboardWidget[]) => void;
    openEventModal: (event: LoggedEvent) => void;
    pinnedMilestones: string[];
    onConfigMilestones: () => void;
}> = ({ profile, setScreen, events, reminders, widgets, setWidgets, openEventModal, pinnedMilestones, onConfigMilestones }) => {
    // ... same content as previously provided ...
    const [showWidgetSelector, setShowWidgetSelector] = useState(false);

    // Only show pinned milestones
    const displayedMilestones = EVENT_DEFINITIONS.filter(d => pinnedMilestones.includes(d.type));

    // Check which milestones have been logged
    const loggedMilestones = events.filter(e => {
        const def = EVENT_DEFINITIONS.find(d => d.type === e.type);
        return def?.category === 'milestone';
    });

    const getLoggedMilestone = (type: string) => {
        // Get the latest one
        return loggedMilestones.filter(m => m.type === type).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }

    const handleMilestoneClick = (type: string) => {
        const existing = getLoggedMilestone(type);
        if (existing) {
            openEventModal(existing);
        } else {
            const newEvent: LoggedEvent = {
                id: new Date().toISOString(),
                type: type as EventType,
                timestamp: new Date().toISOString()
            }
            openEventModal(newEvent);
        }
    }
    // ... widget logic ...
    const addWidget = (type: WidgetType) => {
        setWidgets([...widgets, { id: Date.now().toString(), type }]);
        setShowWidgetSelector(false);
    };

    const removeWidget = (id: string) => {
        setWidgets(widgets.filter(w => w.id !== id));
    };

    const handleQuickAction = (type: EventType) => {
        const newEvent: LoggedEvent = {
            id: new Date().toISOString(),
            type,
            timestamp: new Date().toISOString(),
        };
        openEventModal(newEvent);
    }

    // ... renderWidget ...
    const renderWidget = (widget: DashboardWidget) => {
        switch (widget.type) {
            case 'next_reminder':
                const nextReminder = reminders.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                return (
                    <div key={widget.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                        <button onClick={() => removeWidget(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><Icon name="close" className="w-4 h-4" /></button>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg"><Icon name="bell" className="w-5 h-5" /></div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">Próximo Evento</h4>
                        </div>
                        {nextReminder ? (
                            <div>
                                <p className="font-bold text-lg text-gray-800 dark:text-white">{nextReminder.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(nextReminder.date).toLocaleDateString('pt-BR')} às {nextReminder.time}</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Nenhum lembrete futuro.</p>
                        )}
                    </div>
                );
            case 'quick_actions':
                return (
                    <div key={widget.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                        <button onClick={() => removeWidget(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><Icon name="close" className="w-4 h-4" /></button>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3">Acesso Rápido</h4>
                        <div className="flex justify-between gap-2">
                            <button onClick={() => handleQuickAction('sleep')} className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-xl flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                                <Icon name="sleep" className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-bold">Sono</span>
                            </button>
                            <button onClick={() => handleQuickAction('bottle')} className="flex-1 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-xl flex flex-col items-center justify-center text-orange-600 dark:text-orange-400">
                                <Icon name="bottle" className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-bold">Comer</span>
                            </button>
                            <button onClick={() => handleQuickAction('diaper')} className="flex-1 bg-green-50 dark:bg-green-900/20 p-2 rounded-xl flex flex-col items-center justify-center text-green-600 dark:text-green-400">
                                <Icon name="diaper" className="w-5 h-5 mb-1" />
                                <span className="text-[10px] font-bold">Fralda</span>
                            </button>
                        </div>
                    </div>
                );
            case 'white_noise':
                return (
                    <div key={widget.id} className="relative group">
                        <button onClick={() => removeWidget(widget.id)} className="absolute top-3 right-3 z-10 text-gray-400 hover:text-red-500 transition-colors bg-white/80 dark:bg-gray-800/80 rounded-full p-1 backdrop-blur-sm"><Icon name="close" className="w-4 h-4" /></button>
                        <WhiteNoiseWidget />
                    </div>
                );
            case 'last_milestone':
                const lastMilestone = events.filter(e => {
                    const def = EVENT_DEFINITIONS.find(d => d.type === e.type);
                    return def?.category === 'milestone';
                }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

                const mDef = lastMilestone ? EVENT_DEFINITIONS.find(d => d.type === lastMilestone.type) : null;

                return (
                    <div key={widget.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative group">
                        <button onClick={() => removeWidget(widget.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"><Icon name="close" className="w-4 h-4" /></button>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                            <Icon name="star" className="w-4 h-4 text-yellow-500" />
                            Última Conquista
                        </h4>
                        {lastMilestone && mDef ? (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                                    <Icon name={mDef.icon} className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white">{mDef.label}</p>
                                    <p className="text-xs text-gray-500">{new Date(lastMilestone.timestamp).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">Nenhuma conquista registrada.</p>
                        )}
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="flex-grow flex flex-col transition-colors">
            {/* ... same profile header ... */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 pt-8 pb-4 flex items-center justify-between shadow-sm rounded-b-[2rem] transition-colors sticky top-0 z-10">
                <div onClick={() => setScreen('profile')} className="flex items-center space-x-4 cursor-pointer active:opacity-70 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-md flex items-center justify-center overflow-hidden relative">
                        {profile.photo ? (
                            <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <Icon name="baby_face" className="w-10 h-10 text-gray-400" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{profile.name}</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{calculateAge(profile.birthDate)}</p>
                    </div>
                </div>
            </div>

            {/* Marcos do Bebê */}
            <div className="mt-6 mb-2">
                <div className="flex items-center justify-between px-6 mb-4">
                    {/* Title & Settings */}
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Marcos do Bebê</h3>
                        <button onClick={onConfigMilestones} className="text-gray-400 hover:text-blue-500 bg-transparent p-1 rounded-full">
                            <Icon name="settings" className="w-4 h-4" />
                        </button>
                    </div>
                    {/* Add Button */}
                    <button
                        onClick={() => setScreen('add-event')}
                        className="w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm transition-colors"
                    >
                        <Icon name="plus" className="w-5 h-5" />
                    </button>
                </div>

                {/* Horizontal List with Circular Buttons */}
                <div className="flex overflow-x-auto px-6 space-x-5 pb-4 scrollbar-hide">
                    {displayedMilestones.length === 0 ? (
                        <div onClick={onConfigMilestones} className="flex flex-col items-center justify-center min-w-[80px] h-24 text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer">
                            <Icon name="plus" className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[10px] font-bold">Configurar</span>
                        </div>
                    ) : (
                        displayedMilestones.map(m => {
                            const isMilestone = m.category === 'milestone';
                            const logged = isMilestone ? getLoggedMilestone(m.type) : null;
                            const isCompleted = !!logged;

                            return (
                                <button key={m.type} onClick={() => handleMilestoneClick(m.type)} className="flex flex-col items-center gap-2 flex-shrink-0 group relative">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-transform transform group-active:scale-95 ${CATEGORY_COLORS[m.category] || 'bg-gray-100 text-gray-500'}`}>
                                        <Icon name={m.icon} className="w-8 h-8" />
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 text-center leading-none max-w-[70px] truncate">{m.label}</span>

                                    {isCompleted && (
                                        <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 border-2 border-white dark:border-gray-900">
                                            <Icon name="check_circle" className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Customizable Summary / Dashboard */}
            <div className="px-6 space-y-4 mb-24">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Resumo</h3>
                    <button
                        onClick={() => setShowWidgetSelector(true)}
                        className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                    >
                        {widgets.length === 0 ? 'Customizar' : 'Adicionar'}
                    </button>
                </div>

                {/* Empty State */}
                {widgets.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center">
                        <p className="text-gray-400 text-sm mb-3">Adicione widgets para acesso rápido ao que importa.</p>
                        <button onClick={() => setShowWidgetSelector(true)} className="text-blue-500 font-bold text-sm">+ Adicionar ao Resumo</button>
                    </div>
                )}

                {/* Widget Grid */}
                <div className="space-y-4">
                    {widgets.map((w) => renderWidget(w))}
                </div>
            </div>

            {showWidgetSelector && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowWidgetSelector(false)}>
                    <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-bounce-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Adicionar ao Resumo</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => addWidget('next_reminder')} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left">
                                <Icon name="bell" className="w-6 h-6 text-red-500 mb-2" />
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">Próximo Evento</span>
                                <span className="text-[10px] text-gray-500">Da sua agenda</span>
                            </button>
                            <button onClick={() => addWidget('white_noise')} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left">
                                <Icon name="music" className="w-6 h-6 text-purple-500 mb-2" />
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">Ruído Branco</span>
                                <span className="text-[10px] text-gray-500">Player de sons</span>
                            </button>
                            <button onClick={() => addWidget('quick_actions')} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left">
                                <Icon name="plus" className="w-6 h-6 text-blue-500 mb-2" />
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">Ações Rápidas</span>
                                <span className="text-[10px] text-gray-500">Botões de atalho</span>
                            </button>
                            <button onClick={() => addWidget('last_milestone')} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition text-left">
                                <Icon name="star" className="w-6 h-6 text-yellow-500 mb-2" />
                                <span className="block font-bold text-gray-800 dark:text-white text-sm">Último Marco</span>
                                <span className="text-[10px] text-gray-500">Destaque recente</span>
                            </button>
                        </div>
                        <button onClick={() => setShowWidgetSelector(false)} className="w-full mt-6 py-3 text-gray-500 font-bold">Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

const SettingsScreen: FC<{ profile: BabyProfile, setProfile: (p: BabyProfile) => void, setScreen: (s: Screen) => void, darkMode: boolean, setDarkMode: (v: boolean) => void }> = ({ profile, setProfile, setScreen, darkMode, setDarkMode }) => {
    return (
        <div className="flex-grow flex flex-col transition-colors">
            <Header title="Ajustes" />
            <div className="p-4 space-y-6">
                {/* Profile Card */}
                <div onClick={() => setScreen('profile')} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between cursor-pointer active:bg-gray-50 dark:active:bg-gray-700 transition">
                    <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                            {profile.photo ? <img src={profile.photo} className="w-full h-full object-cover" /> : <Icon name="baby_face" className="w-8 h-8 text-gray-500 dark:text-gray-400" />}
                        </div>
                        <div>
                            <p className="font-bold text-lg text-gray-800 dark:text-white">{profile.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Toque para editar perfil</p>
                        </div>
                    </div>
                    <Icon name="chevron_right" className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                </div>

                {/* Settings Group */}
                <div className="space-y-2">
                    <h4 className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Aparência</h4>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors p-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-yellow-100 text-orange-500'}`}>
                                    {darkMode ? <Icon name="moon" className="w-5 h-5" /> : <Icon name="sun" className="w-5 h-5" />}
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Tema Padrão do App</span>
                            </div>
                        </div>

                        {/* Explicit Theme Selector */}
                        <div className="flex gap-2 mb-6">
                            {[
                                { id: false, label: 'Claro', emoji: '☀️' },
                                { id: true, label: 'Escuro', emoji: '🌙' }
                            ].map(opt => (
                                <button
                                    key={String(opt.id)}
                                    onClick={() => setDarkMode(opt.id)}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${darkMode === opt.id ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Theme Color Selector */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-900/30`}>
                                    <Icon name="star" className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-gray-700 dark:text-gray-200">Cor do Tema</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {[
                                { id: 'blue', label: 'Azul', emoji: '🚙' },
                                { id: 'pink', label: 'Rosa', emoji: '🦄' },
                                { id: 'purple', label: 'Roxo', emoji: '👾' },
                                { id: 'green', label: 'Verde', emoji: '🦖' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setProfile({ ...profile, themeColor: opt.id as any })}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${profile.themeColor === opt.id ? `border-${opt.id}-500 bg-${opt.id}-50 dark:bg-${opt.id}-900/30 text-${opt.id}-600` : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AddEventScreen: FC<{
    setScreen: (s: Screen) => void,
    addEvent: (event: LoggedEvent) => void,
    openModal: (e: LoggedEvent) => void,
    onSleepClick: () => void,
    onBreastfeedingClick: () => void,
    onBottleClick: () => void,
    onFoodClick: () => void,
    onIllnessClick: () => void,
    onDoctorClick: () => void,
    onMeasurementsClick: () => void,
    pinnedMilestones: string[],
    setPinnedMilestones: (m: string[]) => void
}> = ({ setScreen, addEvent, openModal, onSleepClick, onBreastfeedingClick, onBottleClick, onFoodClick, onIllnessClick, onDoctorClick, onMeasurementsClick, pinnedMilestones, setPinnedMilestones }) => {
    // ... same as before but ensure EVENT_DEFINITIONS filters hideInMenu ...
    const categoriesOrder = ['activity', 'food', 'growth', 'health', 'milestone'];
    const categoryLabels: Record<string, string> = {
        activity: 'Atividades', food: 'Alimentação', growth: 'Crescimento', health: 'Saúde', milestone: 'Marcos'
    };

    const timerRef = useRef<any>(null);

    const handleTouchStart = (type: string, category: string) => {
        if (category !== 'milestone') return;
        timerRef.current = setTimeout(() => {
            const isPinned = pinnedMilestones.includes(type);
            if (isPinned) {
                setPinnedMilestones(pinnedMilestones.filter(p => p !== type));
                alert("Removido da tela inicial");
            } else {
                setPinnedMilestones([...pinnedMilestones, type]);
                alert("Adicionado à tela inicial");
            }
            timerRef.current = null;
        }, 500);
    };

    const handleTouchEnd = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleAddEvent = (type: EventType, category: EventCategory) => {
        if (timerRef.current) return;

        if (type === 'vaccine') { setScreen('vaccination'); return; }
        if (type === 'sleep') { onSleepClick(); return; }
        if (type === 'breastfeeding') { onBreastfeedingClick(); return; }
        if (type === 'bottle') { onBottleClick(); return; }
        if (type === 'baby_food') { onFoodClick(); return; }
        if (type === 'illness') { onIllnessClick(); return; }
        if (type === 'doctor') { onDoctorClick(); return; }
        if (type === 'measurements') { onMeasurementsClick(); return; }

        if (category === 'milestone' || ['diaper', 'medication', 'stroll', 'bath', 'head_circumference'].includes(type)) {
            const newEvent: LoggedEvent = {
                id: new Date().toISOString(),
                type,
                timestamp: new Date().toISOString(),
            };
            openModal(newEvent);
            return;
        }

        const newEvent: LoggedEvent = {
            id: new Date().toISOString(),
            type,
            timestamp: new Date().toISOString(),
        };
        addEvent(newEvent);
        setScreen('home');
    }

    // Filter out hidden events
    const visibleEvents = EVENT_DEFINITIONS.filter(def => !def.hideInMenu);

    return (
        <div className="flex-grow flex flex-col transition-colors">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-20 transition-colors">
                <button onClick={() => setScreen('home')} className="text-blue-500 font-medium text-lg">Cancelar</button>
                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Novo Registro</h2>
                <div className="w-16"></div> {/* Spacer */}
            </div>

            <div className="p-4 pb-20 overflow-y-auto">
                {categoriesOrder.map(catKey => (
                    <div key={catKey} className="mb-6">
                        <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider mb-3 ml-1">{categoryLabels[catKey]}</h3>
                        <div className="grid grid-cols-4 gap-y-6">
                            {visibleEvents.filter(def => def.category === catKey).map(def => (
                                <button
                                    key={def.type}
                                    onMouseDown={() => handleTouchStart(def.type, def.category)}
                                    onMouseUp={handleTouchEnd}
                                    onTouchStart={() => handleTouchStart(def.type, def.category)}
                                    onTouchEnd={handleTouchEnd}
                                    onClick={() => handleAddEvent(def.type, def.category)}
                                    className="flex flex-col items-center group relative"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-transform group-active:scale-95 ${CATEGORY_COLORS[def.category]}`}>
                                        <Icon name={def.icon} className="w-7 h-7" />
                                    </div>
                                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300 text-center leading-tight px-1">{def.label}</span>
                                    {pinnedMilestones.includes(def.type) && (
                                        <div className="absolute top-0 right-1 w-4 h-4 bg-blue-500 rounded-full border border-white flex items-center justify-center">
                                            <Icon name="check_circle" className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DiaryScreen: FC<{ events: LoggedEvent[], onEditEvent: (event: LoggedEvent) => void }> = ({ events, onEditEvent }) => {
    // ... same logic as before ...
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Group categories for filter bar
    const filterOptions = [
        { id: 'all', label: 'Todos', icon: 'backup' },
        ...EVENT_DEFINITIONS.filter(def => !def.hideInMenu && def.category !== 'milestone').map(def => ({ id: def.type, label: def.label, icon: def.icon })),
        { id: 'milestone', label: 'Marcos', icon: 'star' }
    ];

    const filteredEvents = useMemo(() => {
        if (filterCategory === 'all') return events;
        if (filterCategory === 'milestone') {
            return events.filter(e => {
                const def = EVENT_DEFINITIONS.find(d => d.type === e.type);
                return def?.category === 'milestone';
            });
        }
        return events.filter(e => e.type === filterCategory);
    }, [events, filterCategory]);

    const groupedEvents = useMemo(() => {
        const groups: Record<string, LoggedEvent[]> = {};
        const sorted = [...filteredEvents].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        sorted.forEach(event => {
            const date = new Date(event.timestamp);
            const key = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
            if (!groups[key]) groups[key] = [];
            groups[key].push(event);
        });
        return groups;
    }, [filteredEvents]);

    return (
        <div className="flex-grow flex flex-col transition-colors h-full">
            <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-100 dark:border-gray-800 transition-colors">
                <Header title="Diário" />
                {/* Filter Bar */}
                <div className="py-3 px-4 overflow-x-auto scrollbar-hide flex gap-3">
                    {filterOptions.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setFilterCategory(opt.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${filterCategory === opt.id ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}
                        >
                            {opt.id !== 'all' && <Icon name={opt.icon} className={`w-4 h-4 ${filterCategory === opt.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />}
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-6 pb-24">
                {Object.entries(groupedEvents).map(([date, dayEvents]: [string, LoggedEvent[]]) => (
                    <div key={date}>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 sticky top-[108px] bg-gray-100/90 dark:bg-gray-900/90 backdrop-blur py-2 z-10 transition-colors rounded-lg px-2">{date}</h3>
                        <div className="space-y-3">
                            {dayEvents.map(event => {
                                const def = EVENT_DEFINITIONS.find(d => d.type === event.type) || EVENT_DEFINITIONS.find(d => d.type === 'custom_milestone')!;
                                return (
                                    <div key={event.id} onClick={() => onEditEvent(event)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 active:scale-[0.98] transition-transform cursor-pointer">
                                        <div className={`p-3 rounded-xl ${CATEGORY_COLORS[def.category] || 'bg-gray-100 text-gray-500'}`}>
                                            <Icon name={def.icon} className="w-5 h-5" />
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-800 dark:text-white text-sm">{def.label}</h4>
                                                <span className="text-xs text-gray-400 font-medium">{new Date(event.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            {event.value && <p className="text-sm text-gray-600 dark:text-gray-300 font-semibold mt-0.5">{event.value} {event.unit}</p>}
                                            {event.plagiocephalyAsymmetry !== undefined && <p className="text-sm font-bold text-blue-500 mt-0.5">Assimetria: {event.plagiocephalyAsymmetry}mm</p>}
                                            {event.illnessDiagnosis && <p className="text-sm font-bold text-red-500">{event.illnessDiagnosis}</p>}
                                            {event.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{event.notes}</p>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                {filteredEvents.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Icon name="document" className="w-12 h-12 mb-2 opacity-50" />
                        <p>Nenhum registro encontrado</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ... StatsScreen, ProfileScreen, VaccinationScreen, AgendaScreen remain largely unchanged ...

const StatsScreen: FC<{ events: LoggedEvent[], isDarkMode: boolean, setScreen: (s: Screen) => void, profile: BabyProfile }> = ({ events, isDarkMode, setScreen, profile }) => {
    // ... same as provided ...
    const growthData = useMemo(() => {
        const relevantEvents = events.filter(e => e.type === 'weight' || e.type === 'length');
        const sorted = relevantEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const map = new Map<string, any>();

        sorted.forEach(e => {
            const dateObj = new Date(e.timestamp);
            const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

            if (!map.has(dateStr)) {
                map.set(dateStr, { date: dateStr, originalTimestamp: dateObj.getTime() });
            }
            const entry = map.get(dateStr);

            if (e.type === 'weight') entry.weight = e.value;
            if (e.type === 'length') entry.length = e.value;
        });

        return Array.from(map.values()).sort((a, b) => a.originalTimestamp - b.originalTimestamp);
    }, [events]);

    const plagioEvent = events.filter(e => e.type === 'head_circumference' && e.plagiocephalyAsymmetry !== undefined).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    const plagioAge = plagioEvent ? calculateAgeInMonths(profile.birthDate, plagioEvent.timestamp) : undefined;

    return (
        <div className="flex-grow flex flex-col transition-colors h-full">
            <Header title="Gráficos" />
            <div className="p-4 space-y-6 pb-24">
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <div className="flex -space-x-1">
                            <div className="z-10 p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-500"><Icon name="weight" className="w-4 h-4" /></div>
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-500"><Icon name="length" className="w-4 h-4" /></div>
                        </div>
                        Crescimento (Peso x Altura)
                    </h4>
                    <div className="h-64 w-full">
                        {growthData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={growthData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#f3f4f6'} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDarkMode ? '#9ca3af' : '#9ca3af' }} axisLine={false} tickLine={false} />

                                    <YAxis yAxisId="left" orientation="left" stroke="#22c55e" tick={{ fontSize: 10, fill: '#22c55e' }} axisLine={false} tickLine={false} width={30} label={{ value: 'kg', position: 'insideTopLeft', offset: 10, fill: '#22c55e', fontSize: 10 }} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" tick={{ fontSize: 10, fill: '#3b82f6' }} axisLine={false} tickLine={false} width={30} label={{ value: 'cm', position: 'insideTopRight', offset: 10, fill: '#3b82f6', fontSize: 10 }} />

                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: isDarkMode ? '#1f2937' : '#fff', color: isDarkMode ? '#fff' : '#000' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                    <Line yAxisId="left" type="monotone" dataKey="weight" name="Peso (kg)" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: isDarkMode ? '#1f2937' : '#fff' }} activeDot={{ r: 6 }} connectNulls />
                                    <Line yAxisId="right" type="monotone" dataKey="length" name="Altura (cm)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: isDarkMode ? '#1f2937' : '#fff' }} activeDot={{ r: 6 }} connectNulls />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : <p className="text-center text-gray-400 text-sm py-10">Sem dados de crescimento</p>}
                    </div>
                </div>

                <PlagiocephalyInfo currentAsymmetry={plagioEvent?.plagiocephalyAsymmetry} currentAge={plagioAge} />
            </div>
        </div>
    )
}
const ProfileScreen: FC<{
    profile: BabyProfile,
    setProfile: (p: BabyProfile) => void,
    setScreen: (s: Screen) => void,
    documents: BabyDocument[],
    setDocuments: (d: BabyDocument[]) => void
}> = ({ profile, setProfile, setScreen, documents, setDocuments }) => {
    // ... same as provided ...
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfile({ ...profile, photo: reader.result as string });
            reader.readAsDataURL(file);
        }
    };

    const addDocument = () => {
        const title = prompt("Nome do documento");
        if (title) {
            setDocuments([...documents, { id: Date.now().toString(), title, type: 'other' }]);
        }
    };

    const removeDocument = (id: string) => {
        setDocuments(documents.filter(d => d.id !== id));
    };

    return (
        <div className="flex-grow flex flex-col transition-colors h-full">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 z-20">
                <button onClick={() => setScreen('settings')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                    <Icon name="chevron_left" className="w-6 h-6" />
                </button>
                <h2 className="font-bold text-lg text-gray-800 dark:text-white">Perfil do Bebê</h2>
                <div className="w-8"></div>
            </div>

            <div className="p-6 space-y-8 pb-24">
                <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-xl flex items-center justify-center overflow-hidden relative group mb-4">
                        {profile.photo ? (
                            <img src={profile.photo} alt={profile.name} className="w-full h-full object-cover" />
                        ) : (
                            <Icon name="baby_face" className="w-12 h-12 text-gray-400" />
                        )}
                        <button onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="camera" className="w-8 h-8 text-white" />
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    <input
                        type="text"
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="text-center text-2xl font-bold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none transition-colors text-gray-800 dark:text-white w-full"
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nascimento</label>
                        <input
                            type="date"
                            value={profile.birthDate}
                            onChange={e => setProfile({ ...profile, birthDate: e.target.value })}
                            className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl text-gray-800 dark:text-white outline-none border border-gray-100 dark:border-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gênero</label>
                        <div className="flex gap-2">
                            {[
                                { id: 'male', label: 'Menino', emoji: '👦' },
                                { id: 'female', label: 'Menina', emoji: '👧' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setProfile({ ...profile, gender: opt.id as any })}
                                    className={`flex-1 flex flex-col items-center p-2 rounded-xl border-2 transition-all ${profile.gender === opt.id ? (opt.id === 'male' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-pink-500 bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400') : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <span className="text-2xl mb-1">{opt.emoji}</span>
                                    <span className="text-[10px] font-bold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">Documentos</h3>
                        <button onClick={addDocument} className="text-blue-500 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">+ Adicionar</button>
                    </div>
                    {documents.length > 0 ? (
                        <div className="space-y-3">
                            {documents.map(doc => (
                                <div key={doc.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500">
                                            <Icon name="document" className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 dark:text-white text-sm">{doc.title}</p>
                                            <p className="text-xs text-gray-400 uppercase">{doc.type}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeDocument(doc.id)} className="text-gray-300 hover:text-red-500 transition">
                                        <Icon name="trash" className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 text-center py-4">Nenhum documento salvo.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const VaccineModal: FC<{
    isOpen: boolean,
    onClose: () => void,
    onSave: (event: LoggedEvent) => void,
    vaccine: VaccineInfo | null,
    initialEvent: LoggedEvent | null
}> = ({ isOpen, onClose, onSave, vaccine, initialEvent }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [site, setSite] = useState<'left_arm' | 'right_arm' | 'left_leg' | 'right_leg' | 'mouth'>('left_leg');
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialEvent) {
                const dt = new Date(initialEvent.timestamp);
                setDate(dt.toISOString().split('T')[0]);
                setTime(dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                setNotes(initialEvent.notes || '');
                setSite(initialEvent.vaccineSite || 'left_leg');
                setPhoto(initialEvent.vaccinePhoto);
            } else {
                const now = new Date();
                setDate(now.toISOString().split('T')[0]);
                setTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
                // Defaults
                setNotes('');
                setSite('left_leg');
                setPhoto(undefined);
            }
        }
    }, [isOpen, initialEvent, vaccine]);

    if (!isOpen || !vaccine) return null;

    const handleSave = () => {
        const timestamp = new Date(`${date}T${time}`).toISOString();
        const event: LoggedEvent = {
            id: initialEvent ? initialEvent.id : Date.now().toString(),
            type: 'vaccine',
            vaccineId: vaccine.id,
            timestamp,
            vaccineSite: site,
            vaccinePhoto: photo,
            notes: notes ? notes : undefined
        };
        onSave(event);
        onClose();
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon name="vaccine" className="w-5 h-5 text-blue-500" />
                        {vaccine.name}
                    </h2>
                    <button onClick={handleSave} className="text-blue-500 font-bold">Salvar</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Date & Time */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data e Hora</label>
                        <div className="flex gap-4">
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                            <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-24 p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none" />
                        </div>
                    </div>

                    {/* Site Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Local de Aplicação</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'left_leg', label: 'Perna Esq', icon: '🦵' },
                                { id: 'right_leg', label: 'Perna Dir', icon: '🦵' },
                                { id: 'left_arm', label: 'Braço Esq', icon: '💪' },
                                { id: 'right_arm', label: 'Braço Dir', icon: '💪' },
                                { id: 'mouth', label: 'Oral', icon: '👄' }
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSite(opt.id as any)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${site === opt.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}
                                >
                                    <span>{opt.icon}</span>
                                    <span className="font-bold text-xs">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Photo */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comprovante / Foto</label>
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors relative overflow-hidden">
                            {photo ? (
                                <img src={photo} alt="Comprovante" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <Icon name="camera" className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-xs text-gray-400">Toque para adicionar foto</span>
                                </>
                            )}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                    </div>

                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Lote, laboratório ou observações..."
                        className="w-full p-3 bg-gray-100 dark:bg-gray-800 rounded-xl outline-none text-sm min-h-[80px]"
                    />
                </div>
            </div>
        </div>
    );
};

const VaccinationScreen: FC<{
    setScreen: (s: Screen) => void,
    events: LoggedEvent[],
    onToggleVaccine: (vaccine: VaccineInfo, existingEvent?: LoggedEvent) => void,
    onOpenDetails: (vaccine: VaccineInfo, existingEvent?: LoggedEvent) => void
}> = ({ setScreen, events, onToggleVaccine, onOpenDetails }) => {
    // ... same as provided ...
    const grouped = useMemo(() => {
        const groups: Record<number, VaccineInfo[]> = {};
        VACCINATION_SCHEDULE.forEach(v => {
            if (!groups[v.monthDue]) groups[v.monthDue] = [];
            groups[v.monthDue].push(v);
        });
        return groups;
    }, []);

    const monthLabels: Record<number, string> = {
        0: 'Ao Nascer', 2: '2 Meses', 3: '3 Meses', 4: '4 Meses', 5: '5 Meses', 6: '6 Meses',
        9: '9 Meses', 12: '12 Meses (1 ano)', 15: '15 Meses', 48: '4 Anos'
    };

    const timerRef = useRef<any>(null);

    const handleMouseDown = (vac: VaccineInfo, existingEvent?: LoggedEvent) => {
        timerRef.current = setTimeout(() => {
            onOpenDetails(vac, existingEvent);
            timerRef.current = null;
        }, 500); // 500ms long press
    };

    const handleMouseUp = (vac: VaccineInfo, existingEvent?: LoggedEvent) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
            // Shorter than 500ms -> toggle
            onToggleVaccine(vac, existingEvent);
        }
    };

    return (
        <div className="flex-grow flex flex-col transition-colors h-full">
            <Header title="Carteira de Vacinação" onBack={() => setScreen('add-event')} />
            <div className="p-4 space-y-6 pb-20 overflow-y-auto scrollbar-hide">
                {Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0])).map(([month, vaccines]) => (
                    <div key={month}>
                        <div className="flex items-center gap-2 mb-3 sticky top-0 bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur py-2 z-10 transition-colors">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <h3 className="font-bold text-gray-800 dark:text-white uppercase tracking-wide text-sm">{monthLabels[Number(month)]}</h3>
                        </div>
                        <div className="space-y-3 pl-2 border-l-2 border-gray-200 dark:border-gray-800 ml-1.5 transition-colors">
                            {vaccines.map(vac => {
                                const existingEvent = events.find(e => e.type === 'vaccine' && e.vaccineId === vac.id);
                                const isTaken = !!existingEvent;

                                return (
                                    <div
                                        key={vac.id}
                                        onMouseDown={() => handleMouseDown(vac, existingEvent)}
                                        onMouseUp={() => handleMouseUp(vac, existingEvent)}
                                        onTouchStart={() => handleMouseDown(vac, existingEvent)}
                                        onTouchEnd={() => handleMouseUp(vac, existingEvent)}
                                        className={`p-4 rounded-xl border transition-all ml-4 relative select-none cursor-pointer active:scale-[0.98] ${isTaken ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="pr-8">
                                                <h4 className={`font-bold text-sm ${isTaken ? 'text-green-700 dark:text-green-300' : 'text-gray-800 dark:text-white'}`}>{vac.name}</h4>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vac.description}</p>
                                                {isTaken && existingEvent.vaccineSite && (
                                                    <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-medium bg-green-100 dark:bg-green-900/40 inline-block px-1.5 py-0.5 rounded">
                                                        {existingEvent.vaccineSite === 'mouth' ? 'Oral' : existingEvent.vaccineSite.replace('_', ' ').replace('arm', 'Braço').replace('leg', 'Perna').replace('left', 'Esq').replace('right', 'Dir')}
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`absolute right-4 top-1/2 -translate-y-1/2`}>
                                                {isTaken ? (
                                                    <Icon name="check_circle" className="w-6 h-6 text-green-500" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const AgendaScreen: FC<{ setScreen: (s: Screen) => void, reminders: Reminder[], setReminders: (r: Reminder[]) => void }> = ({ setScreen, reminders, setReminders }) => {
    // ... same as provided ...
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');

    const addReminder = () => {
        if (!newTitle || !newDate || !newTime) return;
        setReminders([...reminders, {
            id: Date.now().toString(),
            title: newTitle,
            date: newDate,
            time: newTime,
            type: 'other'
        }]);
        setIsAdding(false);
        setNewTitle('');
        setNewDate('');
        setNewTime('');
    };

    const deleteReminder = (id: string) => {
        setReminders(reminders.filter(r => r.id !== id));
    };

    return (
        <div className="flex-grow flex flex-col transition-colors h-full">
            <Header title="Agenda & Consultas" onBack={() => setScreen('add-event')} rightAction={
                <button onClick={() => setIsAdding(true)} className="text-blue-500 font-bold text-sm">+ Novo</button>
            } />

            <div className="p-4 space-y-4 pb-20 overflow-y-auto">
                {isAdding && (
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 mb-4 animate-bounce-in">
                        <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3">Novo Lembrete</h4>
                        <input
                            placeholder="Título (ex: Pediatra)"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full p-3 mb-2 rounded-lg border-none outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                        <div className="flex gap-2 mb-3">
                            <input
                                type="date"
                                value={newDate}
                                onChange={e => setNewDate(e.target.value)}
                                className="flex-1 p-3 rounded-lg border-none outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                            />
                            <input
                                type="time"
                                value={newTime}
                                onChange={e => setNewTime(e.target.value)}
                                className="w-24 p-3 rounded-lg border-none outline-none text-sm bg-white dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsAdding(false)} className="flex-1 py-2 text-gray-500 text-sm font-bold">Cancelar</button>
                            <button onClick={addReminder} className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-bold shadow-md">Salvar</button>
                        </div>
                    </div>
                )}

                {reminders.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <Icon name="calendar" className="w-12 h-12 mb-2 opacity-50" />
                        <p>Nenhum lembrete futuro</p>
                    </div>
                )}

                {[...reminders].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(reminder => (
                    <div key={reminder.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg min-w-[50px]">
                                <span className="text-xs font-bold text-red-500 uppercase">{new Date(reminder.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                                <span className="text-xl font-bold text-gray-800 dark:text-white">{new Date(reminder.date).getDate()}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-white">{reminder.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    <Icon name="bell" className="w-3 h-3" />
                                    {reminder.time}
                                    {reminder.type === 'vaccine' && <span className="bg-green-100 text-green-600 px-1.5 rounded text-[10px] font-bold ml-1">Vacina</span>}
                                </div>
                            </div>
                        </div>
                        <button onClick={() => deleteReminder(reminder.id)} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Icon name="trash" className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

// -- MAIN APP COMPONENT -- //
export default function App() {
    const [screen, setScreen] = useState<Screen>('home');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Persistence Helpers
    const loadState = <T,>(key: string, fallback: T): T => {
        try {
            const saved = localStorage.getItem(key);
            return saved ? JSON.parse(saved) : fallback;
        } catch (e) {
            console.error(`Failed to load ${key}`, e);
            return fallback;
        }
    };

    // State Initialization
    const [profile, setProfile] = useState<BabyProfile>(() => loadState('baby_profile', initialProfile));
    const [events, setEvents] = useState<LoggedEvent[]>(() => loadState('baby_events', initialEvents));
    const [reminders, setReminders] = useState<Reminder[]>(() => loadState('baby_reminders', initialReminders));
    const [documents, setDocuments] = useState<BabyDocument[]>(() => loadState('baby_documents', initialDocuments || []));
    const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() => loadState('baby_dashboard_widgets', []));
    const [pinnedMilestones, setPinnedMilestones] = useState<string[]>(() => loadState('baby_pinned_milestones', ['smiled', 'sat_up', 'first_tooth']));

    const [showMilestoneConfig, setShowMilestoneConfig] = useState(false);

    // Persistence Effects
    useEffect(() => { localStorage.setItem('baby_profile', JSON.stringify(profile)); }, [profile]);
    useEffect(() => { localStorage.setItem('baby_events', JSON.stringify(events)); }, [events]);
    useEffect(() => { localStorage.setItem('baby_reminders', JSON.stringify(reminders)); }, [reminders]);
    useEffect(() => { localStorage.setItem('baby_documents', JSON.stringify(documents)); }, [documents]);
    useEffect(() => { localStorage.setItem('baby_dashboard_widgets', JSON.stringify(dashboardWidgets)); }, [dashboardWidgets]);
    useEffect(() => { localStorage.setItem('baby_pinned_milestones', JSON.stringify(pinnedMilestones)); }, [pinnedMilestones]);

    // Initialize from local storage or default to false
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        try {
            const saved = localStorage.getItem('appTheme');
            return saved === 'dark';
        } catch {
            return false;
        }
    });

    const [editingEvent, setEditingEvent] = useState<LoggedEvent | null>(null);
    const [showVaccineModal, setShowVaccineModal] = useState(false);
    const [selectedVaccine, setSelectedVaccine] = useState<VaccineInfo | null>(null);

    const handleToggleVaccine = (vaccine: VaccineInfo, existingEvent?: LoggedEvent) => {
        if (existingEvent) {
            deleteEvent(existingEvent.id);
        } else {
            const newEvent: LoggedEvent = {
                id: Date.now().toString(),
                type: 'vaccine',
                vaccineId: vaccine.id,
                timestamp: new Date().toISOString()
            };
            addEvent(newEvent);
        }
    };

    const handleOpenVaccineDetails = (vaccine: VaccineInfo, existingEvent?: LoggedEvent) => {
        setSelectedVaccine(vaccine);
        setEditingEvent(existingEvent || null);
        setShowVaccineModal(true);
    };

    // Specific Modals State
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [showBreastfeedingModal, setShowBreastfeedingModal] = useState(false);
    const [showBottleModal, setShowBottleModal] = useState(false);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showIllnessModal, setShowIllnessModal] = useState(false);
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [showMeasurementsModal, setShowMeasurementsModal] = useState(false);
    const [isGenericModalOpen, setIsGenericModalOpen] = useState(false);

    // Navigation Handling
    useEffect(() => {
        // Push state when screen changes to something other than home
        if (screen !== 'home') {
            window.history.pushState({ screen }, '', `?screen=${screen}`);
        }
    }, [screen]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // If we pop back, checking if we should go home or handle other history
            if (screen !== 'home') {
                setScreen('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [screen]);

    // Persist theme changes
    useEffect(() => {
        localStorage.setItem('appTheme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const addEvent = (event: LoggedEvent) => {
        setEvents(prev => [...prev, event]);
    }

    const addEvents = (newEvents: LoggedEvent[]) => {
        setEvents(prev => [...prev, ...newEvents]);
    }

    const updateEvent = (updatedEvent: LoggedEvent) => {
        setEvents(prev => {
            const exists = prev.find(e => e.id === updatedEvent.id);
            if (exists) {
                return prev.map(e => e.id === updatedEvent.id ? updatedEvent : e);
            }
            return [...prev, updatedEvent];
        });
    };

    const deleteEvent = (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
    }

    // Handle Save Logic for Modals (Check ID to decide Update vs Create)
    const handleSaveEvent = (e: LoggedEvent) => {
        if (events.find(ev => ev.id === e.id)) {
            updateEvent(e);
        } else {
            addEvent(e);
        }
        setScreen('home'); // Optional: return to home or stay? User usually expects feedback or close.
    };

    const handleOpenDetailedModal = (event: LoggedEvent) => {
        setEditingEvent(event);
        // Route to specific modal based on type
        switch (event.type) {
            case 'sleep':
                setShowSleepModal(true);
                break;
            case 'breastfeeding':
                setShowBreastfeedingModal(true);
                break;
            case 'bottle':
                setShowBottleModal(true);
                break;
            case 'baby_food':
                setShowFoodModal(true);
                break;
            case 'illness':
                setShowIllnessModal(true);
                break;
            case 'doctor':
                setShowDoctorModal(true);
                break;
            // Note: Measurements (weight/length) are tricky as they might come from a combined modal or single entry.
            // For simple editing, generic modal is often safer unless we split logic. 
            // Given the prompt request to match "Add" experience, we'd need a specific modal if it exists.
            // Since MeasurementsModal handles BOTH, opening it for ONE event is weird but let's default to generic for now unless type is 'measurements'.
            default:
                setIsGenericModalOpen(true);
                break;
        }
    };

    const renderScreen = () => {
        switch (screen) {
            case 'home': return <HomeScreen
                profile={profile}
                setScreen={setScreen}
                events={events}
                reminders={reminders}
                widgets={dashboardWidgets}
                setWidgets={setDashboardWidgets}
                openEventModal={handleOpenDetailedModal}
                pinnedMilestones={pinnedMilestones}
                onConfigMilestones={() => setShowMilestoneConfig(true)}
            />;
            case 'diary': return <DiaryScreen events={events} onEditEvent={handleOpenDetailedModal} />;
            case 'stats': return <StatsScreen events={events} isDarkMode={darkMode} setScreen={setScreen} profile={profile} />;
            case 'settings': return <SettingsScreen profile={profile} setProfile={setProfile} setScreen={setScreen} darkMode={darkMode} setDarkMode={setDarkMode} />;
            case 'add-event': return <AddEventScreen
                setScreen={setScreen}
                addEvent={addEvent}
                openModal={handleOpenDetailedModal}
                onSleepClick={() => { setEditingEvent(null); setShowSleepModal(true); }}
                onBreastfeedingClick={() => { setEditingEvent(null); setShowBreastfeedingModal(true); }}
                onBottleClick={() => { setEditingEvent(null); setShowBottleModal(true); }}
                onFoodClick={() => { setEditingEvent(null); setShowFoodModal(true); }}
                onIllnessClick={() => { setEditingEvent(null); setShowIllnessModal(true); }}
                onDoctorClick={() => { setEditingEvent(null); setShowDoctorModal(true); }}
                onMeasurementsClick={() => { setEditingEvent(null); setShowMeasurementsModal(true); }}
                pinnedMilestones={pinnedMilestones}
                setPinnedMilestones={setPinnedMilestones}
            />;
            case 'profile': return <ProfileScreen profile={profile} setProfile={setProfile} setScreen={setScreen} documents={documents} setDocuments={setDocuments} />;
            case 'vaccination': return <VaccinationScreen setScreen={setScreen} events={events} onToggleVaccine={handleToggleVaccine} onOpenDetails={handleOpenVaccineDetails} />;
            case 'agenda': return <AgendaScreen setScreen={setScreen} reminders={reminders} setReminders={setReminders} />;
            default: return <HomeScreen
                profile={profile}
                setScreen={setScreen}
                events={events}
                reminders={reminders}
                widgets={dashboardWidgets}
                setWidgets={setDashboardWidgets}
                openEventModal={handleOpenDetailedModal}
                pinnedMilestones={pinnedMilestones}
                onConfigMilestones={() => setShowMilestoneConfig(true)}
            />;
        }
    };

    const getBackgroundClass = () => {
        if (darkMode) return 'dark:bg-gray-950';
        // Use themeColor instead of gender
        switch (profile.themeColor) {
            case 'blue': return 'bg-pattern-blue';
            case 'pink': return 'bg-pattern-pink';
            case 'green': return 'bg-pattern-green';
            case 'purple': return 'bg-pattern-purple';
            default: return 'bg-pattern-neutral';
        }
    }

    if (!isAuthenticated) {
        return <AuthScreen onLogin={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className={`${darkMode ? 'dark' : ''}`}>
            <div className="bg-gray-100 dark:bg-gray-900 flex justify-center items-center min-h-screen font-sans antialiased text-gray-900 dark:text-white transition-colors">
                <div className="relative w-full max-w-md h-[844px] max-h-screen sm:rounded-[3rem] sm:border-[8px] sm:border-gray-900 dark:sm:border-gray-800 shadow-2xl overflow-hidden flex flex-col transition-colors">
                    {/* Status Bar Placeholder (Simulated) */}
                    <div className={`h-8 w-full flex justify-between items-center px-6 pt-2 z-30 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-white/80 backdrop-blur-md'}`}>
                        <span className="text-[10px] font-bold text-black dark:text-white">9:41</span>
                        <div className="flex space-x-1">
                            <div className="w-4 h-2.5 bg-black dark:bg-white rounded-sm"></div>
                            <div className="w-0.5 h-2.5 bg-black dark:bg-white rounded-sm"></div>
                        </div>
                    </div>

                    <div className={`flex-grow overflow-y-auto scrollbar-hide relative transition-all duration-300 ${getBackgroundClass()}`}>
                        {renderScreen()}
                    </div>

                    {!['add-event', 'profile', 'vaccination', 'agenda'].includes(screen) && (
                        <BottomNav active={screen} setActive={setScreen} profile={profile} />
                    )}

                    {/* Home Indicator (iPhone style) */}
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-300 dark:bg-gray-600 rounded-full z-50 pointer-events-none"></div>

                    {/* Global Smart Modal (Handles generic edits and simpler events) */}
                    <EventModal
                        isOpen={isGenericModalOpen}
                        initialEvent={editingEvent}
                        onClose={() => { setIsGenericModalOpen(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        profile={profile}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    {/* Specific Modals */}
                    <SleepModal
                        isOpen={showSleepModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowSleepModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <BreastfeedingModal
                        isOpen={showBreastfeedingModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowBreastfeedingModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <BottleModal
                        isOpen={showBottleModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowBottleModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <FoodModal
                        isOpen={showFoodModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowFoodModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <IllnessModal
                        isOpen={showIllnessModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowIllnessModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <DoctorModal
                        isOpen={showDoctorModal}
                        initialEvent={editingEvent}
                        onClose={() => { setShowDoctorModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        onDelete={deleteEvent}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    <MeasurementsModal
                        isOpen={showMeasurementsModal}
                        onClose={() => setShowMeasurementsModal(false)}
                        onSave={(newEvents) => { addEvents(newEvents); setScreen('home'); }}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                        widgets={dashboardWidgets}
                        setWidgets={setDashboardWidgets}
                    />

                    {/* Milestone Configuration Modal */}
                    <MilestoneConfigModal
                        isOpen={showMilestoneConfig}
                        onClose={() => setShowMilestoneConfig(false)}
                        pinnedMilestones={pinnedMilestones}
                        setPinnedMilestones={setPinnedMilestones}
                    />

                    <VaccineModal
                        isOpen={showVaccineModal}
                        onClose={() => { setShowVaccineModal(false); setEditingEvent(null); }}
                        onSave={handleSaveEvent}
                        vaccine={selectedVaccine}
                        initialEvent={editingEvent}
                    />
                </div>
            </div>
        </div>
    );
}
