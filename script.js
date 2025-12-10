const menuItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'publications', label: 'Publications' },
  { id: 'contact', label: 'Contact' },
];

// Build nav links that point to separate page files (index.html for home)
const navList = document.getElementById('navList');
if(navList){
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  menuItems.forEach(item=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    const file = item.id === 'home' ? 'index.html' : item.id + '.html';
    a.href = file;
    a.textContent = item.label;
    // mark active based on current filename
    if(currentFile === file || (currentFile === '' && file === 'index.html')){
      a.classList.add('active');
    }
    li.appendChild(a);
    navList.appendChild(li);
  });
}

// For single-page index.html we may still want to highlight sections when scrolling.
// If the page has in-page sections, set up IntersectionObserver to update active state.
const sections = {};
menuItems.forEach(item=>{
  const sec = document.getElementById(item.id);
  if(sec) sections[item.id] = sec;
});
if(Object.keys(sections).length){
  const obsOptions = {root:null,rootMargin:'-40% 0px -40% 0px',threshold:0};
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector('#navList a[href="' + (id === 'home' ? 'index.html' : id + '.html') + '"]');
      // also accept links that point to anchors on same page
      const altLink = document.querySelector('#navList a[href="#'+id+'"]');
      if(link || altLink){
        if(entry.isIntersecting){
          document.querySelectorAll('#navList a').forEach(el=>el.classList.remove('active'));
          (link || altLink).classList.add('active');
        }
      }
    });
  }, obsOptions);
  Object.values(sections).forEach(s=>observer.observe(s));
}
