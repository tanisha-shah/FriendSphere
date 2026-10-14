const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, 'data', 'users.json');
let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));

users.forEach(user => {
  const nameParts = user.name.split(' ');
  let initials = nameParts[0][0];
  if (nameParts.length > 1) {
    initials += nameParts[nameParts.length - 1][0];
  }
  user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff`;
});

fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8');
console.log('User avatars updated.');

const communitiesPath = path.join(__dirname, 'data', 'communities.json');
if (fs.existsSync(communitiesPath)) {
  let communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf8'));
  communities.forEach(c => {
    c.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random&color=fff`;
  });
  fs.writeFileSync(communitiesPath, JSON.stringify(communities, null, 2), 'utf8');
  console.log('Community avatars updated.');
}
