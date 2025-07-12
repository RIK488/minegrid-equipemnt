import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import supabase from '../utils/supabaseClient';
import MachineCard from '../components/MachineCard';
export default function SectorMachines() {
    const [machines, setMachines] = useState([]);
    const [secteur, setSecteur] = useState('');
    useEffect(() => {
        const params = new URLSearchParams(window.location.hash.split('?')[1]);
        const secteurParam = params.get('secteur');
        setSecteur(secteurParam || '');
        const fetchData = async () => {
            const { data } = await supabase.from('machines').select('*');
            setMachines(data || []);
        };
        fetchData();
    }, []);
    const filtered = machines.filter((m) => m.category?.toLowerCase() === secteur.toLowerCase());
    // logs déplacés ici
    console.log('Secteur dans URL :', secteur);
    console.log('Catégories des machines :', machines.map(m => m.category));
    return (_jsxs("div", { className: "max-w-7xl mx-auto p-4", children: [_jsxs("h1", { className: "text-2xl font-bold mb-4", children: ["Machines - ", secteur] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: filtered.map((machine) => (_jsx(MachineCard, { machine: machine }, machine.id))) })] }));
}
