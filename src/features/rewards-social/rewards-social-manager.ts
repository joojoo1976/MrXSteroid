/**
 * Rewards and Social Features for Mr. X Steroid Application
 * Implements a reward system and social features to enhance user engagement
 */

import { uxManager } from '../utils/user-experience-enhancements';
import { dbOptimizer } from '../utils/database-optimization';

// Reward system interfaces
export interface Reward {
    id: string;
    name: string;
    description: string;
    pointsCost: number;
    category: 'achievement' | 'milestone' | 'consistency' | 'social';
    icon: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: Date;
}

export interface UserReward {
    userId: string;
    rewardId: string;
    earnedAt: Date;
    status: 'active' | 'redeemed' | 'expired';
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    participants: string[];
    startDate: Date;
    endDate: Date;
    goal: string;
    rewards: Reward[];
    status: 'active' | 'completed' | 'upcoming';
}

export interface SocialPost {
    id: string;
    userId: string;
    userName: string;
    content: string;
    mediaUrl?: string;
    likes: string[];
    comments: Comment[];
    createdAt: Date;
    privacy: 'public' | 'friends' | 'private';
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: Date;
}

// Leaderboard interfaces
export interface LeaderboardEntry {
    userId: string;
    userName: string;
    score: number;
    rank: number;
    avatar?: string;
    lastUpdated: Date;
}

// Rewards and social manager
export class RewardsSocialManager {
    private static instance: RewardsSocialManager;
    private rewardsCatalog: Reward[] = [];
    private userRewards: Map<string, UserReward[]> = new Map();
    private challenges: Challenge[] = [];
    private socialPosts: SocialPost[] = [];
    private leaderboards: Map<string, LeaderboardEntry[]> = new Map();

    private constructor() {
        this.initializeDefaultRewards();
        this.loadRewardsData();
    }

    public static getInstance(): RewardsSocialManager {
        if (!RewardsSocialManager.instance) {
            RewardsSocialManager.instance = new RewardsSocialManager();
        }
        return RewardsSocialManager.instance;
    }

    /**
     * Initialize default rewards
     */
    private initializeDefaultRewards() {
        this.rewardsCatalog = [
            {
                id: 'first-login',
                name: 'First Login',
                description: 'Logged in for the first time',
                pointsCost: 0,
                category: 'achievement',
                icon: '👋',
                rarity: 'common'
            },
            {
                id: 'week-streak',
                name: 'Week Streak',
                description: 'Maintained activity for 7 consecutive days',
                pointsCost: 0,
                category: 'consistency',
                icon: '🔥',
                rarity: 'rare'
            },
            {
                id: 'month-streak',
                name: 'Month Streak',
                description: 'Maintained activity for 30 consecutive days',
                pointsCost: 0,
                category: 'consistency',
                icon: '🔥🔥🔥',
                rarity: 'epic'
            },
            {
                id: 'first-post',
                name: 'First Post',
                description: 'Made your first social post',
                pointsCost: 0,
                category: 'social',
                icon: '📢',
                rarity: 'common'
            },
            {
                id: 'first-challenge',
                name: 'Challenge Accepted',
                description: 'Joined your first challenge',
                pointsCost: 0,
                category: 'milestone',
                icon: '💪',
                rarity: 'rare'
            },
            {
                id: 'top-performer',
                name: 'Top Performer',
                description: 'Reached the top of a leaderboard',
                pointsCost: 0,
                category: 'achievement',
                icon: '🏆',
                rarity: 'epic'
            }
        ];
    }

