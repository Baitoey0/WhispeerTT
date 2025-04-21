document.addEventListener('DOMContentLoaded', () => {
  const pages = {
    home: document.getElementById('home-page'),
    login: document.getElementById('login-page'),
    feed: document.getElementById('feed-page'),
    profile: document.getElementById('profile-page'),
    search: document.getElementById('search-page'),
    anonSend: document.getElementById('anon-send-page')
  };

  const messagesContainer = pages.feed.querySelector('.messages');
  let selectedAvatarColor = '#c3e7f8';

  function showPage(name) {
    Object.values(pages).forEach(p => p.style.display = 'none');
    pages[name].style.display = 'block';
    if (name === 'feed' || name === 'profile') updateAvatarDisplay();
    if (name === 'feed') loadMessages();
  }

  function updateAvatarDisplay() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentUser = localStorage.getItem('currentUser');
    const user = users[currentUser] || {};

    document.querySelectorAll('.avatar').forEach(a => a.style.background = user.avatarColor || '#000');
    document.querySelector('.avatar-large').style.background = user.avatarColor || '#000';
    document.querySelectorAll('.username').forEach(el => el.textContent = currentUser || 'username');
  }

  function loadMessages() {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const currentUser = localStorage.getItem('currentUser');
    const user = users[currentUser] || {};
    const messages = user.messages || [];

    messagesContainer.innerHTML = ''; // clear
    messages.forEach(msg => addMessageToFeed(msg));
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    })[match]);
  }

  function addMessageToFeed(text) {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.innerHTML = `
      <p class="message-text">${escapeHTML(text)}</p>
      <div class="actions">
        <button class="heart-btn"><i class="fas fa-heart"></i> Reply</button>
        <button class="pin-btn">📌 Pin</button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
      <div class="replies-container" style="margin-top: 10px;"></div>
      <div class="reply-input-container" style="display: none;">
        <input type="text" class="reply-input" placeholder="Type a reply...">
        <button class="send-reply-btn">Send Reply</button>
      </div>
    `;
    messagesContainer.prepend(card);
    addCardActions(card);
  }

  function addCardActions(card) {
    // Toggle heart button for liking
    card.querySelector('.heart-btn').addEventListener('click', function () {
      this.classList.toggle('active');
      const replyContainer = card.querySelector('.reply-input-container');
      replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Pin a message
    card.querySelector('.pin-btn').addEventListener('click', function () {
      const isPinned = card.classList.toggle('pinned');
      const parent = card.parentElement;
      if (isPinned) {
        const firstPinned = parent.querySelector('.message-card.pinned');
        parent.insertBefore(card, firstPinned || parent.firstChild);
      } else {
        const pinnedCards = parent.querySelectorAll('.message-card.pinned');
        parent.insertBefore(card, pinnedCards[pinnedCards.length - 1]?.nextSibling || null);
      }
    });

    // Delete a message
    card.querySelector('.delete-btn').addEventListener('click', function () {
      card.style.opacity = '0.5';
      setTimeout(() => card.remove(), 400);
    });

    // Reply action
    card.querySelector('.send-reply-btn').addEventListener('click', function () {
      const replyInput = card.querySelector('.reply-input');
      const replyText = replyInput.value.trim();

      if (replyText === '') return;

      // Create and append the reply as a message underneath the main message
      const replyContainer = card.querySelector('.replies-container');
      const replyMessage = document.createElement('div');
      replyMessage.className = 'reply-message';
      replyMessage.textContent = `Reply: ${escapeHTML(replyText)}`;
      replyContainer.appendChild(replyMessage);

      // Clear the reply input field
      replyInput.value = '';
      alert('Reply added!');
    });
  }

  // Avatar picker
  document.querySelectorAll('.avatar-choice').forEach(choice => {
    choice.addEventListener('click', () => {
      document.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
      selectedAvatarColor = choice.dataset.color;
    });
  });

  // Login
  document.getElementById('go-login').addEventListener('click', () => {
    showPage('login');
  });

  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password')?.value.trim(); // เช็คว่ามี input password ไหม
    if (!username || !password) return alert('Please enter both username and password');

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    // ถ้ามี user เดิม ต้องตรวจรหัสผ่าน
    if (users[username]) {
      if (users[username].password !== password) {
        return alert('Incorrect password!');
      }
    } else {
      // ถ้าเป็น user ใหม่
      users[username] = {
        password: password,
        avatarColor: selectedAvatarColor,
        messages: []
      };
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', username);
    updateAvatarDisplay();
    showPage('feed');
  });

  document.getElementById('back-home').addEventListener('click', () => {
    showPage('home');
  });

  document.getElementById('go-profile').addEventListener('click', () => {
    showPage('profile');
  });

  document.getElementById('back-feed').addEventListener('click', () => {
    showPage('feed');
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    document.getElementById('username').value = '';
    if (document.getElementById('password')) {
      document.getElementById('password').value = '';
    }
    showPage('home');
    alert('Logged out successfully!');
  });

  document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const msg = input.value.trim();
    if (msg === '') return;

    const users = JSON.parse(localStorage.getItem('users'));
    const currentUser = localStorage.getItem('currentUser');

    users[currentUser].messages.unshift(msg);
    localStorage.setItem('users', JSON.stringify(users));

    input.value = '';
    alert('Message sent!');
    showPage('feed');
    loadMessages();
  });

  // การโหลดข้อมูลอัตโนมัติเมื่อมีการล็อกอิน
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    updateAvatarDisplay();
    showPage('feed');
    loadMessages();
  }

  // เปิดหน้าเสิร์ช
  document.getElementById('go-search').addEventListener('click', () => {
    showPage('search');
  });

  // การกลับไปหน้า Home จากหน้า Search
  document.getElementById('back-home-from-search').addEventListener('click', () => {
    showPage('home');
  });

  // การค้นหาผู้ใช้
  document.getElementById('search-btn').addEventListener('click', () => {
    const input = document.getElementById('search-username').value.trim();
    if (!input) return alert('Please enter a username');

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[input]) {
      alert('User not found');
      return;
    }

    showAnonymousSendPage(input); // เรียกฟังก์ชันแสดงหน้าส่งข้อความนิรนาม
  });

  function showAnonymousSendPage(targetUser) {
    // ซ่อนทุกหน้าก่อน
    Object.values(pages).forEach(p => p.style.display = 'none');
    document.getElementById('target-username').textContent = targetUser;
    document.getElementById('anon-send-page').style.display = 'block';

    // การส่งข้อความนิรนาม
    document.getElementById('anon-send-btn').onclick = () => {
      const msg = document.getElementById('anon-message').value.trim();
      if (!msg) return alert('Message cannot be empty');

      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (!users[targetUser]) {
        alert('User does not exist!');
        return;
      }

      users[targetUser].messages.unshift(msg);
      localStorage.setItem('users', JSON.stringify(users));

      alert('Message sent anonymously to ' + targetUser);
      document.getElementById('anon-message').value = ''; // เคลียร์ข้อความ
    };
  }
});
