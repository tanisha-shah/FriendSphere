const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'data', 'users.json');

if (fs.existsSync(usersPath)) {
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

  users.forEach((user) => {
    if (user.id === 1) {
      // Tanisha Shah: Initials with high contrast matching theme
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=397B69&color=FAFCFA`;
    } else {
      const rand = Math.random();
      if (rand < 0.35) {
        // Real picture (pravatar is reliable and provides human faces based on ID to be consistent)
        user.avatar = `https://i.pravatar.cc/150?u=${user.id + 1000}`; // offset ID to get good faces
      } else if (rand < 0.70) {
        // Initials (soft sage and seafoam theme)
        user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=DCEBE1&color=285448`;
      } else {
        // Generic blank profile picture (Instagram style)
        // We use a high quality default SVG or generic gravatar
        user.avatar = `https://www.gravatar.com/avatar/${user.id}?d=mp&f=y`; 
      }
    }
  });

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
  console.log('Successfully randomized user avatars!');
} else {
  console.log('users.json not found');
}
