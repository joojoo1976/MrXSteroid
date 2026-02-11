/**
 * User Experience Enhancement Module for Mr. X Steroid Application
 * Implements various UX improvements and features
 */

import { perfMonitor } from '../utils/performance-optimization';

// Notification system interface
export interface NotificationOptions {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    dismissible?: boolean;
}

// Progress tracking interface
export interface ProgressData {
    userId: string;
    metric: string;
    value: number;
    target?: number;
    date: Date;
    notes?: string;
}

// Personalization settings interface
export interface PersonalizationSettings {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    units: 'metric' | 'imperial';
    notificationsEnabled: boolean;
    reminderTime?: string;
    dashboardLayout: string;
}

// Achievement system interface
export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    points: number;
    unlocked: boolean;
    unlockDate?: Date;
    category: 'fitness' | 'consistency' | 'milestone' | 'social';
}

// User experience enhancement class
export class UserExperienceManager {
    private static instance: UserExperienceManager;
    private notifications: Map<string, NotificationOptions> = new Map();
    private achievements: Achievement[] = [];
    private personalizationSettings: PersonalizationSettings;
    private progressHistory: ProgressData[] = [];
    private activeReminders: Map<string, NodeJS.Timeout> = new Map();

    private constructor() {
        // Initialize with default settings
        this.personalizationSettings = {
            theme: 'dark',
            language: 'en',
            units: 'metric',
            notificationsEnabled: true,
            dashboardLayout: 'default'
        };
        
        // Load saved settings if available
        this.loadPersonalizationSettings();
        this.loadAchievements();
    }

    public static getInstance(): UserExperienceManager {
        if (!UserExperienceManager.instance) {
            UserExperienceManager.instance = new UserExperienceManager();
        }
        return UserExperienceManager.instance;
    }

    /**
     * Show notification to user
     */
    showNotification(options: NotificationOptions): string {
        const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Set default values
        const notification = {
            ...options,
            type: options.type || 'info',
            duration: options.duration || 5000,
            position: options.position || 'top-right',
            dismissible: options.dismissible !== undefined ? options.dismissible : true
        };

        this.notifications.set(id, notification);

        // Create notification element
        this.createNotificationElement(id, notification);

        // Auto-dismiss after duration
        if (notification.duration > 0) {
            setTimeout(() => {
                this.dismissNotification(id);
            }, notification.duration);
        }

        return id;
    }

    /**
     * Dismiss a notification
     */
    dismissNotification(id: string) {
        const element = document.getElementById(`notification-${id}`);
        if (element) {
            element.style.opacity = '0';
            setTimeout(() => {
                element.remove();
                this.notifications.delete(id);
            }, 300);
        }
    }

