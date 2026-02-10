import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { RealtimeSyncService } from '../services/RealtimeSyncService';
import { Database } from '../types/db_types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { MapPin, Package, CheckCircle, Clock, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type Assignment = Database['public']['Tables']['delivery_assignments']['Row'];

const RepresentativePage: React.FC = () => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'active' | 'inactive' | 'busy'>('inactive');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // 1. Initial Load: Get status and assignments
        const loadInitData = async () => {
            const { data: delegate } = await supabase
                .from('delegates')
                .select('*')
                .eq('id', user.id)
                .single();

            if (delegate) setStatus(delegate.status);

            const { data: activeAssignments } = await supabase
                .from('delivery_assignments')
                .select('*')
                .eq('delegate_id', user.id)
                .neq('status', 'delivered')
                .neq('status', 'failed');

            if (activeAssignments) setAssignments(activeAssignments);
            setLoading(false);
        };

        loadInitData();

        // 2. Subscribe to assignment changes
        const subscription = RealtimeSyncService.subscribeToAssignments(user.id, (payload) => {
            if (payload.eventType === 'INSERT') {
                setAssignments(prev => [...prev, payload.new]);
                toast.success('New assignment received!');
            } else if (payload.eventType === 'UPDATE') {
                setAssignments(prev => prev.map(a => a.id === payload.new.id ? payload.new : a).filter(a => a.status !== 'delivered' && a.status !== 'failed'));
            }
        });

        // 3. Location Tracking (Using watchPosition for real-time efficiency)
        let watchId: number | null = null;
        if (status === 'active' || status === 'busy') {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    RealtimeSyncService.updateLocation(user.id, pos.coords.latitude, pos.coords.longitude, {
                        speed: pos.coords.speed || undefined,
                        heading: pos.coords.heading || undefined
                    });
                },
                (err) => console.error('Geolocation error:', err),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        }

        return () => {
            subscription.unsubscribe();
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [user, status]);

    const toggleStatus = async () => {
        const newStatus = status === 'inactive' ? 'active' : 'inactive';
        const success = await RealtimeSyncService.updateStatus(user!.id, newStatus);
        if (success) {
            setStatus(newStatus);
            toast.info(`Status updated to ${newStatus}`);
        }
    };

    const updateAssignment = async (id: string, newStatus: Assignment['status']) => {
        const success = await RealtimeSyncService.updateAssignmentStatus(id, newStatus);
        if (success) {
            toast.success(`Order status: ${newStatus}`);
        }
    };

    if (loading) return <div className="p-8 text-center text-gold-500 animate-pulse">Initializing Terminal...</div>;

    return (
        <div className="max-w-md mx-auto p-4 space-y-6 pb-24">
            {/* Status Card */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl text-white">Representative Mode</CardTitle>
                        <CardDescription>Real-time sync active</CardDescription>
                    </div>
                    <Button
                        variant={status === 'active' ? 'default' : 'outline'}
                        onClick={toggleStatus}
                        className={status === 'active' ? "bg-green-600 hover:bg-green-700" : "border-zinc-700 text-zinc-400"}
                    >
                        {status === 'active' ? <ToggleRight className="mr-2" /> : <ToggleLeft className="mr-2" />}
                        {status.toUpperCase()}
                    </Button>
                </CardHeader>
                {status === 'active' && (
                    <div className="px-6 pb-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Sync Active</span>
                    </div>
                )}
            </Card>

            {/* Assignments List */}
            <div className="space-y-4">
                <h3 className="text-zinc-500 uppercase text-xs font-black tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Active Tasks ({assignments.length})
                </h3>

                {assignments.length === 0 ? (
                    <div className="text-center p-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl">
                        <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500 font-bold">Waiting for assignments...</p>
                    </div>
                ) : (
                    assignments.map(assignment => (
                        <Card key={assignment.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                            <CardHeader className="bg-white/5 pb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-sm text-gold-500 font-mono">ORDER #{assignment.order_id.slice(0, 8)}</CardTitle>
                                        <CardDescription className="text-xs uppercase tracking-tighter">Status: {assignment.status}</CardDescription>
                                    </div>
                                    <div className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-black">
                                        PRIORITY
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="flex items-center gap-3 text-sm">
                                    <MapPin className="w-4 h-4 text-zinc-500" />
                                    <span className="text-zinc-300">Location tracking enabled</span>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {assignment.status === 'assigned' && (
                                        <Button onClick={() => updateAssignment(assignment.id, 'picked_up')} className="bg-zinc-800 hover:bg-zinc-700 text-xs">
                                            Mark Picked Up
                                        </Button>
                                    )}
                                    {assignment.status === 'picked_up' && (
                                        <Button onClick={() => updateAssignment(assignment.id, 'on_the_way')} className="bg-blue-600 hover:bg-blue-700 text-xs">
                                            On The Way
                                        </Button>
                                    )}
                                    {(assignment.status === 'on_the_way' || assignment.status === 'picked_up') && (
                                        <Button onClick={() => updateAssignment(assignment.id, 'delivered')} className="bg-green-600 hover:bg-green-700 text-xs">
                                            <CheckCircle className="w-4 h-4 mr-2" /> Complete
                                        </Button>
                                    )}
                                    <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 text-xs col-span-2 mt-2">
                                        <AlertTriangle className="w-4 h-4 mr-2" /> Report Issue
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default RepresentativePage;
