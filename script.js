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

    messagesContainer.innerHTML = '';
    messages.forEach((msg, index) => addMessageToFeed(msg, index));
  }

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    })[match]);
  }

  function addMessageToFeed(msgObj, index) {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.index = index;

    card.innerHTML = `
      <p class="message-text">${escapeHTML(msgObj.text)}</p>
      <div class="actions">
        <button class="heart-btn"><i class="fas fa-heart"></i> Reply</button>
        <button class="pin-btn">📌 Pin</button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
      <div class="replies-container" style="margin-top: 10px;">
        ${msgObj.replies.map(reply => `<div class="reply-message">Reply: ${escapeHTML(reply)}</div>`).join('')}
      </div>
      <div class="reply-input-container" style="display: none;">
        <input type="text" class="reply-input" placeholder="Type a reply...">
        <button class="send-reply-btn">Send Reply</button>
      </div>
    `;
    messagesContainer.prepend(card);
    addCardActions(card);
  }

  function addCardActions(card) {
    // Like (toggle reply input)
    card.querySelector('.heart-btn').addEventListener('click', function () {
      this.classList.toggle('active');
      const replyContainer = card.querySelector('.reply-input-container');
      replyContainer.style.display = replyContainer.style.display === 'none' ? 'block' : 'none';
    });

    // Pin
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

    // Delete
    card.querySelector('.delete-btn').addEventListener('click', function () {
      const index = parseInt(card.dataset.index);
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const currentUser = localStorage.getItem('currentUser');

      users[currentUser].messages.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(users));

      card.style.opacity = '0.5';
      setTimeout(() => card.remove(), 400);
    });

    // Reply
    card.querySelector('.send-reply-btn').addEventListener('click', function () {
      const replyInput = card.querySelector('.reply-input');
      const replyText = replyInput.value.trim();
      if (replyText === '') return;

      const index = parseInt(card.dataset.index);
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const currentUser = localStorage.getItem('currentUser');

      users[currentUser].messages[index].replies.push(replyText);
      localStorage.setItem('users', JSON.stringify(users));

      const replyContainer = card.querySelector('.replies-container');
      const replyMessage = document.createElement('div');
      replyMessage.className = 'reply-message';
      replyMessage.textContent = `Reply: ${replyText}`;
      replyContainer.appendChild(replyMessage);

      replyInput.value = '';
      alert('Reply added!');
    });
  }

  document.querySelectorAll('.avatar-choice').forEach(choice => {
    choice.addEventListener('click', () => {
      document.querySelectorAll('.avatar-choice').forEach(c => c.classList.remove('selected'));
      choice.classList.add('selected');
      selectedAvatarColor = choice.dataset.color;
    });
  });

  document.getElementById('go-login').addEventListener('click', () => showPage('login'));

  document.getElementById('login-btn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password')?.value.trim();
    if (!username || !password) return alert('Please enter both username and password');

    const users = JSON.parse(localStorage.getItem('users') || '{}');

    if (users[username]) {
      if (users[username].password !== password) return alert('Incorrect password!');
    } else {
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

  document.getElementById('back-home').addEventListener('click', () => showPage('home'));
  document.getElementById('go-profile').addEventListener('click', () => showPage('profile'));
  document.getElementById('back-feed').addEventListener('click', () => showPage('feed'));
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

    users[currentUser].messages.unshift({
      text: msg,
      replies: []
    });

    localStorage.setItem('users', JSON.stringify(users));
    input.value = '';
    alert('Message sent!');
    showPage('feed');
    loadMessages();
  });

  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
    updateAvatarDisplay();
    showPage('feed');
    loadMessages();
  }

  document.getElementById('go-search').addEventListener('click', () => showPage('search'));

  document.getElementById('back-home-from-search').addEventListener('click', () => showPage('home'));

  document.getElementById('search-btn').addEventListener('click', () => {
    const input = document.getElementById('search-username').value.trim();
    if (!input) return alert('Please enter a username');

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[input]) {
      alert('User not found');
      return;
    }

    showAnonymousSendPage(input);
  });

  function showAnonymousSendPage(targetUser) {
    Object.values(pages).forEach(p => p.style.display = 'none');
    document.getElementById('target-username').textContent = targetUser;
    document.getElementById('anon-send-page').style.display = 'block';

    document.getElementById('anon-send-btn').onclick = () => {
      const msg = document.getElementById('anon-message').value.trim();
      if (!msg) return alert('Message cannot be empty');

      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (!users[targetUser]) {
        alert('User does not exist!');
        return;
      }

      users[targetUser].messages.unshift({
        text: msg,
        replies: []
      });

      localStorage.setItem('users', JSON.stringify(users));

      alert('Message sent anonymously to ' + targetUser);
      document.getElementById('anon-message').value = '';
    };
  }

  // 🔙 ปุ่มกลับจากหน้า anonymous ส่งข้อความ
  document.getElementById('back-from-anon-send').addEventListener('click', () => {
    showPage('search');
  });
});
