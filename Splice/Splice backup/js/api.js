class DiscordWebhookManager {
    constructor() {
        this.currentUser = null;
        this.logs = [];
        this.stats = {
            webhooksSent: 0,
            successCount: 0,
            failedCount: 0
        };
        this.bulkSending = {
            active: false,
            current: 0,
            total: 0,
            timeoutId: null
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateStats();
    }

    bindEvents() {
        // Login events
        document.getElementById('loginBtn').addEventListener('click', () => this.handleLogin());
        document.getElementById('userIdInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Navigation events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Webhook events
        document.getElementById('testWebhook').addEventListener('click', () => this.testWebhook());
        document.getElementById('sendWebhook').addEventListener('click', () => this.sendWebhook());
        document.getElementById('bulkSend').addEventListener('click', () => this.startBulkSend());
        document.getElementById('stopBulk').addEventListener('click', () => this.stopBulkSend());

        // Preset events
        document.querySelectorAll('.preset-card').forEach(card => {
            card.addEventListener('click', (e) => this.loadPreset(e));
        });

        // Log events
        document.getElementById('clearLogs').addEventListener('click', () => this.clearLogs());

        // Settings events
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.saveSettings());
        });

        // Modal events
        document.getElementById('helpLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showModal('helpModal');
        });

        document.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal('helpModal');
        });

        document.getElementById('helpModal').addEventListener('click', (e) => {
            if (e.target.id === 'helpModal') this.hideModal('helpModal');
        });

        // Logout event
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    async handleLogin() {
        const userIdInput = document.getElementById('userIdInput');
        const loginBtn = document.getElementById('loginBtn');
        const userId = userIdInput.value.trim();

        if (!userId) {
            this.showNotification('Please enter your Discord User ID', 'error');
            return;
        }

        if (!/^\d{17,19}$/.test(userId)) {
            this.showNotification('Invalid Discord User ID format', 'error');
            return;
        }

        // Show loading state
        loginBtn.classList.add('loading');
        loginBtn.querySelector('span').style.display = 'none';
        loginBtn.querySelector('.btn-loader').style.display = 'block';

        try {
            // Simulate API call to get user info
            await this.delay(1500);
            
            // Mock user data (in real app, this would come from Discord API)
            const userData = {
                id: userId,
                username: `User${userId.slice(-4)}`,
                discriminator: '0001',
                avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face`,
                tag: `User${userId.slice(-4)}#0001`
            };

            this.currentUser = userData;
            this.showDashboard();
            this.updateUserInfo();
            this.showNotification('Successfully logged in!', 'success');

        } catch (error) {
            this.showNotification('Failed to login. Please try again.', 'error');
        } finally {
            // Reset button state
            loginBtn.classList.remove('loading');
            loginBtn.querySelector('span').style.display = 'inline';
            loginBtn.querySelector('.btn-loader').style.display = 'none';
        }
    }

    showDashboard() {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const elements = {
            userAvatar: document.getElementById('userAvatar'),
            userName: document.getElementById('userName'),
            userTag: document.getElementById('userTag'),
            profileAvatar: document.getElementById('profileAvatar'),
            profileName: document.getElementById('profileName'),
            profileTag: document.getElementById('profileTag'),
            profileId: document.getElementById('profileId')
        };

        elements.userAvatar.src = this.currentUser.avatar;
        elements.userName.textContent = this.currentUser.username;
        elements.userTag.textContent = `@${this.currentUser.username.toLowerCase()}`;
        elements.profileAvatar.src = this.currentUser.avatar;
        elements.profileName.textContent = this.currentUser.username;
        elements.profileTag.textContent = this.currentUser.tag;
        elements.profileId.textContent = `ID: ${this.currentUser.id}`;
    }

    handleNavigation(e) {
        e.preventDefault();
        const tabName = e.currentTarget.dataset.tab;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        e.currentTarget.classList.add('active');

        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Update page title
        const titles = {
            webhooks: { title: 'Webhook Management', subtitle: 'Manage and test your Discord webhooks' },
            logs: { title: 'Activity Logs', subtitle: 'View webhook execution history' },
            profile: { title: 'User Profile', subtitle: 'Manage your account and settings' }
        };

        document.getElementById('pageTitle').textContent = titles[tabName].title;
        document.getElementById('pageSubtitle').textContent = titles[tabName].subtitle;
    }

    async testWebhook() {
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        
        if (!this.validateWebhookUrl(webhookUrl)) {
            this.showNotification('Please enter a valid Discord webhook URL', 'error');
            return;
        }

        const testMessage = {
            content: '🧪 **Test Message**\nJust Testing Webhook',
            username: 'Splice Webhook Spammer',
            avatar_url: 'https://cdn.discordapp.com/attachments/1380599922423759010/1380946609210261565/terminal.png?'
        };

        await this.executeWebhook(webhookUrl, testMessage, true);
    }

    async sendWebhook() {
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        const message = document.getElementById('webhookMessage').value.trim();
        const username = document.getElementById('webhookUsername').value.trim();
        const avatarUrl = document.getElementById('webhookAvatar').value.trim();

        if (!this.validateWebhookUrl(webhookUrl)) {
            this.showNotification('Please enter a valid Discord webhook URL', 'error');
            return;
        }

        if (!message) {
            this.showNotification('Please enter a message to send', 'error');
            return;
        }

        const payload = { content: message };
        if (username) payload.username = username;
        if (avatarUrl) payload.avatar_url = avatarUrl;

        await this.executeWebhook(webhookUrl, payload);
    }

    async startBulkSend() {
        const webhookUrl = document.getElementById('webhookUrl').value.trim();
        const message = document.getElementById('webhookMessage').value.trim();
        const username = document.getElementById('webhookUsername').value.trim();
        const avatarUrl = document.getElementById('webhookAvatar').value.trim();
        const messageCount = parseInt(document.getElementById('messageCount').value) || 5;
        const messageDelay = parseInt(document.getElementById('messageDelay').value) || 1000;

        if (!this.validateWebhookUrl(webhookUrl)) {
            this.showNotification('Please enter a valid Discord webhook URL', 'error');
            return;
        }

        if (!message) {
            this.showNotification('Please enter a message to send', 'error');
            return;
        }

        if (messageCount < 1 || messageCount > 100) {
            this.showNotification('Message count must be between 1 and 100', 'error');
            return;
        }

        if (messageDelay < 100) {
            this.showNotification('Delay must be at least 100ms to avoid rate limits', 'error');
            return;
        }

        // Initialize bulk sending
        this.bulkSending = {
            active: true,
            current: 0,
            total: messageCount,
            timeoutId: null
        };

        // Update UI
        this.updateBulkSendingUI(true);
        this.updateProgress(0, messageCount);

        // Create payload
        const payload = { content: message };
        if (username) payload.username = username;
        if (avatarUrl) payload.avatar_url = avatarUrl;

        this.showNotification(`Starting bulk send: ${messageCount} messages with ${messageDelay}ms delay`, 'success');

        // Start sending messages
        await this.sendBulkMessages(webhookUrl, payload, messageCount, messageDelay);
    }

    async sendBulkMessages(webhookUrl, payload, total, delay) {
        for (let i = 0; i < total && this.bulkSending.active; i++) {
            try {
                // Add message number to content for uniqueness
                const numberedPayload = {
                    ...payload,
                    content: `${payload.content}\n\n*Message ${i + 1} of ${total}*`
                };

                await this.executeWebhook(webhookUrl, numberedPayload, false, true);
                
                this.bulkSending.current = i + 1;
                this.updateProgress(i + 1, total);

                // Wait for delay before next message (except for last message)
                if (i < total - 1 && this.bulkSending.active) {
                    await this.delay(delay);
                }
            } catch (error) {
                console.error('Error in bulk send:', error);
                // Continue with next message even if one fails
            }
        }

        // Finish bulk sending
        if (this.bulkSending.active) {
            this.showNotification(`Bulk send completed! Sent ${this.bulkSending.current} messages`, 'success');
        } else {
            this.showNotification(`Bulk send stopped. Sent ${this.bulkSending.current} of ${total} messages`, 'warning');
        }

        this.stopBulkSend();
    }

    stopBulkSend() {
        this.bulkSending.active = false;
        if (this.bulkSending.timeoutId) {
            clearTimeout(this.bulkSending.timeoutId);
        }
        this.updateBulkSendingUI(false);
    }

    updateBulkSendingUI(active) {
        const bulkBtn = document.getElementById('bulkSend');
        const stopBtn = document.getElementById('stopBulk');
        const progressContainer = document.querySelector('.bulk-progress');

        if (active) {
            bulkBtn.classList.add('loading');
            bulkBtn.querySelector('span').style.display = 'none';
            bulkBtn.querySelector('.btn-loader').style.display = 'block';
            bulkBtn.disabled = true;
            
            stopBtn.classList.remove('hidden');
            progressContainer.classList.remove('hidden');
        } else {
            bulkBtn.classList.remove('loading');
            bulkBtn.querySelector('span').style.display = 'inline';
            bulkBtn.querySelector('.btn-loader').style.display = 'none';
            bulkBtn.disabled = false;
            
            stopBtn.classList.add('hidden');
            
            // Hide progress after a delay
            setTimeout(() => {
                progressContainer.classList.add('hidden');
            }, 3000);
        }
    }

    updateProgress(current, total) {
        const progressFill = document.querySelector('.progress-fill');
        const progressCurrent = document.getElementById('progressCurrent');
        const progressTotal = document.getElementById('progressTotal');

        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressCurrent.textContent = current;
        progressTotal.textContent = total;
    }

    async executeWebhook(url, payload, isTest = false, isBulk = false) {
        const startTime = Date.now();
        
        try {
            // Actually send the webhook to Discord
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                this.addLog({
                    status: 'success',
                    message: isTest ? 'Test webhook executed successfully' : 
                            isBulk ? `Bulk message sent (${this.bulkSending.current}/${this.bulkSending.total})` :
                            'Webhook message sent successfully',
                    timestamp: new Date(),
                    url: this.maskWebhookUrl(url),
                    payload: payload,
                    responseTime: Date.now() - startTime
                });
                
                this.stats.webhooksSent++;
                this.stats.successCount++;
                
                if (!isBulk) {
                    this.showNotification(
                        isTest ? 'Test webhook sent successfully!' : 'Message sent successfully!',
                        'success'
                    );
                }
            } else {
                // Handle Discord API errors
                let errorMessage = 'Unknown error occurred';
                
                if (response.status === 404) {
                    errorMessage = 'Webhook not found - check your URL';
                } else if (response.status === 400) {
                    errorMessage = 'Bad request - check your message content';
                } else if (response.status === 429) {
                    errorMessage = 'Rate limited - please wait before sending again';
                } else if (response.status === 401) {
                    errorMessage = 'Unauthorized - webhook URL may be invalid';
                } else {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                
                throw new Error(errorMessage);
            }
            
        } catch (error) {
            let errorMsg = error.message;
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMsg = 'Network error - check your internet connection';
            }
            
            this.addLog({
                status: 'error',
                message: `Webhook failed: ${errorMsg}`,
                timestamp: new Date(),
                url: this.maskWebhookUrl(url),
                payload: payload,
                responseTime: Date.now() - startTime
            });
            
            this.stats.webhooksSent++;
            this.stats.failedCount++;
            
            if (!isBulk) {
                this.showNotification(`Failed to send webhook: ${errorMsg}`, 'error');
            }
        }
        
        this.updateStats();
        this.saveStats();
    }

    validateWebhookUrl(url) {
        const webhookRegex = /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/;
        return webhookRegex.test(url);
    }

    maskWebhookUrl(url) {
        return url.replace(/\/[\w-]+$/, '/***');
    }

    loadPreset(e) {
        const presetType = e.currentTarget.dataset.preset;
        const presets = {
            announcement: {
                message: '📢 **Important Announcement**\n\n@everyone',
                username: 'Announcement Bot',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
            },
            welcome: {
                message: '👋 **Welcome to the server!**\n\nWe\'re excited to have you here. Please read the rules and enjoy your stay!',
                username: 'Welcome Bot',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
            },
            alert: {
                message: '⚠️ **System Alert**\n\nThis is an important system notification that requires attention.',
                username: 'Alert System',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
            },
            celebration: {
                message: '🎉 **Celebration Time!**\n\nLet\'s celebrate this amazing achievement together!',
                username: 'Party Bot',
                avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
            }
        };

        const preset = presets[presetType];
        if (preset) {
            document.getElementById('webhookMessage').value = preset.message;
            document.getElementById('webhookUsername').value = preset.username;
            document.getElementById('webhookAvatar').value = preset.avatar;
            
            this.showNotification(`Loaded ${presetType} preset`, 'success');
        }
    }

    addLog(logData) {
        this.logs.unshift(logData);
        
        // Keep only last 50 logs
        if (this.logs.length > 50) {
            this.logs = this.logs.slice(0, 50);
        }
        
        this.updateLogDisplay();
        this.saveLogs();
    }

    updateLogDisplay() {
        const logsList = document.getElementById('logsList');
        
        if (this.logs.length === 0) {
            logsList.innerHTML = `
                <div class="log-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <path d="M14 2v6h6"/>
                    </svg>
                    <p>No logs yet</p>
                    <span>Send a webhook to see logs here</span>
                </div>
            `;
            return;
        }

        logsList.innerHTML = this.logs.map(log => `
            <div class="log-item ${log.status}">
                <div class="log-header">
                    <div class="log-status ${log.status}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            ${log.status === 'success' 
                                ? '<polyline points="20,6 9,17 4,12"/>' 
                                : '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>'
                            }
                        </svg>
                        ${log.status === 'success' ? 'Success' : 'Failed'}
                    </div>
                    <div class="log-time">${this.formatTime(log.timestamp)}</div>
                </div>
                <div class="log-message">${log.message}</div>
                <div class="log-details">
                    <small>URL: ${log.url} | Response: ${log.responseTime}ms</small>
                </div>
            </div>
        `).join('');
    }

    clearLogs() {
        this.logs = [];
        this.updateLogDisplay();
        this.saveLogs();
        this.showNotification('Logs cleared successfully', 'success');
    }

    updateStats() {
        document.getElementById('totalLogs').textContent = this.stats.webhooksSent;
        document.getElementById('successLogs').textContent = this.stats.successCount;
        document.getElementById('failedLogs').textContent = this.stats.failedCount;
        document.getElementById('webhooksSent').textContent = this.stats.webhooksSent;
        
        const successRate = this.stats.webhooksSent > 0 
            ? Math.round((this.stats.successCount / this.stats.webhooksSent) * 100)
            : 100;
        document.getElementById('successRate').textContent = `${successRate}%`;
        
        document.getElementById('lastActive').textContent = 'Just now';
    }

    showNotification(message, type = 'success') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '<polyline points="20,6 9,17 4,12"/>',
            error: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
            warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'
        };
        
        notification.innerHTML = `
            <div class="notification-content">
                <svg class="notification-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[type]}
                </svg>
                <div class="notification-text">
                    <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <div class="notification-message">${message}</div>
                </div>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    logout() {
        // Stop any active bulk sending
        this.stopBulkSend();
        
        this.currentUser = null;
        document.getElementById('loginScreen').classList.remove('hidden');
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('userIdInput').value = '';
        this.showNotification('Logged out successfully', 'success');
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Local Storage Methods
    saveSettings() {
        const settings = {
            autoSave: document.getElementById('autoSave').checked,
            notifications: document.getElementById('notifications').checked,
            darkMode: document.getElementById('darkMode').checked
        };
        localStorage.setItem('webhookManagerSettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('webhookManagerSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            document.getElementById('autoSave').checked = settings.autoSave ?? true;
            document.getElementById('notifications').checked = settings.notifications ?? true;
            document.getElementById('darkMode').checked = settings.darkMode ?? true;
        }
    }

    saveLogs() {
        localStorage.setItem('webhookManagerLogs', JSON.stringify(this.logs));
    }

    loadLogs() {
        const saved = localStorage.getItem('webhookManagerLogs');
        if (saved) {
            this.logs = JSON.parse(saved).map(log => ({
                ...log,
                timestamp: new Date(log.timestamp)
            }));
            this.updateLogDisplay();
        }
    }

    saveStats() {
        localStorage.setItem('webhookManagerStats', JSON.stringify(this.stats));
    }

    loadStats() {
        const saved = localStorage.getItem('webhookManagerStats');
        if (saved) {
            this.stats = { ...this.stats, ...JSON.parse(saved) };
            this.updateStats();
        }
    }
}

// Add CSS animation for slide out
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new DiscordWebhookManager();
    app.loadLogs();
    app.loadStats();
});