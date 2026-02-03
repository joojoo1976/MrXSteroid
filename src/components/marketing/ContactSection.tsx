import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Mail,
    Send,
    Zap,
    ShieldCheck,
    Instagram,
    Twitter,
    Youtube,
    Copy,
    CheckCircle2,
    Clock,
    Globe,
    MessageSquare,
    Package,
    Wrench,
    Building2,
    Stethoscope,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { errorHandler } from '../../lib/error-handler';
import { usePreferences } from '../../context/PreferencesContext';
import { StyledBrandName } from '../shared/StyledBrandName';
import DynamicBrandLogo from '../layout/DynamicBrandLogo';
import { ContentStrings } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../ui/select';

// --- Zod Schema ---
const contactSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    topic: z.enum(['general', 'order', 'technical', 'wholesale', 'consultation']),
    subject: z.string().min(5, { message: "Subject must be at least 5 characters" }),
    message: z.string().min(10, { message: "Message must be at least 10 characters" }),
    orderId: z.string().optional(),
    honeypot: z.string().optional(), // Bot protection
    disclaimerAccepted: z.boolean().optional(),
}).refine((data) => {
    if (data.topic === 'order' && !data.orderId) {
        return false;
    }
    return true;
}, {
    message: "Order ID is required for order inquiries",
    path: ["orderId"],
}).refine((data) => {
    if (data.topic === 'consultation' && !data.disclaimerAccepted) {
        return false;
    }
    return true;
}, {
    message: "You must accept the medical disclaimer for consultations",
    path: ["disclaimerAccepted"],
});

type ContactFormData = z.infer<typeof contactSchema>;

interface ContactSectionProps {
    content: ContentStrings;
}