    /**
     * Award a reward to a user
     */
    async awardReward(userId: string, rewardId: string): Promise<boolean> {
        const reward = this.rewardsCatalog.find(r => r.id === rewardId);
        if (!reward) {
            console.error(`Reward with ID ${rewardId} not found`);
            return false;
        }

        // Check if user already has this reward
        const userRewards = this.userRewards.get(userId) || [];
        if (userRewards.some(ur => ur.rewardId === rewardId && ur.status === 'active')) {
            return false; // Already awarded
        }

        // Create user reward entry
        const userReward: UserReward = {
            userId,
            rewardId,
            earnedAt: new Date(),
            status: 'active'
        };

        // Add to user rewards
        if (!this.userRewards.has(userId)) {
            this.userRewards.set(userId, []);
        }
        this.userRewards.get(userId)!.push(userReward);

        // Show notification
        uxManager.showNotification({
            title: `Achievement Unlocked! ${reward.icon}`,
            message: `${reward.name}: ${reward.description}`,
            type: 'success',
            duration: 8000
        });

        // Save to storage
        this.saveRewardsData();

        return true;
    }

    /**
     * Get user's rewards
     */
    getUserRewards(userId: string): UserReward[] {
        return this.userRewards.get(userId) || [];
    }

    /**
     * Get available rewards for user
     */
    getAvailableRewards(userId: string): Reward[] {
        const userRewards = this.getUserRewards(userId);
        const earnedRewardIds = new Set(userRewards.map(ur => ur.rewardId));

        return this.rewardsCatalog.filter(reward => !earnedRewardIds.has(reward.id));
    }

