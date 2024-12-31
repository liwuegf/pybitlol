function formatDiscordId(id) {
    return id ? id : 'Not provided';
}

function formatEmail(email) {
    return email ? email : 'Not provided';
}

function formatUsername(username) {
    return username ? username : 'Anonymous User';
}

function formatAvatar(avatar) {
    return avatar ? avatar : 'https://cdn.discordapp.com/embed/avatars/0.png';
}

export function createLogHTML(data) {
    const avatar = formatAvatar(data.avatar);
    const username = formatUsername(data.username);
    const discordId = formatDiscordId(data.discord_id);
    const email = formatEmail(data.email);
    const ip = data.ip || 'Not provided';

    return `
        <div class="user-info">
            <div class="user-header">
                <img src="${avatar}" alt="User Avatar" class="avatar">
                <div>
                    <div class="user-name">${username}</div>
                    <div class="user-id">${discordId}</div>
                </div>
            </div>
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Email</div>
                    <div class="info-value">${email}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">IP Address</div>
                    <div class="info-value">${ip}</div>
                </div>
                ${Object.entries(data)
                    .filter(([key]) => !['avatar', 'username', 'discord_id', 'email', 'ip'].includes(key))
                    .map(([key, value]) => `
                        <div class="info-item">
                            <div class="info-label">${key}</div>
                            <div class="info-value">${value}</div>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}