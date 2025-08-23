interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  pointsRequired?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'saving' | 'spending' | 'goals' | 'consistency' | 'milestone';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EarnedBadge {
  id: number;
  childId: number;
  badgeId: number;
  badge: Badge;
  earnedAt: string;
  createdAt: string;
}

interface PointTransaction {
  id: number;
  childId: number;
  points: number;
  reason: string;
  actionType:
    | 'goal_created'
    | 'goal_completed'
    | 'purchase_approved'
    | 'daily_login'
    | 'spending_tracked'
    | 'badge_earned'
    | 'level_up';
  relatedId?: number; // ID of related goal, purchase, etc.
  multiplier: number;
  createdAt: string;
}

interface ChildStats {
  childId: number;
  totalPoints: number;
  currentLevel: number;
  pointsToNextLevel: number;
  levelProgress: number;
  earnedBadges: number;
  goalsCompleted: number;
  daysActive: number;
  totalSpent: number;
  totalSaved: number;
  lastActivity: string;
  streakDays: number;
  updatedAt: string;
}

// Point values for different actions
const POINT_VALUES = {
  GOAL_CREATED: 10,
  GOAL_COMPLETED: 50,
  PURCHASE_APPROVED: 5,
  DAILY_LOGIN: 2,
  SPENDING_TRACKED: 3,
  BADGE_EARNED: 25,
  LEVEL_UP: 100,
  STREAK_BONUS: 5, // per day in streak
  BUDGET_STAYED_UNDER: 20,
  FIRST_TIME_BONUS: 15,
};

// Level calculation: Each level requires more points (100, 250, 450, 700, 1000, etc.)
const calculatePointsForLevel = (level: number): number => {
  if (level <= 1) return 0;
  return Math.floor(100 * level + 50 * Math.pow(level - 1, 1.5));
};

const calculateLevelFromPoints = (points: number): number => {
  let level = 1;
  while (calculatePointsForLevel(level + 1) <= points) {
    level++;
  }
  return level;
};