    /**
     * Create a new challenge
     */
    async createChallenge(challenge: Omit<Challenge, 'id' | 'participants' | 'status'>): Promise<string> {
        const newChallenge: Challenge = {
            ...challenge,
            id: `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            participants: [],
            status: challenge.startDate > new Date() ? 'upcoming' : 'active'
        };

        this.challenges.push(newChallenge);
        this.saveChallengesData();

        return newChallenge.id;
    }

    /**
     * Join a challenge
     */
    async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
        const challenge = this.challenges.find(c => c.id === challengeId);
        if (!challenge) {
            console.error(`Challenge with ID ${challengeId} not found`);
            return false;
        }

        if (challenge.participants.includes(userId)) {
            return false; // Already joined
        }

        challenge.participants.push(userId);
        
        // Award joining reward
        await this.awardReward(userId, 'first-challenge');

        this.saveChallengesData();
        return true;
    }

    /**
     * Get active challenges
     */
    getActiveChallenges(): Challenge[] {
        return this.challenges.filter(c => c.status === 'active');
    }

    /**
     * Get upcoming challenges
     */
    getUpcomingChallenges(): Challenge[] {
        return this.challenges.filter(c => c.status === 'upcoming');
    }

    /**
     * Create a social post
     */
    async createPost(post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'createdAt'>): Promise<string> {
        const newPost: SocialPost = {
            ...post,
            id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            likes: [],
            comments: [],
            createdAt: new Date()
        };

        this.socialPosts.unshift(newPost); // Add to beginning of array

        // Award first post reward if this is the user's first post
        const userPosts = this.getUserPosts(post.userId);
        if (userPosts.length === 1) {
            await this.awardReward(post.userId, 'first-post');
        }

        this.saveSocialData();
        return newPost.id;
    }

    /**
     * Get user's posts
     */
    getUserPosts(userId: string): SocialPost[] {
        return this.socialPosts.filter(post => post.userId === userId);
    }

    /**
     * Get feed posts (public posts)
     */
    getFeedPosts(): SocialPost[] {
        return this.socialPosts.filter(post => post.privacy === 'public');
    }

    /**
     * Like a post
     */
    async likePost(postId: string, userId: string): Promise<boolean> {
        const post = this.socialPosts.find(p => p.id === postId);
        if (!post) {
            console.error(`Post with ID ${postId} not found`);
            return false;
        }

        if (post.likes.includes(userId)) {
            // Unlike if already liked
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            // Like the post
            post.likes.push(userId);
        }

        this.saveSocialData();
        return true;
    }

    /**
     * Comment on a post
     */
    async commentOnPost(postId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<string> {
        const post = this.socialPosts.find(p => p.id === postId);
        if (!post) {
            console.error(`Post with ID ${postId} not found`);
            return '';
        }

        const newComment: Comment = {
            ...comment,
            id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        this.saveSocialData();

        return newComment.id;
    }

    /**
     * Update leaderboard
     */
    async updateLeaderboard(boardId: string, userId: string, userName: string, score: number): Promise<void> {
        if (!this.leaderboards.has(boardId)) {
            this.leaderboards.set(boardId, []);
        }

        const board = this.leaderboards.get(boardId)!;
        const existingEntry = board.find(entry => entry.userId === userId);

        if (existingEntry) {
            existingEntry.score = score;
            existingEntry.lastUpdated = new Date();
        } else {
            board.push({
                userId,
                userName,
                score,
                rank: 0, // Will be calculated later
                lastUpdated: new Date()
            });
        }

        // Recalculate ranks
        this.calculateRanks(boardId);
        this.saveLeaderboardData();
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(boardId: string): LeaderboardEntry[] {
        const board = this.leaderboards.get(boardId) || [];
        return [...board].sort((a, b) => b.score - a.score);
    }

    /**
     * Calculate ranks for a leaderboard
     */
    private calculateRanks(boardId: string): void {
        const board = this.leaderboards.get(boardId);
        if (!board) return;

        // Sort by score descending
        board.sort((a, b) => b.score - a.score);

        // Assign ranks
        for (let i = 0; i < board.length; i++) {
            board[i].rank = i + 1;
        }
    }

    /**
     * Get user's rank in a leaderboard
     */
    getUserRank(boardId: string, userId: string): number {
        const board = this.getLeaderboard(boardId);
        const userEntry = board.find(entry => entry.userId === userId);
        return userEntry ? userEntry.rank : -1; // -1 means not ranked
    }

    /**
     * Check for streak achievements
     */
    async checkStreakAchievements(userId: string, currentStreak: number): Promise<void> {
        if (currentStreak >= 30) {
            await this.awardReward(userId, 'month-streak');
        } else if (currentStreak >= 7) {
            await this.awardReward(userId, 'week-streak');
        }
    }

    /**
     * Check for top performer achievement
     */
    async checkTopPerformerAchievement(boardId: string, userId: string): Promise<void> {
        const board = this.getLeaderboard(boardId);
        const topUser = board[0];

        if (topUser && topUser.userId === userId) {
            await this.awardReward(userId, 'top-performer');
        }
    }

    /**
     * Load rewards data from storage
     */
    private loadRewardsData() {
        try {
            const rewardsData = localStorage.getItem('rewards-social-data');
            if (rewardsData) {
                const parsed = JSON.parse(rewardsData);
                
                // Load user rewards
                if (parsed.userRewards) {
                    Object.entries(parsed.userRewards).forEach(([userId, rewards]: [string, any[]]) => {
                        this.userRewards.set(userId, rewards.map((r: any) => ({
                            ...r,
                            earnedAt: new Date(r.earnedAt)
                        })));
                    });
                }

                // Load challenges
                if (parsed.challenges) {
                    this.challenges = parsed.challenges.map((c: any) => ({
                        ...c,
                        startDate: new Date(c.startDate),
                        endDate: new Date(c.endDate)
                    }));
                }

                // Load social posts
                if (parsed.socialPosts) {
                    this.socialPosts = parsed.socialPosts.map((p: any) => ({
                        ...p,
                        createdAt: new Date(p.createdAt),
                        comments: p.comments.map((c: any) => ({
                            ...c,
                            createdAt: new Date(c.createdAt)
                        }))
                    }));
                }

                // Load leaderboards
                if (parsed.leaderboards) {
                    Object.entries(parsed.leaderboards).forEach(([boardId, entries]: [string, any[]]) => {
                        this.leaderboards.set(boardId, entries.map((e: any) => ({
                            ...e,
                            lastUpdated: new Date(e.lastUpdated)
                        })));
                    });
                }
            }
        } catch (error) {
            console.error('Error loading rewards data:', error);
        }
    }

    /**
     * Save rewards data to storage
     */
    private saveRewardsData() {
        try {
            const data = {
                userRewards: Object.fromEntries(this.userRewards),
                rewardsCatalog: this.rewardsCatalog,
                challenges: this.challenges,
                socialPosts: this.socialPosts,
                leaderboards: Object.fromEntries(this.leaderboards)
            };
            localStorage.setItem('rewards-social-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving rewards data:', error);
        }
    }

    /**
     * Save challenges data to storage
     */
    private saveChallengesData() {
        try {
            const data = {
                challenges: this.challenges
            };
            localStorage.setItem('challenges-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving challenges data:', error);
        }
    }

    /**
     * Save social data to storage
     */
    private saveSocialData() {
        try {
            const data = {
                socialPosts: this.socialPosts
            };
            localStorage.setItem('social-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving social data:', error);
        }
    }

    /**
     * Save leaderboard data to storage
     */
    private saveLeaderboardData() {
        try {
            const data = {
                leaderboards: Object.fromEntries(this.leaderboards)
            };
            localStorage.setItem('leaderboards-data', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving leaderboard data:', error);
        }
    }

    /**
     * Reset all data (for testing purposes)
     */
    resetAllData() {
        this.userRewards.clear();
        this.challenges = [];
        this.socialPosts = [];
        this.leaderboards.clear();
        
        localStorage.removeItem('rewards-social-data');
        localStorage.removeItem('challenges-data');
        localStorage.removeItem('social-data');
        localStorage.removeItem('leaderboards-data');
    }
}

// Export a singleton instance
export const rewardsSocialManager = RewardsSocialManager.getInstance();

// Export a hook-like function for React components
export const useRewardsSocial = () => {
    return {
        awardReward: (userId: string, rewardId: string) => rewardsSocialManager.awardReward(userId, rewardId),
        getUserRewards: (userId: string) => rewardsSocialManager.getUserRewards(userId),
        getAvailableRewards: (userId: string) => rewardsSocialManager.getAvailableRewards(userId),
        createChallenge: (challenge: Omit<Challenge, 'id' | 'participants' | 'status'>) => rewardsSocialManager.createChallenge(challenge),
        joinChallenge: (userId: string, challengeId: string) => rewardsSocialManager.joinChallenge(userId, challengeId),
        getActiveChallenges: () => rewardsSocialManager.getActiveChallenges(),
        getUpcomingChallenges: () => rewardsSocialManager.getUpcomingChallenges(),
        createPost: (post: Omit<SocialPost, 'id' | 'likes' | 'comments' | 'createdAt'>) => rewardsSocialManager.createPost(post),
        getUserPosts: (userId: string) => rewardsSocialManager.getUserPosts(userId),
        getFeedPosts: () => rewardsSocialManager.getFeedPosts(),
        likePost: (postId: string, userId: string) => rewardsSocialManager.likePost(postId, userId),
        commentOnPost: (postId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => rewardsSocialManager.commentOnPost(postId, comment),
        updateLeaderboard: (boardId: string, userId: string, userName: string, score: number) => rewardsSocialManager.updateLeaderboard(boardId, userId, userName, score),
        getLeaderboard: (boardId: string) => rewardsSocialManager.getLeaderboard(boardId),
        getUserRank: (boardId: string, userId: string) => rewardsSocialManager.getUserRank(boardId, userId),
        checkStreakAchievements: (userId: string, currentStreak: number) => rewardsSocialManager.checkStreakAchievements(userId, currentStreak),
        checkTopPerformerAchievement: (boardId: string, userId: string) => rewardsSocialManager.checkTopPerformerAchievement(boardId, userId)
    };
};