const ContactSection: React.FC<ContactSectionProps> = ({ content }) => {
    const { isRTL } = usePreferences();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [copiedEmail, setCopiedEmail] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            topic: 'general',
            disclaimerAccepted: false,
        }
    });

    const selectedTopic = watch('topic');

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedEmail(true);
        toast.success("Email copied to clipboard");
        setTimeout(() => setCopiedEmail(false), 2000);
    };

    const onSubmit = async (data: ContactFormData) => {
        if (data.honeypot) return; // Silent discard for bots

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([{
                    name: data.name,
                    email: data.email,
                    subject: data.subject,
                    topic: data.topic,
                    message: data.message,
                    order_id: data.orderId || null,
                    user_agent: window.navigator.userAgent,
                }]);

            if (error) throw error;

            setIsSubmitted(true);
            toast.success(content.contactTransmissionReceivedTitle || "Transmission Securely Received");
            reset();

            // Reset success state after few seconds
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (error) {
            errorHandler.handle(error, 'ContactForm');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className={`py-20 bg-[#050505] relative overflow-hidden ${isRTL ? 'font-cairo' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-gold-500/20 blur-[120px] rounded-full animate-float-slow"></div>
                <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-gold-600/10 blur-[120px] rounded-full animate-float-slow [animation-delay:-5s]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">

                    {/* Left Side: Intel & Direct Channels */}
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1 space-y-12"
                    >
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-gold-500/10 text-gold-500 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-6 border border-gold-500/20"
                            >
                                <Zap className="w-3 h-3 animate-pulse" /> {content.contactSupportCommandCenter || "Support Command Center"}
                            </motion.div>
                            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter leading-none">
                                {isRTL ? <StyledBrandName text={"اتصالات الـ " + "Mr. X"} /> : <span className="flex items-center gap-3">Contact the <DynamicBrandLogo inline variant="short" /> Source</span>}
                            </h2>
                            <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
                                {content.contactPageSubtitle || "Direct relay for cycle optimization, technical support, and protocol verification. Secure, encrypted, and authoritative."}
                            </p>
                        </div>

                        <div className="space-y-6">
                            {/* Direct Email Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur-xl relative overflow-hidden group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gold-500/10 rounded-lg flex items-center justify-center text-gold-500 border border-gold-500/20">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-1">{content.contactDirectSecureLine || "Direct Secure Line"}</p>
                                            <p className="text-lg font-bold text-white tracking-tight">{content.contactInfoEmail || 'support@mrxsteroid.com'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(content.contactInfoEmail || 'support@mrxsteroid.com')}
                                        className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {copiedEmail ? <CheckCircle2 className="w-4 h-4 text-gold-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </motion.div>

                            {/* Author Info */}
                            <div className="flex items-center gap-6 p-6 border-s-4 border-gold-500 bg-zinc-900/30 rounded-e-3xl">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gold-500/30">
                                    <img src="/author-small.jpg" alt="George Mourice" className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <p className="text-white font-black text-lg">{content.authorName || 'George Mourice'}</p>
                                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{isRTL ? 'معماري البروتوكول الرئيسي' : 'Lead Protocol Architect'}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">In Command / 24h Relay</span>
                                    </div>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
                                    { icon: Twitter, label: 'X (Twitter)', color: 'hover:text-blue-400' },
                                    { icon: Youtube, label: 'YouTube', color: 'hover:text-red-500' }
                                ].map((social, i) => (
                                    <motion.a
                                        key={i}
                                        href="#"
                                        whileHover={{ y: -5, backgroundColor: 'rgba(212, 175, 55, 0.1)' }}
                                        className="flex flex-row items-center justify-center gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl transition-all"
                                    >
                                        <social.icon className={`w-4 h-4 text-zinc-400 ${social.color} transition-colors`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{social.label}</span>
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Transmission Form */}
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex-1"
                    >
                        <div className="bg-zinc-900/50 border-2 border-zinc-800 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            {/* Form Status Header */}
                            <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.5)]"></div>
                                    <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm">Transmission Protocol</h3>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-gold-500/50" />
                                    E2E Encrypted
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isSubmitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="py-12 flex flex-col items-center text-center space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center border-4 border-gold-500/20">
                                            <CheckCircle2 className="w-12 h-12 text-gold-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black text-white mb-2">{content.contactTransmissionReceivedTitle || "Message Securely Received"}</h4>
                                            <p className="text-zinc-400 font-medium">{content.contactTransmissionReceivedDesc || "The Command Center will process your transmission and respond within the next 24-hour cycle."}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="border-zinc-800 text-zinc-400 hover:text-white"
                                            onClick={() => setIsSubmitted(false)}
                                        >
                                            {content.contactExecuteTransmissionBtn || "New Transmission"}
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        {/* Honey Pot (Invisible) */}
                                        <input type="text" {...register('honeypot')} className="hidden" />

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactOperatorIdentityLabel}</label>
                                                <Input
                                                    placeholder={content.contactFormNamePlaceholder || "Your Name"}
                                                    className={`bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-600 focus:border-gold-500 transition-all rounded-2xl h-14 ${errors.name ? 'border-red-500/50' : ''}`}
                                                    {...register('name')}
                                                />
                                                {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 px-1">{errors.name.message}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactSignalHashLabel}</label>
                                                <Input
                                                    placeholder="example@secure.com"
                                                    className={`bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-600 focus:border-gold-500 transition-all rounded-2xl h-14 ${errors.email ? 'border-red-500/50' : ''}`}
                                                    {...register('email')}
                                                />
                                                {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 px-1">{errors.email.message}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactMissionTypeLabel}</label>
                                            <Select
                                                onValueChange={(value) => setValue('topic', value as ContactFormData['topic'])}
                                                defaultValue="general"
                                            >
                                                <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-gold-500 transition-all rounded-2xl h-14 px-4">
                                                    <SelectValue placeholder="Select Topic" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-zinc-900 border-zinc-800 text-white rounded-2xl">
                                                    <SelectItem value="general" className="rounded-xl flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4 inline me-2" /> General Inquiry
                                                    </SelectItem>
                                                    <SelectItem value="order" className="rounded-xl flex items-center gap-2">
                                                        <Package className="w-4 h-4 inline me-2" /> Order Issue/Status
                                                    </SelectItem>
                                                    <SelectItem value="technical" className="rounded-xl flex items-center gap-2">
                                                        <Wrench className="w-4 h-4 inline me-2" /> Technical Assistance
                                                    </SelectItem>
                                                    <SelectItem value="wholesale" className="rounded-xl flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 inline me-2" /> Business/Partnership
                                                    </SelectItem>
                                                    <SelectItem value="consultation" className="rounded-xl flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4 inline me-2" /> Cycle Consultation
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Conditional Field: Order ID */}
                                        <AnimatePresence>
                                            {selectedTopic === 'order' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-2"
                                                >
                                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactTransmissionReferenceLabel}</label>
                                                    <Input
                                                        placeholder="#MRX-XXXXXX"
                                                        className={`bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-600 focus:border-gold-500 transition-all rounded-2xl h-14 ${errors.orderId ? 'border-red-500/50' : ''}`}
                                                        {...register('orderId')}
                                                    />
                                                    {errors.orderId && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 px-1">{errors.orderId.message}</p>}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactTransmissionHeaderLabel}</label>
                                            <Input
                                                placeholder="Purpose of signal..."
                                                className={`bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-600 focus:border-gold-500 transition-all rounded-2xl h-14 ${errors.subject ? 'border-red-500/50' : ''}`}
                                                {...register('subject')}
                                            />
                                            {errors.subject && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 px-1">{errors.subject.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-1">{content.contactMissionPayloadLabel}</label>
                                            <Textarea
                                                placeholder="Detailed transmission data..."
                                                rows={5}
                                                className={`bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-600 focus:border-gold-500 transition-all rounded-2xl p-4 resize-none ${errors.message ? 'border-red-500/50' : ''}`}
                                                {...register('message')}
                                            />
                                            {errors.message && <p className="text-[10px] text-red-500 font-bold uppercase mt-1 px-1">{errors.message.message}</p>}
                                        </div>

                                        {/* Conditional Field: Medical Disclaimer */}
                                        <AnimatePresence>
                                            {selectedTopic === 'consultation' && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Info className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                                        <div className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                                                            Consultations are for informational purposes only. I am not a medical professional. By proceeding, you acknowledge that you are responsible for your own health decisions and have read the <span className="text-orange-500 font-bold underline cursor-pointer">Medical Disclaimer</span>.
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-1">
                                                        <input
                                                            type="checkbox"
                                                            id="disclaimer"
                                                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-gold-500 focus:ring-gold-500"
                                                            onChange={(e) => setValue('disclaimerAccepted', e.target.checked)}
                                                        />
                                                        <label htmlFor="disclaimer" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 cursor-pointer">
                                                            I accept the protocol risks & terms
                                                        </label>
                                                    </div>
                                                    {errors.disclaimerAccepted && <p className="text-[10px] text-red-500 font-bold uppercase px-1">{errors.disclaimerAccepted.message}</p>}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <motion.button
                                            type="submit"
                                            disabled={isSubmitting}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full h-16 bg-gold-500 text-black font-black text-lg rounded-2xl shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <Zap className="w-5 h-5 animate-spin" />
                                                    {content.contactSynchronizingBtn}
                                                </span>
                                            ) : (
                                                <>
                                                    <Send className={`w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                                                    {content.contactExecuteTransmissionBtn}
                                                </>
                                            )}

                                            {/* Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                                        </motion.button>
                                    </form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>

                {/* Technical Footer */}
                <div className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 border-t border-zinc-800 pt-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Response: ~24hrs</span>
                        </div>
                        <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Relay Active</span>
                        </div>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                        System Status: 100% Operational // Encryption: AES-256
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
