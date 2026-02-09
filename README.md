![characters](https://github.com/user-attachments/assets/5152285b-3569-4752-a986-5e41777558df)
let xp = 0;
let currentSkill = null;

document.querySelectorAll('.skill').forEach(skill => {
  skill.addEventListener('click', () => {
    if (skill.classList.contains('locked')) return;
    currentSkill = skill;
    document.getElementById('skillVideo').src = skill.dataset.video;
    document.getElementById('videoModal').style.display = 'block';
  });
});

function closeModal() {
  document.getElementById('videoModal').style.display = 'none';
  document.getElementById('skillVideo').src = '';
}

function completeSkill() {
  xp += parseInt(currentSkill.dataset.xp);
  document.getElementById('xp').innerText = "XP: " + xp;

  currentSkill.classList.remove('unlocked');
  currentSkill.classList.add('locked');

  let next = currentSkill.nextElementSibling;
  if (next) {
    next.classList.remove('locked');
    next.classList.add('unlocked');
  }

  document.getElementById('celebration').style.display = 'block';
  setTimeout(() => {
    document.getElementById('celebration').style.display = 'none';
  }, 2500);

  closeModal();
}