// Global storage for badges
if (!(globalThis as any).__badges) {
  (globalThis as any).__badges = [
    {
      id: 1,
      name: 'Primeiro Passo',
      description: 'Fez seu primeiro login no banco',
      icon: '👋',
      criteria: 'first_login',
      rarity: 'common',
      category: 'milestone',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Sonhador',
      description: 'Criou seu primeiro objetivo de poupança',
      icon: '🎯',
      criteria: 'first_goal',
      rarity: 'common',
      category: 'goals',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: 'Realizador',
      description: 'Completou seu primeiro objetivo',
      icon: '🏆',
      criteria: 'first_goal_completed',
      rarity: 'rare',
      category: 'goals',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: 'Poupador',
      description: 'Guardou R$ 100 no total',
      icon: '💰',
      criteria: 'saved_100',
      pointsRequired: 100,
      rarity: 'common',
      category: 'saving',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: 'Super Poupador',
      description: 'Guardou R$ 500 no total',
      icon: '🏦',
      criteria: 'saved_500',
      pointsRequired: 500,
      rarity: 'epic',
      category: 'saving',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 6,
      name: 'Organizador',
      description: 'Registrou 10 gastos',
      icon: '📊',
      criteria: 'tracked_10_expenses',
      rarity: 'common',
      category: 'spending',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 7,
      name: 'Disciplinado',
      description: 'Ficou dentro do orçamento por 5 dias seguidos',
      icon: '🎖️',
      criteria: 'budget_streak_5',
      rarity: 'rare',
      category: 'consistency',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 8,
      name: 'Estrela Consistente',
      description: 'Usou o banco por 7 dias seguidos',
      icon: '⭐',
      criteria: 'login_streak_7',
      rarity: 'rare',
      category: 'consistency',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 9,
      name: 'Mega Poupador',
      description: 'Guardou R$ 1000 no total',
      icon: '💎',
      criteria: 'saved_1000',
      pointsRequired: 1000,
      rarity: 'legendary',
      category: 'saving',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 10,
      name: 'Mestre dos Objetivos',
      description: 'Completou 5 objetivos',
      icon: '🎪',
      criteria: 'completed_5_goals',
      rarity: 'epic',
      category: 'goals',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// Global storage for earned badges
if (!(globalThis as any).__earnedBadges) {
  (globalThis as any).__earnedBadges = [];
  (globalThis as any).__earnedBadgeNextId = 1;
}

// Global storage for point transactions
if (!(globalThis as any).__pointTransactions) {
  (globalThis as any).__pointTransactions = [];
  (globalThis as any).__pointTransactionNextId = 1;
}

// Global storage for child stats
if (!(globalThis as any).__childStats) {
  (globalThis as any).__childStats = {};
}

export const GamificationStorage = {
  // Badge methods
  getAllBadges: (): Badge[] => {
    return [...(globalThis as any).__badges];
  },

  getBadgeById: (id: number): Badge | null => {
    return (
      (globalThis as any).__badges.find((badge: Badge) => badge.id === id) ||
      null
    );
  },

  getEarnedBadgesByChild: (childId: number): EarnedBadge[] => {
    return (globalThis as any).__earnedBadges.filter(
      (earned: EarnedBadge) => earned.childId === childId
    );
  },

  awardBadge: (childId: number, badgeId: number): EarnedBadge | null => {
    const badge = GamificationStorage.getBadgeById(badgeId);
    if (!badge) return null;

    // Check if already earned
    const alreadyEarned = (globalThis as any).__earnedBadges.some(
      (earned: EarnedBadge) =>
        earned.childId === childId && earned.badgeId === badgeId
    );

    if (alreadyEarned) return null;

    const earnedBadge: EarnedBadge = {
      id: (globalThis as any).__earnedBadgeNextId++,
      childId,
      badgeId,
      badge,
      earnedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    (globalThis as any).__earnedBadges.push(earnedBadge);

    // Award points for earning badge
    GamificationStorage.addPoints(
      childId,
      POINT_VALUES.BADGE_EARNED,
      'Ganhou uma conquista',
      'badge_earned',
      badgeId
    );

    return earnedBadge;
  },

  // Point methods
  addPoints: (
    childId: number,
    points: number,
    reason: string,
    actionType: PointTransaction['actionType'],
    relatedId?: number,
    multiplier: number = 1
  ): PointTransaction => {
    const finalPoints = Math.round(points * multiplier);

    const transaction: PointTransaction = {
      id: (globalThis as any).__pointTransactionNextId++,
      childId,
      points: finalPoints,
      reason,
      actionType,
      relatedId,
      multiplier,
      createdAt: new Date().toISOString(),
    };

    (globalThis as any).__pointTransactions.push(transaction);

    // Update child stats
    GamificationStorage.updateChildStats(childId);

    return transaction;
  },

  getPointTransactionsByChild: (childId: number): PointTransaction[] => {
    return (globalThis as any).__pointTransactions
      .filter(
        (transaction: PointTransaction) => transaction.childId === childId
      )
      .sort(
        (a: PointTransaction, b: PointTransaction) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  },

  getTotalPointsByChild: (childId: number): number => {
    return (globalThis as any).__pointTransactions
      .filter(
        (transaction: PointTransaction) => transaction.childId === childId
      )
      .reduce(
        (total: number, transaction: PointTransaction) =>
          total + transaction.points,
        0
      );
  },

  // Stats methods
  getChildStats: (childId: number): ChildStats => {
    if (!(globalThis as any).__childStats[childId]) {
      GamificationStorage.updateChildStats(childId);
    }
    return (globalThis as any).__childStats[childId];
  },

  updateChildStats: (childId: number): ChildStats => {
    const totalPoints = GamificationStorage.getTotalPointsByChild(childId);
    const currentLevel = calculateLevelFromPoints(totalPoints);
    const pointsForCurrentLevel = calculatePointsForLevel(currentLevel);
    const pointsForNextLevel = calculatePointsForLevel(currentLevel + 1);
    const pointsToNextLevel = pointsForNextLevel - totalPoints;
    const levelProgress = Math.round(
      ((totalPoints - pointsForCurrentLevel) /
        (pointsForNextLevel - pointsForCurrentLevel)) *
        100
    );

    const earnedBadges =
      GamificationStorage.getEarnedBadgesByChild(childId).length;
    const transactions =
      GamificationStorage.getPointTransactionsByChild(childId);
    const lastActivity =
      transactions.length > 0
        ? transactions[0].createdAt
        : new Date().toISOString();

    // Calculate streak (simplified - would need proper date tracking in real app)
    const streakDays = 1; // Placeholder

    const stats: ChildStats = {
      childId,
      totalPoints,
      currentLevel,
      pointsToNextLevel,
      levelProgress: Math.max(0, Math.min(100, levelProgress)),
      earnedBadges,
      goalsCompleted: 0, // Will be updated by goal system
      daysActive: 1, // Placeholder
      totalSpent: 0, // Will be updated by spending system
      totalSaved: 0, // Will be updated by goal system
      lastActivity,
      streakDays,
      updatedAt: new Date().toISOString(),
    };

    (globalThis as any).__childStats[childId] = stats;
    return stats;
  },

  // Achievement checking methods
  checkAndAwardBadges: (
    childId: number,
    actionType: string,
    data?: any
  ): EarnedBadge[] => {
    const awardedBadges: EarnedBadge[] = [];
    const badges = GamificationStorage.getAllBadges();
    const childStats = GamificationStorage.getChildStats(childId);
    const earnedBadgeIds = GamificationStorage.getEarnedBadgesByChild(
      childId
    ).map(eb => eb.badgeId);

    for (const badge of badges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;

      switch (badge.criteria) {
        case 'first_login':
          shouldAward = actionType === 'login';
          break;
        case 'first_goal':
          shouldAward = actionType === 'goal_created';
          break;
        case 'first_goal_completed':
          shouldAward = actionType === 'goal_completed';
          break;
        case 'saved_100':
          shouldAward = data?.totalSaved >= 100;
          break;
        case 'saved_500':
          shouldAward = data?.totalSaved >= 500;
          break;
        case 'saved_1000':
          shouldAward = data?.totalSaved >= 1000;
          break;
        case 'tracked_10_expenses':
          shouldAward = data?.expenseCount >= 10;
          break;
        case 'completed_5_goals':
          shouldAward = data?.goalsCompleted >= 5;
          break;
        case 'login_streak_7':
          shouldAward = childStats.streakDays >= 7;
          break;
        case 'budget_streak_5':
          shouldAward = data?.budgetStreak >= 5;
          break;
      }

      if (shouldAward) {
        const earnedBadge = GamificationStorage.awardBadge(childId, badge.id);
        if (earnedBadge) {
          awardedBadges.push(earnedBadge);
        }
      }
    }

    return awardedBadges;
  },

  // Level system
  calculateLevel: calculateLevelFromPoints,
  calculatePointsForLevel,

  // Helper methods for common actions
  handleGoalCreated: (
    childId: number
  ): { points: PointTransaction; badges: EarnedBadge[] } => {
    const points = GamificationStorage.addPoints(
      childId,
      POINT_VALUES.GOAL_CREATED,
      'Criou um novo objetivo',
      'goal_created'
    );

    const badges = GamificationStorage.checkAndAwardBadges(
      childId,
      'goal_created'
    );

    return { points, badges };
  },

  handleGoalCompleted: (
    childId: number,
    goalId: number
  ): { points: PointTransaction; badges: EarnedBadge[] } => {
    const points = GamificationStorage.addPoints(
      childId,
      POINT_VALUES.GOAL_COMPLETED,
      'Completou um objetivo',
      'goal_completed',
      goalId
    );

    const badges = GamificationStorage.checkAndAwardBadges(
      childId,
      'goal_completed'
    );

    return { points, badges };
  },

  handleSpendingTracked: (
    childId: number,
    expenseId: number
  ): { points: PointTransaction; badges: EarnedBadge[] } => {
    const points = GamificationStorage.addPoints(
      childId,
      POINT_VALUES.SPENDING_TRACKED,
      'Registrou um gasto',
      'spending_tracked',
      expenseId
    );

    // Check for spending-related badges
    // This would need integration with spending system to get accurate data
    const badges = GamificationStorage.checkAndAwardBadges(
      childId,
      'spending_tracked',
      {
        expenseCount: 10, // Placeholder
      }
    );

    return { points, badges };
  },

  handleDailyLogin: (
    childId: number
  ): { points: PointTransaction; badges: EarnedBadge[] } => {
    const points = GamificationStorage.addPoints(
      childId,
      POINT_VALUES.DAILY_LOGIN,
      'Login diário',
      'daily_login'
    );

    const badges = GamificationStorage.checkAndAwardBadges(childId, 'login');

    return { points, badges };
  },
};

export type { Badge, EarnedBadge, PointTransaction, ChildStats };
export { POINT_VALUES };
