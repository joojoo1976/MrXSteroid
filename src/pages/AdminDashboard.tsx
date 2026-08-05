import React, { useState, useEffect } from 'react';
import { RealtimeSyncService, type SupabaseRealtimePayload } from '../shared/lib/RealtimeSyncService';
import { supabase } from '../shared/lib/supabase';
import { Database } from '@/shared/types/db_types';
import { Card, CardContent } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Users, Package, Map, Bell, Search, Filter, PlayCircle } from 'lucide-react';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Delegate = Database['public']['Tables']['delegates']['Row'];
type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

interface LocationPayloadNew {
    delegate_id: string;
    latitude: number;
    longitude: number;
    timestamp: string;
}

interface ExtendedDelegate extends Delegate {
    profile: Profile;
    latest_location?: {
        latitude: number;
        longitude: number;
        timestamp: string;
    };
}

const AdminDashboard: React.FC = () => {
    const [delegates, setDelegates] = useState<ExtendedDelegate[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            // 1. Load active delegates with roles
            const { data: delegatesData } = await supabase
                .from('delegates')
                .select('*, profile:profiles(*)');

            // 2. Load latest locations for each delegate
            const { data: locations } = await supabase
                .from('realtime_locations')
                .select('*')
                .order('timestamp', { ascending: false });

            // Map locations to delegates (using the latest location for each)
            const delegatesWithLoc = (delegatesData || []).map(d => {
                const latestLoc = locations?.find(l => l.delegate_id === d.id);
                return {
                    ...d,
                    latest_location: latestLoc ? {
                        latitude: latestLoc.latitude,
                        longitude: latestLoc.longitude,
                        timestamp: latestLoc.timestamp
                    } : undefined
                };
            }) as ExtendedDelegate[];

            setDelegates(delegatesWithLoc);

            // 3. Load pending orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            setOrders(ordersData || []);

            // 4. Load current assignments
            const { data: assignmentsData } = await supabase
                .from('delivery_assignments')
                .select('*');

            setAssignments(assignmentsData || []);
            setLoading(false);
        };

        loadInitialData();

        // Real-time Subscriptions
        const locSub = RealtimeSyncService.subscribeToAllLocations((payload: SupabaseRealtimePayload<LocationPayloadNew>) => {
            setDelegates(prev => prev.map(d => d.id === payload.new.delegate_id ? {
                ...d,
                latest_location: {
                    latitude: payload.new.latitude,
                    longitude: payload.new.longitude,
                    timestamp: payload.new.timestamp
                }
            } : d));
        });

        const assignSub = RealtimeSyncService.subscribeToAllAssignments((payload) => {
            if (payload.eventType === 'INSERT') {
                setAssignments(prev => [...prev, payload.new]);
                toast.info('New assignment created');
            } else if (payload.eventType === 'UPDATE') {
                setAssignments(prev => prev.map(a => a.id === payload.new.id ? payload.new : a));
            }
        });

        return () => {
            locSub.unsubscribe();
            assignSub.unsubscribe();
        };
    }, []);

    const assignOrder = async (orderId: string, delegateId: string) => {
        const { data, error } = await supabase
            .from('delivery_assignments')
            .insert({
                order_id: orderId,
                delegate_id: delegateId,
                status: 'assigned'
            })
            .select()
            .single();

        if (error) {
            toast.error('Assignment failed: ' + error.message);
        } else {
            setAssignments(prev => [...prev, data]);
            toast.success('Order assigned successfully');
        }
    };

    if (loading) return <div className="p-20 text-center font-black text-gold-500 animate-pulse">SYNCING GLOBAL ASSETS...</div>;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex justify-between items-end border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase flex items-center gap-3">
                        <Map className="w-10 h-10 text-gold-500" /> Command Center
                    </h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mt-2">Real-time Logistics Overview</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-zinc-800 text-zinc-400">
                        <Bell className="w-4 h-4 mr-2" /> 2 Alerts
                    </Button>
                    <Button className="bg-gold-500 text-black font-black">
                        <PlayCircle className="w-4 h-4 mr-2" /> Live Mode
                    </Button>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Delegate Monitor */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                            <Users className="w-6 h-6 text-gold-500" /> Active Units ({delegates.filter(d => d.status !== 'inactive').length})
                        </h2>
                        <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="text-zinc-500"><Search className="w-4 h-4" /></Button>
                            <Button size="icon" variant="ghost" className="text-zinc-500"><Filter className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {delegates.map(delegate => (
                            <Card key={delegate.id} className={`bg-zinc-900 border-zinc-800 transition-all ${delegate.status === 'active' ? 'border-l-4 border-l-green-500' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{delegate.vehicle_type || 'UNIT'}</p>
                                            <p className="text-lg font-black text-white">{delegate.profile?.full_name || 'Agent X'}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${delegate.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                            delegate.status === 'busy' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-zinc-800 text-zinc-500'
                                            }`}>
                                            {delegate.status}
                                        </div>
                                    </div>

                                    {delegate.latest_location ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase">Last Seen</p>
                                                <p className="text-[10px] text-zinc-600 font-mono">
                                                    {new Date(delegate.latest_location.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <p className="text-xs text-zinc-400 font-mono">LAT: {delegate.latest_location.latitude.toFixed(4)} LNG: {delegate.latest_location.longitude.toFixed(4)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-zinc-600 italic">No signal GPS</p>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {assignments.filter(a => a.delegate_id === delegate.id && a.status !== 'delivered').map((_, i) => (
                                                <div key={i} className="w-6 h-6 rounded-full bg-gold-500 border-2 border-zinc-900 flex items-center justify-center text-[8px] font-black text-black">
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-xs text-zinc-400">View Logs</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Orders & Assignment */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-white uppercase flex items-center gap-2">
                        <Package className="w-6 h-6 text-gold-500" /> Pending Orders
                    </h2>

                    <div className="space-y-3">
                        {orders.filter(o => !assignments.some(a => a.order_id === o.id)).map(order => (
                            <Card key={order.id} className="bg-zinc-900 border-zinc-800">
                                <CardContent className="p-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-sm font-black text-white">#{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gold-500 font-bold">${order.amount}</p>
                                    </div>
                                    <p className="text-xs text-zinc-500 mb-4">{order.fullname || order.email || '—'} - {order.city}, {order.country}</p>

                                    <div className="space-y-2">
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase">Assign to Delegate</p>
                                        <div className="flex gap-2">
                                            <select
                                                id={`assign-${order.id}`}
                                                title="Assign to Delegate"
                                                className="bg-black border border-zinc-800 rounded text-xs text-white p-1 flex-1"
                                            >
                                                <option value="">Select Agent...</option>
                                                {delegates.filter(d => d.status === 'active').map(d => (
                                                    <option key={d.id} value={d.id}>{d.profile?.full_name}</option>
                                                ))}
                                            </select>
                                            <Button
                                                size="sm"
                                                className="bg-zinc-100 text-black font-black text-[10px] h-7 px-3"
                                                onClick={() => {
                                                    const select = document.getElementById(`assign-${order.id}`) as HTMLSelectElement;
                                                    if (select.value) assignOrder(order.id, select.value);
                                                }}
                                            >
                                                GO
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
