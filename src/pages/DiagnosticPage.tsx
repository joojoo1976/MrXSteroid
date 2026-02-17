import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, Cpu, Globe, Terminal, Copy, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { useDiagnostics } from '../features/diagnostics/hooks/useDiagnostics';

const DiagnosticPage: React.FC = () => {
    const { status, logs, runTests, copyLogs } = useDiagnostics();

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-gold-500/20 rounded-2xl border border-gold-500/30">
                        <Activity className="w-8 h-8 text-gold-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">System Diagnostic</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Auth & Database Connectivity Audit</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Environment Stats */}
                    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                                <Cpu className="w-4 h-4" /> Environment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs font-bold text-zinc-500">Supabase URL</span>
                                <span className={`text-xs font-mono ${status.url === 'MISSING' ? 'text-red-500' : 'text-zinc-300'}`}>
                                    {status.url !== 'MISSING' ? 'Configured' : 'Missing'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs font-bold text-zinc-500">Anon Key Presence</span>
                                {status.keyExists ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs font-bold text-zinc-500">Key Format (JWT)</span>
                                {status.keyFormat ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                            </div>
                            <div className="flex justify-between items-center p-3 bg-black/40 rounded-xl border border-zinc-800">
                                <span className="text-xs font-bold text-zinc-500">SpaceRemit Key</span>
                                {status.diagnosticDetails?.spaceremit_sdk?.status === 'ok' ? <ShieldCheck className="w-4 h-4 text-green-500" /> : <ShieldAlert className="w-4 h-4 text-red-500" />}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connection Status */}
                    <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-xl relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-full h-1 ${status.connection === 'testing' ? 'bg-gold-500 animate-pulse' :
                            status.connection === 'success' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400">
                                <Globe className="w-4 h-4" /> Connectivity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            {status.connection === 'testing' && (
                                <Activity className="w-12 h-12 text-gold-500 animate-spin mb-4" />
                            )}
                            {status.connection === 'success' && (
                                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4 shadow-[0_0_20px_rgba(34,197,94,0.3)]" />
                            )}
                            {status.connection === 'failed' && (
                                <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
                            )}
                            <h3 className="text-xl font-black uppercase">{status.connection}</h3>
                            {status.error && (
                                <p className="text-red-400 text-[10px] font-bold mt-2 text-center uppercase tracking-tighter">
                                    {status.error}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Logs Terminal */}
                <Card className="bg-black border-zinc-800 border-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-gold-500">
                            <Terminal className="w-4 h-4" /> System Logs
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={runTests} className="bg-zinc-900 border-zinc-800 text-xs font-bold">
                                Re-run
                            </Button>
                            <Button size="sm" onClick={copyLogs} className="bg-gold-500 text-black hover:bg-gold-400 text-xs font-black">
                                <Copy className="w-3 h-3 mr-1" /> Copy Report
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-zinc-950 p-6 rounded-xl font-mono text-xs text-green-500 h-64 overflow-y-auto space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="flex gap-2">
                                    <span className="text-zinc-700 select-none">[{i + 1}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <span className="text-zinc-800">No logs generated.</span>}
                        </div>
                    </CardContent>
                </Card>

                <div className="bg-zinc-900/30 p-4 border border-zinc-800 rounded-xl">
                    <p className="text-[10px] text-zinc-500 font-bold uppercase text-center leading-relaxed">
                        This diagnostic tool performs a direct client-side request to Supabase. <br />
                        If connectivity fails here, check Vercel environment variables or Supabase CORS settings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticPage;
