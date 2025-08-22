/**
 * Persistent Storage Manager
 * Provides robust data persistence across sessions and prevents data loss
 */

export class PersistentStorage {
  private static readonly BACKUP_KEY = 'familyDataBackup';
  private static readonly LAST_BACKUP_KEY = 'lastBackupTimestamp';
  
  // Data keys that should be backed up
  private static readonly BACKUP_KEYS = [
    'familySettings',
    'spendingCategories', 
    'familyChildren',
    // Child-specific keys will be detected dynamically
  ];

  /**
   * Create a comprehensive backup of all family data
   */
  static createBackup(): void {
    try {
      const backup: Record<string, any> = {};
      
      // Backup standard keys
      this.BACKUP_KEYS.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          backup[key] = JSON.parse(data);
        }
      });
      
      // Backup child-specific data
      const familyChildren = JSON.parse(localStorage.getItem('familyChildren') || '[]');
      familyChildren.forEach((child: any) => {
        const childId = child.id.toString();
        
        // Backup child transactions
        const transactions = localStorage.getItem(`child-${childId}-transactions`);
        if (transactions) {
          backup[`child-${childId}-transactions`] = JSON.parse(transactions);
        }
        
        // Backup child requests
        const requests = localStorage.getItem(`child-${childId}-requests`);
        if (requests) {
          backup[`child-${childId}-requests`] = JSON.parse(requests);
        }
        
        // Backup child goals
        const goals = localStorage.getItem(`child-${childId}-goals`);
        if (goals) {
          backup[`child-${childId}-goals`] = JSON.parse(goals);
        }
        
        // Backup child debts
        const debts = localStorage.getItem(`child-${childId}-debts`);
        if (debts) {
          backup[`child-${childId}-debts`] = JSON.parse(debts);
        }
      });
      
      // Store backup with timestamp
      const backupData = {
        timestamp: Date.now(),
        data: backup
      };
      
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));
      localStorage.setItem(this.LAST_BACKUP_KEY, Date.now().toString());
      
      console.log('Family data backup created successfully');
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  /**
   * Restore data from backup
   */
  static restoreFromBackup(): boolean {
    try {
      const backupData = localStorage.getItem(this.BACKUP_KEY);
      if (!backupData) {
        console.log('No backup found');
        return false;
      }
      
      const backup = JSON.parse(backupData);
      
      // Restore all backed up data
      Object.entries(backup.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
      
      console.log(`Data restored from backup (${new Date(backup.timestamp).toLocaleString()})`);
      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return false;
    }
  }

  /**
   * Auto-backup data after important operations
   */
  static autoBackup(): void {
    const lastBackup = localStorage.getItem(this.LAST_BACKUP_KEY);
    const now = Date.now();
    
    // Create backup if none exists or if it's been more than 5 minutes
    if (!lastBackup || (now - parseInt(lastBackup)) > 5 * 60 * 1000) {
      this.createBackup();
    }
  }

  /**
   * Get backup info
   */
  static getBackupInfo(): { exists: boolean; timestamp?: number; age?: string } {
    const backupData = localStorage.getItem(this.BACKUP_KEY);
    if (!backupData) {
      return { exists: false };
    }
    
    try {
      const backup = JSON.parse(backupData);
      const age = this.formatTimeDifference(Date.now() - backup.timestamp);
      
      return {
        exists: true,
        timestamp: backup.timestamp,
        age
      };
    } catch {
      return { exists: false };
    }
  }

  /**
   * Sync data between tabs using storage events
   */
  static setupCrossTabSync(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('storage', (e) => {
      // Auto-backup when important data changes
      if (e.key && this.isImportantKey(e.key)) {
        setTimeout(() => this.autoBackup(), 1000); // Delay to allow operation to complete
      }
    });
  }

  /**
   * Safe data write with backup
   */
  static safeWrite(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      
      // Create backup for important data
      if (this.isImportantKey(key)) {
        setTimeout(() => this.autoBackup(), 100);
      }
    } catch (error) {
      console.error(`Failed to write to localStorage (${key}):`, error);
    }
  }

  /**
   * Safe data read with fallback
   */
  static safeRead(key: string, defaultValue: any = null): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Failed to read from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  private static isImportantKey(key: string): boolean {
    return this.BACKUP_KEYS.includes(key) || 
           key.startsWith('child-') || 
           key.includes('goals') || 
           key.includes('transactions') || 
           key.includes('requests');
  }

  private static formatTimeDifference(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''} atrás`;
    if (hours > 0) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    if (minutes > 0) return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    return 'há pouco';
  }
}

// Initialize cross-tab sync when module loads
if (typeof window !== 'undefined') {
  PersistentStorage.setupCrossTabSync();
}