(() => {
  const data = window.MANGA_DATA || [];
  const genres = [...new Set(data.flatMap(m => m.genres || []))].sort((a,b)=>a.localeCompare(b));
  const app = document.getElementById('app');
  const esc = s => String(s ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const date = s => new Date(s).toLocaleDateString('vi-VN');
  const icon = (name, size=18) => ({
    search:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>`,
    sun:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
    moon:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z"/></svg>`,
    left:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>`,
    right:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>`,
    x:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>`,
    book:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>`,
    list:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    rows:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>`,
    monitor:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8m-4-3v3"/></svg>`,
    max:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/></svg>`,
    heart:`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.5"><path d="M20.8 8.7c0 5.4-8.8 10.2-8.8 10.2S3.2 14.1 3.2 8.7A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z"/></svg>`
  }[name] || '');

  const path = () => location.hash.slice(1) || '/';
  const go = p => { location.hash = p; };
  const route = () => {
    const raw = path().split('?');
    const parts = raw[0].replace(/^\/+|\/+$/g,'').split('/').filter(Boolean);
    const query = new URLSearchParams(raw[1] || '');
    return {parts, query};
  };
  const mangaBySlug = slug => data.find(m => m.slug === slug);
  const search = q => { q=q.trim().toLowerCase(); return q ? data.filter(m => `${m.title} ${m.author} ${(m.genres||[]).join(' ')}`.toLowerCase().includes(q)) : []; };
  const latest = m => (m.chapters||[]).slice().sort((a,b)=>b.chapterNumber-a.chapterNumber)[0];

  function header() {
    const dark = document.documentElement.dataset.theme === 'dark';
    return `<header class="site-header"><div class="header-inner">
      <a href="#/" class="brand">Manga <span>AG</span></a>
      <div class="search-wrap"><form class="search-box" id="searchForm">${icon('search',19)}<input id="searchInput" placeholder="Tìm kiếm truyện..." autocomplete="off"><button type="submit" class="search-submit">${icon('search',17)}</button></form><div id="suggestions" class="suggestions" hidden></div></div>
      <button class="theme-btn" id="themeBtn">${dark?icon('sun',17):icon('moon',17)} <span>${dark?'Sáng':'Tối'}</span></button>
    </div></header>`;
  }
  function card(m) { const l=latest(m); return `<a class="manga-card" href="#/manga/${encodeURIComponent(m.slug)}"><div class="cover-wrap"><img loading="lazy" src="${esc(m.cover)}" alt="Bìa ${esc(m.title)}"><span class="status-badge ${m.status}">${m.status==='ongoing'?'Đang cập nhật':'Hoàn thành'}</span></div><div class="card-body"><h3>${esc(m.title)}</h3><div class="card-meta"><span>Chap ${l?.chapterNumber ?? '-'}</span><span>${date(m.updatedAt)}</span></div></div></a>`; }
  function featured(items) {
    if(!items.length) return '';
    let idx=0, timer;
    const render = () => `<section class="featured-section"><div class="section-heading"><div><p class="eyebrow">Đề xuất cho bạn</p><h2>Truyện nổi bật</h2></div><div class="carousel-actions"><button class="icon-btn" id="prevFeat">${icon('left')}</button><button class="icon-btn" id="nextFeat">${icon('right')}</button></div></div><div class="featured-card" id="featuredCard"><div class="featured-track" id="featuredTrack">${slide(items[idx],'featured-slide-current')}</div></div><div class="carousel-dots">${items.map((m,i)=>`<button class="${i===idx?'active':''}" data-dot="${i}" aria-label="${esc(m.title)}">${icon('heart',15)}</button>`).join('')}</div></section>`;
    const slide=(m,cl)=>`<article class="featured-slide ${cl}"><img src="${esc(m.cover)}" alt="Bìa ${esc(m.title)}"><div class="featured-overlay"><span class="pill">FEATURED</span><h3>${esc(m.title)}</h3><p>${esc(m.summary)}</p><div class="featured-meta"><span>${esc(m.author)}</span><span>•</span><span>${m.status==='ongoing'?'Đang cập nhật':'Hoàn thành'}</span></div><a href="#/manga/${encodeURIComponent(m.slug)}" class="primary-btn">Đọc truyện →</a></div></article>`;
    setTimeout(()=>{
      const cardEl=document.getElementById('featuredCard');
      const track=document.getElementById('featuredTrack');
      const change=(next,dir)=>{
        if(items.length<2 || cardEl.classList.contains('is-sliding') || next===idx) return;
        const incoming=slide(items[next],`featured-slide-incoming ${dir>0?'from-right':'from-left'}`);
        track.insertAdjacentHTML('beforeend',incoming);
        cardEl.classList.add('is-sliding',`direction-${dir>0?'next':'prev'}`);
        setTimeout(()=>{idx=next; track.innerHTML=slide(items[idx],'featured-slide-current'); cardEl.className='featured-card'; document.querySelectorAll('[data-dot]').forEach((b,i)=>b.classList.toggle('active',i===idx));},660);
      };
      document.getElementById('prevFeat').onclick=()=>change((idx-1+items.length)%items.length,-1);
      document.getElementById('nextFeat').onclick=()=>change((idx+1)%items.length,1);
      document.querySelectorAll('[data-dot]').forEach((b,i)=>b.onclick=()=>change(i,i>idx?1:-1));
      timer=setInterval(()=>change((idx+1)%items.length,1),5500);
    },0);
    return render();
  }
  function home() {
    let genre='Tất cả', status='Tất cả', page=1;
    const featuredItems=data.filter(m=>m.featured);
    const draw=()=>{
      let filtered=data.filter(m=>(genre==='Tất cả'||m.genres.includes(genre))&&(status==='Tất cả'||(status==='Hoàn thành'&&m.status==='completed')||(status==='Đang cập nhật'&&m.status==='ongoing')||(status==='Hot'&&m.hot)||(status==='Mới cập nhật'&&m.updatedAt>='2026-09-15')));
      const total=Math.max(1,Math.ceil(filtered.length/9)); page=Math.min(page,total);
      const visible=filtered.slice((page-1)*9,page*9);
      app.innerHTML=header()+`<main class="container home">${featured(featuredItems)}<section class="explore"><div class="section-heading compact"><div><p class="eyebrow">Khám phá</p><h2>Thể loại & trạng thái</h2></div><span class="result-count">${filtered.length} truyện</span></div><div class="filter-controls"><button class="secondary-btn genre-toggle" id="genreToggle" aria-haspopup="dialog" aria-controls="genreModal">${icon('list',17)} Thể loại${genre!=='Tất cả'?` <span class="filter-selected">· ${esc(genre)}</span>`:''}</button><div class="filter-row status-row">${['Tất cả','Hoàn thành','Đang cập nhật','Mới cập nhật','Hot'].map(s=>`<button class="filter ${status===s?'active':''}" data-status="${esc(s)}">${s}</button>`).join('')}</div></div>${genre!=='Tất cả'?`<div class="active-filter-note">Đang lọc thể loại: <strong>${esc(genre)}</strong><button class="clear-filter" id="clearGenre">Bỏ lọc</button></div>`:''}</section>${`<div class="genre-modal" id="genreModal" hidden><div class="genre-modal-backdrop" data-close-genre></div><section class="genre-dialog" role="dialog" aria-modal="true" aria-labelledby="genreModalTitle"><div class="genre-dialog-head"><div><p class="eyebrow">Bộ lọc</p><h3 id="genreModalTitle">Thể loại truyện</h3></div><button class="icon-btn" id="closeGenreModal" aria-label="Đóng">${icon('x',20)}</button></div><div class="genre-modal-list"><button class="filter ${genre==='Tất cả'?'active':''}" data-genre="Tất cả">Tất cả</button>${genres.map(g=>`<button class="filter ${genre===g?'active':''}" data-genre="${esc(g)}">${esc(g)}</button>`).join('')}</div></section></div>`}<section class="manga-section"><div class="section-heading compact"><div><p class="eyebrow">Thư viện</p><h2>Tất cả truyện</h2></div></div>${visible.length?`<div class="manga-grid">${visible.map(card).join('')}</div>`:`<div class="empty-state"><h3>Không tìm thấy truyện phù hợp</h3><p>Hãy thử một thể loại hoặc trạng thái khác.</p></div>`}<div class="pagination"><button class="secondary-btn" id="pagePrev" ${page<=1?'disabled':''}>${icon('left',17)} Previous</button><span>Trang <strong>${page}</strong> / ${total}</span><button class="secondary-btn" id="pageNext" ${page>=total?'disabled':''}>Next ${icon('right',17)}</button></div></section></main>`;
      bindHeader();
      document.querySelectorAll('[data-genre]').forEach(b=>b.onclick=()=>{genre=b.dataset.genre;page=1;draw();});
      const genreModal=document.getElementById('genreModal');
      const closeGenre=()=>{if(genreModal){genreModal.hidden=true;document.body.classList.remove('modal-open');}};
      document.getElementById('genreToggle').onclick=()=>{genreModal.hidden=false;document.body.classList.add('modal-open');};
      document.getElementById('closeGenreModal').onclick=closeGenre;
      genreModal.querySelector('[data-close-genre]').onclick=closeGenre;
      if(document.getElementById('clearGenre')) document.getElementById('clearGenre').onclick=()=>{genre='Tất cả';page=1;draw();};
      document.querySelectorAll('[data-status]').forEach(b=>b.onclick=()=>{status=b.dataset.status;page=1;draw();});
      document.getElementById('pagePrev').onclick=()=>{if(page>1){page--;draw();}}; document.getElementById('pageNext').onclick=()=>{if(page<total){page++;draw();}};
    }; draw();
  }
  function bindHeader(){
    const form=document.getElementById('searchForm'), input=document.getElementById('searchInput'), sug=document.getElementById('suggestions');
    if(!form)return;
    input.oninput=()=>{const r=search(input.value).slice(0,4); sug.innerHTML=r.map(m=>`<a class="suggestion" href="#/manga/${encodeURIComponent(m.slug)}"><img src="${esc(m.cover)}"><span><strong>${esc(m.title)}</strong><small>${m.status==='ongoing'?'Đang cập nhật':'Hoàn thành'}</small></span></a>`).join(''); sug.hidden=!r.length;};
    form.onsubmit=e=>{e.preventDefault(); const q=input.value.trim(); if(q)go('/search?q='+encodeURIComponent(q));};
    document.getElementById('themeBtn').onclick=()=>{const dark=document.documentElement.dataset.theme==='dark'; document.documentElement.dataset.theme=dark?'light':'dark'; localStorage.setItem('manga-ag-theme',dark?'light':'dark'); render();};
    document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap')){const s=document.getElementById('suggestions');if(s)s.hidden=true;}},{once:true});
  }
  function detail(slug){ const m=mangaBySlug(slug); if(!m){app.innerHTML=header()+`<main class="container empty-state"><h2>Không tìm thấy truyện</h2><a class="secondary-btn" href="#/">${icon('left',16)} Quay lại</a></main>`;bindHeader();return;} const latestC=latest(m); let desc=true; const draw=()=>{const ch=[...m.chapters].sort((a,b)=>desc?b.chapterNumber-a.chapterNumber:a.chapterNumber-b.chapterNumber); app.innerHTML=header()+`<main class="container page"><a href="#/" class="back-link">${icon('left',16)} Quay lại thư viện</a><section class="detail-card"><img class="detail-cover" src="${esc(m.cover)}" alt="Bìa ${esc(m.title)}"><div class="detail-info"><span class="detail-status ${m.status}">● ${m.status==='ongoing'?'Đang cập nhật':'Đã hoàn thành'}</span><h1>${esc(m.title)}</h1><p class="detail-author">Tác giả: <strong>${esc(m.author)}</strong></p><div class="tag-list">${m.genres.map(g=>`<span>${esc(g)}</span>`).join('')}</div><div class="summary"><h3>Summary</h3><p>${esc(m.summary)}</p></div>${latestC?`<a class="primary-btn detail-read" href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(latestC.slug)}">${icon('book',18)} Đọc chapter mới nhất</a>`:''}</div></section><section class="chapters-section"><div class="section-heading compact"><div><p class="eyebrow">Danh sách</p><h2>Chapter</h2></div><button class="secondary-btn" id="sortCh">↕ ${desc?'Mới nhất trước':'Cũ nhất trước'}</button></div><div class="chapter-list">${ch.map(c=>`<a class="chapter-row" href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(c.slug)}"><span class="chapter-icon">${icon('book',17)}</span><span><strong>Chapter ${String(c.chapterNumber).padStart(2,'0')}</strong>${c.title?`<small>${esc(c.title)}</small>`:''}</span><time>${date(c.createdAt)}</time></a>`).join('')}</div></section></main>`;bindHeader();document.getElementById('sortCh').onclick=()=>{desc=!desc;draw();};};draw(); }
  function searchPage(q){ const r=search(q); app.innerHTML=header()+`<main class="container page"><div class="page-title"><p class="eyebrow">Tìm kiếm</p><h1>Kết quả cho “${esc(q)}”</h1><span>${r.length} truyện</span></div>${r.length?`<div class="manga-grid">${r.map(card).join('')}</div>`:`<div class="empty-state"><h3>Không tìm thấy truyện phù hợp.</h3><p>Thử từ khóa khác nhé.</p></div>`}</main>`;bindHeader();}
  function reader(slug, chSlug){const m=mangaBySlug(slug);const c=m?.chapters.find(x=>x.slug===chSlug);if(!m||!c){app.innerHTML='<div class="reader-loading">Không tìm thấy chapter.</div>';return;} let mode=localStorage.getItem('manga-ag-reader-mode')||'vertical', page=0, menu=false; const idx=m.chapters.findIndex(x=>x.id===c.id), prev=idx>0?m.chapters[idx-1]:null,next=idx<m.chapters.length-1?m.chapters[idx+1]:null; const draw=()=>{const current=c.pages[page]; app.innerHTML=`<div class="reader-shell"><div class="reader-topbar"><button class="reader-brand" id="closeReader">Manga <span>AG</span></button><div class="reader-title">Chapter ${String(c.chapterNumber).padStart(2,'0')}${c.title?' — '+esc(c.title):''}</div><div class="reader-tools"><div class="mode-picker"><button class="${mode==='vertical'?'active':''}" data-mode="vertical">${icon('rows',17)}<span>Dọc</span></button><button class="${mode==='single'?'active':''}" data-mode="single">${icon('monitor',17)}<span>Một trang</span></button><button class="${mode==='book'?'active':''}" data-mode="book">${icon('book',17)}<span>Lật trang</span></button></div><button class="icon-btn reader-icon" id="openMenu">${icon('list')}</button></div></div><main class="reader-content mode-${mode}">${mode==='vertical'?c.pages.map(p=>`<img src="${esc(p.imageUrl)}" alt="Trang ${p.pageNumber}" loading="lazy">`).join():`<div class="single-reader"><button class="page-arrow left" id="pagePrev">${icon('left',28)}</button><img src="${esc(current.imageUrl)}" alt="Trang ${current.pageNumber}"><button class="page-arrow right" id="pageNext">${icon('right',28)}</button></div>`}</main>${mode!=='vertical'?`<div class="reader-counter">Page ${page+1} / ${c.pages.length}</div>`:''}<div class="reader-bottom">${prev?`<a href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(prev.slug)}">← Chapter trước</a>`:'<span></span>'}<button id="bottomMenu">${icon('list',16)} Danh sách chapter</button>${next?`<a href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(next.slug)}">Chapter sau →</a>`:'<span></span>'}</div>${next?`<div class="next-chapter-card"><div><small>Tiếp theo</small><h3>Chapter ${String(next.chapterNumber).padStart(2,'0')}</h3></div><a class="primary-btn" href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(next.slug)}">Đọc tiếp →</a></div>`:''}${menu?drawer(m,c):''}</div>`; document.getElementById('closeReader').onclick=()=>go('/manga/'+encodeURIComponent(m.slug)); document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;localStorage.setItem('manga-ag-reader-mode',mode);page=0;draw();}); const pm=document.getElementById('pagePrev'),pn=document.getElementById('pageNext');if(pm)pm.onclick=()=>{page=Math.max(0,page-1);draw();};if(pn)pn.onclick=()=>{page=Math.min(c.pages.length-1,page+1);draw();};document.getElementById('openMenu').onclick=()=>{menu=true;draw();};document.getElementById('bottomMenu').onclick=()=>{menu=true;draw();};document.onkeydown=e=>{if(mode==='single'||mode==='book'){if(e.key==='ArrowLeft'){page=Math.max(0,page-1);draw();}if(e.key==='ArrowRight'){page=Math.min(c.pages.length-1,page+1);draw();}}if(e.key==='Escape'&&menu){menu=false;draw();}};}; const drawer=(m,c)=>`<div class="drawer-backdrop" id="drawerBackdrop"><aside class="chapter-drawer"><div class="drawer-head"><div><small>${esc(m.title)}</small><h3>Danh sách chapter</h3></div><button class="icon-btn" id="closeDrawer">${icon('x')}</button></div><div class="drawer-list">${[...m.chapters].sort((a,b)=>b.chapterNumber-a.chapterNumber).map(x=>`<a class="${x.id===c.id?'current':''}" href="#/read/${encodeURIComponent(m.slug)}/${encodeURIComponent(x.slug)}"><strong>Chapter ${String(x.chapterNumber).padStart(2,'0')}</strong>${x.title?`<small>${esc(x.title)}</small>`:''}</a>`).join('')}</div></aside></div>`; draw(); setTimeout(()=>{const bd=document.getElementById('drawerBackdrop'),cl=document.getElementById('closeDrawer');if(bd)bd.onclick=e=>{if(e.target===bd){menu=false;draw();}};if(cl)cl.onclick=()=>{menu=false;draw();};},0); }
  function render(){ const t=localStorage.getItem('manga-ag-theme')||'light';document.documentElement.dataset.theme=t;const r=route();if(r.parts[0]==='manga'&&r.parts[1])detail(decodeURIComponent(r.parts[1]));else if(r.parts[0]==='read'&&r.parts[1]&&r.parts[2])reader(decodeURIComponent(r.parts[1]),decodeURIComponent(r.parts[2]));else if(r.parts[0]==='search')searchPage(r.query.get('q')||'');else home(); window.scrollTo(0,0); }
  window.addEventListener('hashchange',render); render();
})();