    /**
     * Create notification element in DOM
     */
    private createNotificationElement(id: string, options: NotificationOptions) {
        const containerId = `notifications-${options.position}`;
        let container = document.getElementById(containerId);

        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = `notifications-container ${options.position}`;
            
            // Add basic styles
            const style = document.createElement('style');
            style.textContent = `
                .notifications-container {
                    position: fixed;
                    z-index: 10000;
                    padding: 10px;
                    max-width: 350px;
                }
                .notifications-container.top-right {
                    top: 20px;
                    right: 20px;
                }
                .notifications-container.top-left {
                    top: 20px;
                    left: 20px;
                }
                .notifications-container.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }
                .notifications-container.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }
                .notification {
                    margin-bottom: 10px;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: slideIn 0.3s ease-out;
                    transition: opacity 0.3s ease;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification.info { background-color: #3b82f6; color: white; }
                .notification.success { background-color: #10b981; color: white; }
                .notification.warning { background-color: #f59e0b; color: white; }
                .notification.error { background-color: #ef4444; color: white; }
                .notification-dismiss {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2em;
                    cursor: pointer;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(container);
        }

        const notificationEl = document.createElement('div');
        notificationEl.id = `notification-${id}`;
        notificationEl.className = `notification ${options.type}`;
        notificationEl.innerHTML = `
            <div>
                <strong>${options.title}</strong>
                <p style="margin: 5px 0 0 0;">${options.message}</p>
            </div>
            ${options.dismissible ? '<button class="notification-dismiss" onclick="dismissNotification(\'' + id + '\')">✕</button>' : ''}
        `;

        container.prepend(notificationEl);

        // Add dismiss function to global scope
        (window as any).dismissNotification = (notificationId: string) => {
            this.dismissNotification(notificationId);
        };
    }

    /**
     * Track user progress
     */
    async trackProgress(data: ProgressData): Promise<boolean> {
        perfMonitor.mark(`track-progress-${data.metric}`);
        
        try {
            // Add to local history
            this.progressHistory.push(data);
            
            // Check for achievements
            await this.checkForAchievements(data);
            
            // Store in persistent storage
            this.saveProgressData();
            
            perfMonitor.mark(`track-progress-${data.metric}-end`);
            perfMonitor.measure(
                `track-progress-${data.metric}`,
                `track-progress-${data.metric}`,
                `track-progress-${data.metric}-end`
            );
            
            return true;
        } catch (error) {
            console.error('Error tracking progress:', error);
            return false;
        }
    }

    /**
     * Get user progress history
     */
    getProgressHistory(metric?: string): ProgressData[] {
        if (metric) {
            return this.progressHistory.filter(item => item.metric === metric);
        }
        return [...this.progressHistory];
    }

    /**
     * Set personalization settings
     */
    setPersonalizationSettings(settings: Partial<PersonalizationSettings>) {
        this.personalizationSettings = {
            ...this.personalizationSettings,
            ...settings
        };
        
        // Apply theme immediately
        if (settings.theme) {
            this.applyTheme(settings.theme);
        }
        
        // Save to storage
        this.savePersonalizationSettings();
        
        // Show confirmation notification
        this.showNotification({
            title: 'Settings Updated',
            message: 'Your preferences have been saved successfully.',
            type: 'success',
            duration: 3000
        });
    }

    /**
     * Get personalization settings
     */
    getPersonalizationSettings(): PersonalizationSettings {
        return { ...this.personalizationSettings };
    }

    /**
     * Apply theme to the application
     */
    private applyTheme(theme: 'light' | 'dark' | 'auto') {
        const html = document.documentElement;
        
        switch (theme) {
            case 'light':
                html.classList.remove('dark');
                html.classList.add('light');
                break;
            case 'dark':
                html.classList.remove('light');
                html.classList.add('dark');
                break;
            case 'auto':
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (prefersDark) {
                    html.classList.remove('light');
                    html.classList.add('dark');
                } else {
                    html.classList.remove('dark');
                    html.classList.add('light');
                }
                break;
        }
    }

    /**
     * Schedule a reminder
     */
    scheduleReminder(message: string, time: Date, id?: string): string {
        const reminderId = id || `reminder-${Date.now()}`;
        
        const delay = time.getTime() - Date.now();
        if (delay <= 0) {
            // Time has already passed, trigger immediately
            this.showNotification({
                title: 'Reminder',
                message,
                type: 'info'
            });
            return reminderId;
        }

        const timeoutId = setTimeout(() => {
            this.showNotification({
                title: 'Reminder',
                message,
                type: 'info'
            });
            this.activeReminders.delete(reminderId);
        }, delay);

        this.activeReminders.set(reminderId, timeoutId);
        
        return reminderId;
    }

    /**
     * Cancel a scheduled reminder
     */
    cancelReminder(id: string) {
        const timeoutId = this.activeReminders.get(id);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.activeReminders.delete(id);
        }
    }

    /**
     * Get all achievements
     */
    getAchievements(): Achievement[] {
        return [...this.achievements];
    }

    /**
     * Get unlocked achievements
     */
    getUnlockedAchievements(): Achievement[] {
        return this.achievements.filter(achievement => achievement.unlocked);
    }

    /**
     * Get locked achievements
     */
    getLockedAchievements(): Achievement[] {
        return this.achievements.filter(achievement => !achievement.unlocked);
    }

    /**
     * Check for new achievements based on progress
     */
    private async checkForAchievements(progress: ProgressData) {
        // Example achievement checks - these would be more sophisticated in a real app
        const checks = [
            {
                id: 'first-entry',
                title: 'First Entry',
                description: 'Logged your first progress entry',
                icon: '🎯',
                points: 10,
                category: 'milestone',
                condition: () => this.progressHistory.length === 1
            },
            {
                id: 'week-streak',
                title: 'Week Streak',
                description: 'Logged entries for 7 consecutive days',
                icon: '🔥',
                points: 50,
                category: 'consistency',
                condition: () => this.hasWeekStreak()
            },
            {
                id: 'target-reached',
                title: 'Target Reached',
                description: 'Reached your target value',
                icon: '🏆',
                points: 30,
                category: 'fitness',
                condition: () => progress.target && progress.value >= progress.target
            }
        ];

        for (const check of checks) {
            if (check.condition() && !this.isAchievementUnlocked(check.id)) {
                await this.unlockAchievement({
                    id: check.id,
                    title: check.title,
                    description: check.description,
                    icon: check.icon,
                    points: check.points,
                    unlocked: true,
                    unlockDate: new Date(),
                    category: check.category as any
                });
            }
        }
    }

    /**
     * Check if user has a week streak
     */
    private hasWeekStreak(): boolean {
        if (this.progressHistory.length < 7) return false;
        
        // Sort by date descending
        const sorted = [...this.progressHistory].sort((a, b) => 
            b.date.getTime() - a.date.getTime()
        );
        
        // Check if last 7 entries are from consecutive days
        for (let i = 0; i < 6; i++) {
            const currentDate = new Date(sorted[i].date);
            const nextDate = new Date(sorted[i + 1].date);
            
            // Calculate difference in days
            const diffTime = Math.abs(currentDate.getTime() - nextDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays > 1) return false;
        }
        
        return true;
    }

    /**
     * Check if achievement is already unlocked
     */
    private isAchievementUnlocked(id: string): boolean {
        return this.achievements.some(a => a.id === id && a.unlocked);
    }

    /**
     * Unlock an achievement
     */
    private async unlockAchievement(achievement: Achievement) {
        this.achievements.push(achievement);
        
        // Show celebration notification
        this.showNotification({
            title: `Achievement Unlocked! ${achievement.icon}`,
            message: `${achievement.title}: ${achievement.description}`,
            type: 'success',
            duration: 8000
        });
        
        // Save achievements
        this.saveAchievements();
        
        // Trigger celebration effect
        this.triggerCelebration();
    }

    /**
     * Trigger celebration effect
     */
    private triggerCelebration() {
        // Create a simple celebration effect
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉 Congratulations! 🎉';
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 2em;
            font-weight: bold;
            color: gold;
            text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
            z-index: 9999;
            animation: celebrate 2s forwards;
            pointer-events: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes celebrate {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            document.body.removeChild(celebration);
            document.head.removeChild(style);
        }, 2000);
    }

    /**
     * Load personalization settings from storage
     */
    private loadPersonalizationSettings() {
        try {
            const saved = localStorage.getItem('ux-personalization-settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.personalizationSettings = {
                    ...this.personalizationSettings,
                    ...parsed
                };
                
                // Apply theme
                this.applyTheme(this.personalizationSettings.theme);
            }
        } catch (error) {
            console.error('Error loading personalization settings:', error);
        }
    }

    /**
     * Save personalization settings to storage
     */
    private savePersonalizationSettings() {
        try {
            localStorage.setItem('ux-personalization-settings', JSON.stringify(this.personalizationSettings));
        } catch (error) {
            console.error('Error saving personalization settings:', error);
        }
    }

    /**
     * Load achievements from storage
     */
    private loadAchievements() {
        try {
            const saved = localStorage.getItem('ux-achievements');
            if (saved) {
                this.achievements = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }

    /**
     * Save achievements to storage
     */
    private saveAchievements() {
        try {
            localStorage.setItem('ux-achievements', JSON.stringify(this.achievements));
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }

    /**
     * Save progress data to storage
     */
    private saveProgressData() {
        try {
            localStorage.setItem('ux-progress-history', JSON.stringify(this.progressHistory));
        } catch (error) {
            console.error('Error saving progress data:', error);
        }
    }

    /**
     * Clear all data
     */
    clearAllData() {
        this.notifications.clear();
        this.achievements = [];
        this.progressHistory = [];
        this.activeReminders.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeReminders.clear();
        
        localStorage.removeItem('ux-personalization-settings');
        localStorage.removeItem('ux-achievements');
        localStorage.removeItem('ux-progress-history');
    }
}

// Create and export a singleton instance
export const uxManager = UserExperienceManager.getInstance();

// Export a hook-like function for React components
export const useUserExperience = () => {
    return {
        showNotification: (options: NotificationOptions) => uxManager.showNotification(options),
        trackProgress: (data: ProgressData) => uxManager.trackProgress(data),
        getProgressHistory: (metric?: string) => uxManager.getProgressHistory(metric),
        setPersonalizationSettings: (settings: Partial<PersonalizationSettings>) => uxManager.setPersonalizationSettings(settings),
        getPersonalizationSettings: () => uxManager.getPersonalizationSettings(),
        scheduleReminder: (message: string, time: Date, id?: string) => uxManager.scheduleReminder(message, time, id),
        cancelReminder: (id: string) => uxManager.cancelReminder(id),
        getAchievements: () => uxManager.getAchievements(),
        getUnlockedAchievements: () => uxManager.getUnlockedAchievements(),
        getLockedAchievements: () => uxManager.getLockedAchievements()
    };
};