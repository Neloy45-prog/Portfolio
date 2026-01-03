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

// Build nav links. If a section with the same id exists on the current page,
// link to the in-page hash (single-page behaviour). Otherwise link to
// separate page files (index.html for home).
const navList = document.getElementById('navList');
if(navList){
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  menuItems.forEach(item=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    // Prefer in-page hash links when the section exists on this page
    const sec = document.getElementById(item.id);
    const href = sec ? '#' + item.id : (item.id === 'home' ? 'index.html' : item.id + '.html');
    a.href = href;
    a.textContent = item.label;
    // mark active: if linking to hash, match location.hash; otherwise match filename
    if(href.startsWith('#')){
      if(location.hash === href || (!location.hash && item.id === 'home')) a.classList.add('active');
    } else {
      if(currentFile === href || (currentFile === '' && href === 'index.html')) a.classList.add('active');
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
  const loadedSections = {};

  async function loadSectionFromFile(id){
    if(loadedSections[id]) return;
    try{
      const res = await fetch(id + '.html');
      if(!res.ok) return;
      const txt = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(txt, 'text/html');
      const srcSec = doc.getElementById(id);
      const target = document.getElementById(id);
      if(srcSec && target){
        target.innerHTML = srcSec.innerHTML;
        // copy classes/attributes if needed
        target.className = srcSec.className;
        loadedSections[id] = true;
      }
    }catch(err){
      console.error('Error loading section', id, err);
    }
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const id = entry.target.id;
      const link = document.querySelector('#navList a[href="' + (id === 'home' ? 'index.html' : id + '.html') + '"]');
      const altLink = document.querySelector('#navList a[href="#'+id+'"]');
      if(link || altLink){
        if(entry.isIntersecting){
          // load content for this section when it becomes visible
          (async ()=>{
            await loadSectionFromFile(id);
            document.querySelectorAll('#navList a').forEach(el=>el.classList.remove('active'));
            (link || altLink).classList.add('active');
          })();
        }
      }
    });
  }, obsOptions);
  Object.values(sections).forEach(s=>observer.observe(s));
}

// Immediately highlight clicked nav item so user sees feedback while scrolling
document.querySelectorAll('#navList a').forEach(a=>{
  a.addEventListener('click', async (e)=>{
    const href = a.getAttribute('href');
    // immediate visual feedback
    document.querySelectorAll('#navList a').forEach(el=>el.classList.remove('active'));
    a.classList.add('active');

    // If this is an in-page link, load the section HTML first and then scroll
    if(href && href.startsWith('#')){
      e.preventDefault();
      const id = href.slice(1);
      // load content then scroll into view
      if(typeof loadSectionFromFile === 'function') await loadSectionFromFile(id);
      const target = document.getElementById(id);
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }
    // otherwise let the browser navigate to the page (external page links)
  });
});
