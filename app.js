(() => {
  'use strict';
  const D = SiteData, U = SiteUtils, esc = U.escapeHTML;
  const paths = {
    arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
    diagonal: '<path d="M5 19 19 5M5 5h14v14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-13 4h2m4 0h2"/>',
    pin: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    expand: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    audio: '<path d="M4 10v4m4-8v12m4-15v18m4-15v12m4-8v4"/>',
    book: '<path d="M12 5v16M3 4c4-1 7 0 9 1 2-1 5-2 9-1v15c-4-1-7 0-9 2-2-2-5-3-9-2Z"/>'
  };
  const icon = (name, cls = '') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
  const main = document.querySelector('main');
  const detail = document.querySelector('#detail-dialog');
  const searchDialog = document.querySelector('#search-dialog');
  let route = '', artist = 'kys', profileTab = 'intro', scheduleArtist = 'all', scheduleMonth = 'all', fmStatus = 'all', liveArtist = 'all', activeDetail = null, galleryIndex = 0;
  let scheduleLimit = 20;
  let magazineId = '', magazineTab = 'interview';
  const statusLabel = e => ({ upcoming: '即将相见', ongoing: '进行中', past: '已结束' })[U.status(e)];
  const names = id => id === 'both' ? '金允植 & 朴时宇' : D.artists.find(a => a.id === id)?.name || '';
  const dateLabel = e => e.precision === 'month' ? `${e.date.slice(0,4)} 年 ${Number(e.date.slice(5))} 月 · 日期未详` : `${e.date.replaceAll('-', '.')}${e.endDate && e.endDate !== e.date ? ' – ' + e.endDate.slice(5).replace('-', '.') : ''}`;
  const tag = (text, color = '') => `<span class="tag ${color}">${text}</span>`;
  const artistTag = id => tag(id === 'both' ? '双人' : names(id), id === 'kys' ? 'blue' : id === 'psw' ? 'lavender' : 'dual');
  const image = (src, alt, cls = '', eager = false) => `<img src="./${esc(src)}" alt="${esc(alt)}" class="${cls}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
  const sectionHead = (title, chinese, href, action) => `<div class="section-heading"><div><h2>${title}<span class="section-chinese">${chinese}</span></h2></div>${href ? `<a class="text-link" href="${href}">${action || '查看全部'} ${icon('arrow')}</a>` : ''}</div>`;
  const pageHead = (title, chinese, description) => `<header class="page-heading"><div><h1>${title}<span>${chinese}</span></h1><p>${description}</p></div><span class="page-mark" aria-hidden="true">k & p.</span></header>`;
  function toast(message) { const el = document.querySelector('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 3000); }
  function empty(title, text) { return `<div class="empty-state">${icon('book')}<h3>${title}</h3><p>${text}</p></div>`; }
  function mediaCard(item, label) {
    return `<article class="media-card"><div class="media-image"><button class="image-link" data-action="detail" data-id="${item.id}" aria-label="查看${esc(item.title)}">${image(item.image, item.subtitle || item.title)}<span class="image-hover">查看影像 ${icon('diagonal')}</span></button>${label ? `<span class="image-label">${label}</span>` : ''}</div><div class="media-meta">${artistTag(item.artist)}<span>${item.date ? item.date.replaceAll('-', '.') : '影像档案'}</span></div><button class="title-button" data-action="detail" data-id="${item.id}">${item.title} ${icon('diagonal')}</button><p>${item.subtitle || item.description}</p></article>`;
  }
  function nextEvent() { return D.events.filter(e => U.status(e) !== 'past').sort((a, b) => a.date.localeCompare(b.date))[0]; }
  function home() {
    const next = nextEvent();
    return `<div class="home container"><section class="hero hero-text-only hero-with-handwriting" aria-labelledby="hero-title"><div class="hero-copy"><h1 id="hero-title">Two Paths,<br><em>One Story.</em></h1><a class="button primary" href="#/profile">走近他们 ${icon('arrow')}</a><div class="hero-footnote">A shared story, still unfolding.</div></div><figure class="hero-handwriting"><img src="resource/文字.png" alt="手写文字与涂鸦" decoding="async" fetchpriority="high"></figure></section>
    ${next ? `<section class="next-event" aria-label="下一场活动"><div class="next-intro"><span class="status-dot"></span><span>下一次相见<small>NEXT RENDEZVOUS</small></span></div><div class="next-date">${next.date.slice(5).replace('-', '.')}<small>${next.date.slice(0, 4)}</small></div><div class="next-location"><h2>${next.title}</h2><span>${names(next.artist)} · ${next.english}</span></div><div class="countdown"><strong>${U.daysUntil(next.date)}</strong><span>${U.status(next) === 'ongoing' ? '相见就在今天' : '天后见'}</span></div><button class="text-link" data-action="detail" data-id="${next.id}">查看行程 ${icon('arrow')}</button></section>` : `<section class="next-event"><p>期待下一次相见。新的活动将在这里更新。</p><a class="text-link" href="#/fanmeeting">回顾见面会 ${icon('arrow')}</a></section>`}
    <section class="home-section">${sectionHead('In the Spotlight', '镜头里的他们', '#/profile/magazines', '浏览画报')}<div class="spotlight-grid">${mediaCard(D.magazines[0], 'MAGAZINE')}${mediaCard(D.magazines[1], 'EDITORIAL')}<article class="story-feature"><div class="story-copy"><h3>Every frame,<br><em>a little closer.</em></h3><p>从镜头前，到舞台上。<br>那些值得被珍藏的瞬间，<br>在这里，慢慢重温。</p><a href="#/live" class="text-link">翻开直播档案 ${icon('arrow')}</a></div><button class="story-image" data-action="detail" data-id="live-0911" aria-label="查看九月十一日双人直播">${image(D.lives[0].image, '金允植与朴时宇双人直播截图')}<span>2026.09.11 ${icon('diagonal')}</span></button></article></div></section>
    <section class="home-section moments-section">${sectionHead('Until We Meet Again', '把相见写成回忆', '#/fanmeeting', '见面会档案')}<div class="home-meeting-journal"><div class="meeting-intro"><h3>不同的城市，<br>同一份心意。</h3><p>把相见的日子，<br>一页一页收藏。</p><span class="meeting-signature" aria-hidden="true">See you again.</span></div><ol class="meeting-index" aria-label="见面会日期">${[...D.events].sort((a,b) => a.date.localeCompare(b.date)).map(event => `<li><button data-action="detail" data-id="${event.id}" aria-label="查看${esc(event.title)}，${dateLabel(event)}"><time datetime="${event.date}">${event.date.slice(5).replace('-', '.')}${event.endDate && event.endDate !== event.date ? '–' + event.endDate.slice(5).replace('-', '.') : ''}<small>${event.date.slice(0,4)}</small></time><span class="meeting-city"><span>${esc(event.english)}</span><small>${esc(event.title)}</small></span><span class="meeting-state ${U.status(event)}">${statusLabel(event)}</span>${icon('arrow')}</button></li>`).join('')}</ol></div></section></div>`;
  }
  function profileBiography(person) {
    const highlight = text => esc(text).replace(/《([^》]+)》/g, '<strong>《$1》</strong>');
    return person.sections.map(section => {
      if (section.title === '教育经历') return '';
      const entries = section.paragraphs.map(paragraph => {
        const match = paragraph.match(/^(\d{4})年([^：]*)(?:：)(.*)$/);
        if (!match) return '<li class="career-note"><span class="career-date">持续演出</span><div class="career-text">'+highlight(paragraph)+'</div></li>';
        return '<li><div class="career-date"><span class="career-year">'+match[1]+'</span>'+(match[2]?'<span class="career-month">'+esc(match[2])+'</span>':'')+'</div><div class="career-text">'+highlight(match[3])+'</div></li>';
      }).join('');
      return '<section class="career-section"><header><h3>'+esc(section.title)+'</h3><p>从初次登场，到新的篇章。</p></header><ol class="career-timeline">'+entries+'</ol></section>';
    }).join('');
  }
  function workOverview(work) {
    return `<div class="work-overview">
      
      <section class="work-story"><h3>旧案未结，<br>命运重逢。</h3><div>${work.sections[0].paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</div></section>
      <div class="work-characters character-editorials">${work.characters.map(c=>`<section class="work-character ${c.color}"><figure class="character-poster">${image(c.image, c.actor + '饰' + c.name + '角色海报')}</figure><div class="character-copy"><span>${esc(c.role)}</span><h3>${esc(c.name)}</h3><small>${esc(c.actor)} 饰</small><p>${esc(c.text)}</p></div></section>`).join('')}</div>
      <section class="work-chapter"><header><h3>追随故事的线索</h3><p>案件与关系，两条线索交织推进。</p></header><div class="work-themes"><div><h4>追问真相</h4><p>旧案连接起个人经历与权力网络，推动两人不断回望过去。</p></div><div><h4>重新认识彼此</h4><p>共事中的试探、分歧与靠近，让人物关系随着调查逐步变化。</p></div></div></section>
      <section class="work-chapter episode-section"><header class="episode-heading"><div><h3>分集剧情</h3><p>剧情与剧照含剧透</p></div><div class="episode-controls" role="group" aria-label="分集展示方式"><button type="button" class="text-link" data-action="episodes-expand" aria-controls="work-episodes">全部展示</button><button type="button" class="text-link" data-action="episodes-collapse" aria-controls="work-episodes">全部收起</button></div></header><div class="episode-list" id="work-episodes">${work.episodes.map(e=>`<details class="episode"><summary><span>${String(e.number).padStart(2,'0')}</span><strong>第${e.number}集</strong><small>${e.images.length} 张剧照</small>${icon('plus')}</summary><div class="episode-content"><div class="episode-body"><p>${esc(e.text)}</p></div><div class="episode-stills" aria-label="第${e.number}集剧照">${e.images.map((src,i)=>`<button class="episode-still" data-action="episode-photo" data-episode="${e.number}" data-index="${i}" aria-label="放大第${e.number}集剧照${i+1}">${image(src, '第'+e.number+'集剧照 '+(i+1))}${icon('expand')}</button>`).join('')}</div></div></details>`).join('')}</div></section>
      <section class="work-chapter"><header><h3>故事之外的声音</h3><p>原声音乐 · 三张单曲专辑</p></header><div class="ost-grid">${work.ost.map(o=>`<article><span class="ost-part">OST / 0${o.part}</span><h4>${esc(o.tracks[0].replace(/[《》]/g,''))}</h4><p>${esc(o.credits.find(c=>c.startsWith('歌手：'))?.slice(3)||'')}</p><small>${esc(o.credits.find(c=>c.startsWith('发行时间：'))?.slice(5)||'')}</small><details><summary>曲目与制作信息</summary><ol>${o.tracks.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${o.credits.filter(c=>!c.startsWith('歌手：')&&!c.startsWith('发行时间：')).map(c=>`<p>${esc(c)}</p>`).join('')}</details></article>`).join('')}</div></section>
      <section class="work-chapter"><header><h3>播出与回响</h3><p>播出信息与媒体评价。</p></header><p class="work-broadcast">2026年6月26日起在 Wavve 首播，初播安排为每周五韩国时间零点更新2集；7月1日起在韩国电影天国电视频道播出。</p><details class="work-reception"><summary>平台表现与媒体评价</summary><p>据整理稿，截至2026年7月10日，剧集在爱奇艺国际版及日本 FOD 亚洲电视剧分类最高排名第1，在中国台湾 friDay 电视剧及东南亚 GagaOOLala 最高排名第3。此处为当时记录，不代表实时排名。</p><div class="work-reviews">${work.reviews.map(review=>`<article><h4>${esc(review.publication)}</h4><p>${esc(review.text)}</p></article>`).join('')}</div></details></section>
      </div>`;
  }
  function profileFacts(person) {
    const facts = [...person.facts];
    const education = person.sections.find(section => section.title === '教育经历');
    if (education) {
      const index = facts.findIndex(fact => fact.label === '特长技能');
      facts.splice(index < 0 ? facts.length : index, 0, {label:'毕业院校', value:education.paragraphs.map(text => text.replace(/^毕业于\s*/, '')).join('；')});
    }
    return facts;
  }
  function profile() {
    if (magazineId) return magazinePage();
    const chosen = D.artists.filter(a => profileTab !== 'intro' || a.id === artist);
    let body = '';
    if (profileTab === 'intro') body = `<div class="profiles ${chosen.length === 1 ? 'single-profile' : ''}">${chosen.map(a => `<article class="artist-profile ${a.color}"><div class="artist-photo">${image(a.image, a.name + '个人写真', '', true)}</div><div class="artist-info"><h2>${a.name}<span>${a.latin}</span></h2>${tag('韩国演员', a.color)}<dl class="profile-facts">${profileFacts(a).map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl><button class="text-link" data-action="profile-tab" data-tab="works">作品与影像 ${icon('arrow')}</button></div><div class="profile-biography">${profileBiography(a)}</div></article>`).join('')}</div><div class="profile-note"><span class="tiny-dots"><i></i><i></i></span><p>两条各自生长的轨迹，也有共同被记住的篇章。</p><button class="text-link" data-action="profile-tab" data-tab="works">我们的共同作品 ${icon('arrow')}</button></div>`;
    if (profileTab === 'works') body = `<div class="work-layout"><div class="work-feature"><button class="work-photo" data-action="detail" data-id="work-proposal">${image(D.works[0].image, '检察官的提案双人海报')}${icon('expand')}</button><div class="work-copy">${artistTag('both')}<h2>检察官的提案</h2><p>${esc(D.works[0].description)}</p><p class="muted">${esc(D.works[0].subtitle)} · 全10集</p><dl class="work-facts">${D.works[0].facts.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></div></div>${workOverview(D.works[0])}</div>`;
    if (profileTab === 'magazines') body = `<div class="magazine-grid">${D.magazines.map(m => `<div>${mediaCard(m, m.interview ? '采访文字已收录' : '采访待更新')}<a class="text-link magazine-read-link" href="#/profile/magazines/${m.id}">${m.interview ? '阅读采访' : '查看画报与更新状态'} ${icon('arrow')}</a></div>`).join('')}</div><p class="content-note">现收录三本双人杂志。费加罗与 LOADING 的采访已整理为文字；势界的文字采访待更新。</p>`;
    return `<div class="container page profile-page">${pageHead('Profile', '人物', '在不同的镜头里，遇见他们。')}<div class="profile-toolbar"><div class="tabs" role="group" aria-label="人物内容">${[['intro','个人简介'],['works','作品影像'],['magazines','杂志与采访']].map(([id, name]) => `<button data-action="profile-tab" data-tab="${id}" aria-pressed="${profileTab === id}" class="${profileTab === id ? 'active' : ''}">${name}</button>`).join('')}</div>${profileTab === 'intro' ? `<div class="profile-person-slot">${personFilters('artist', artist, [['kys','金允植'],['psw','朴时宇']])}</div>` : ''}</div>${body}</div>`;
  }
  function magazinePage() {
    const item = D.magazines.find(m => m.id === magazineId);
    if (!item) return `<div class="container page">${empty('没有找到这本杂志','返回杂志列表继续浏览。')}<a href="#/profile/magazines" class="text-link">返回杂志列表 ${icon('arrow')}</a></div>`;
    const interview = item.interview;
    const questions = interview?.qa || [], sections = interview?.sections || [];
    const reading = interview ? `<div class="interview-layout"><aside class="interview-toc"><h2>本期目录</h2><button data-action="article-jump" data-target="interview-qa">Q&A · 对话 ${questions.length} 问</button>${sections.map((s,i) => `<button data-action="article-jump" data-target="article-section-${i}">${esc(s.title)}</button>`).join('')}<p>文字整理自提供的采访内页。按原页顺序保留问答和文章，不将采访图片作为正文展示。</p></aside><div class="interview-body"><section id="interview-qa"><h2 class="reading-section-title">Q&A<span>与他们对话</span></h2>${questions.map((q,i) => `<article class="qa-entry"><h3><span class="question-index">${String(i+1).padStart(2,'0')}</span>${esc(q.question)}</h3><div class="qa-answers">${q.answers.map(a => `<p class="qa-answer"><span class="speaker ${a.speaker}">${names(a.speaker)}</span><span>${esc(a.text)}</span></p>`).join('')}</div></article>`).join('')}</section>${sections.map((s,i) => `<section class="article-section" id="article-section-${i}"><h2 class="reading-section-title">${esc(s.title)}</h2>${s.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}</section>`).join('')}<div class="reading-end"><span class="tiny-dots"><i></i><i></i></span><p>本期文字已读完。</p><button class="text-link" data-action="magazine-tab" data-value="gallery">继续欣赏画报 ${icon('arrow')}</button></div></div></div>` : `<div class="interview-pending">${icon('book')}<h2>采访待更新</h2><p>这期的文字采访还未收录。<br>先翻看封面与内页画报，等下一次更新。</p><button class="button secondary" data-action="magazine-tab" data-value="gallery">欣赏本期画报 ${icon('arrow')}</button></div>`;
    const gallery = `<div class="magazine-gallery">${item.gallery.map((src,i) => `<figure><button data-action="magazine-image" data-id="${item.id}" data-index="${i}" aria-label="查看${esc(item.title)}${i<3?'封面':'内页'} ${i<3?i+1:i-2}">${image(src, `${item.title} · ${i<3?'封面':'摄影内页'} ${i<3?i+1:i-2}`)}<span>${icon('expand')}</span></button><figcaption>${i<3?'封面':'内页画报'} · ${String(i<3?i+1:i-2).padStart(2,'0')}</figcaption></figure>`).join('')}</div>`;
    return `<div class="container page magazine-page"><a class="text-link back-to-magazines page-back" href="#/profile/magazines">${icon('arrow')} 返回杂志与采访</a><header class="magazine-heading"><div class="magazine-cover">${image(item.image,item.title+'双人封面','',true)}</div><div class="magazine-heading-copy">${artistTag('both')}<h1>${esc(item.title)}</h1><p class="magazine-subtitle">${esc(item.description)}</p><p class="magazine-issue">${esc(item.issue)}</p><div class="magazine-reading-meta">${interview ? `${questions.length} 组问答${sections.length ? ' · ' + sections.length + ' 篇章' : ''} · 采访文字已收录` : '画报已收录 · 采访待更新'}</div></div></header>${item.note ? `<p class="magazine-editor-note">${esc(item.note)}</p>` : ''}<div class="magazine-tabbar"><div class="tabs" role="group" aria-label="杂志内容">${[['interview','文字采访'],['gallery','封面与画报']].map(([id,label])=>`<button data-action="magazine-tab" data-value="${id}" class="${magazineTab===id?'active':''}" aria-pressed="${magazineTab===id}">${label}${id==='gallery'?` <span>${item.gallery.length}</span>`:''}</button>`).join('')}</div><span>金允植 & 朴时宇</span></div>${magazineTab==='interview'?reading:gallery}<p class="content-note magazine-credit">内容来源：${esc(item.source)}。文字与影像版权归杂志及相关权利人所有。</p></div>`;
  }
  function personFilters(action, value, options = [['all','全部'],['both','双人'],['kys','金允植'],['psw','朴时宇']]) { return `<div class="filter-buttons" role="group" aria-label="按参与人物筛选">${options.map(([id, label]) => `<button data-action="${action}" data-value="${id}" class="filter-button ${value === id ? 'active' : ''}" aria-pressed="${value === id}">${id === 'kys' || id === 'psw' ? `<i class="person-dot ${id}"></i>` : ''}${label}</button>`).join('')}</div>`; }
  function scheduleActivityLabel(activity) {
    let text = activity.text;
    const name = {kys:'金允植', psw:'朴时宇'}[activity.artist];
    if (name && text.startsWith(name)) text = text.slice(name.length).trim().replace(/^单人/, '');
    if (activity.artist === 'both') text = text.replace(/^金允植、朴时宇、/, '与').replace(/^金允植、朴时宇/, '');
    if (activity.category === 'travel') text = text.replace(/^从(.+?)前往(.+)$/, '$1飞往$2');
    return text;
  }
  function schedule() {
    const filtered = U.filterSchedule({artist:scheduleArtist, month:scheduleMonth});
    const months = [...new Set(D.timeline.flatMap(e => [e.date.slice(0, 7), (e.endDate || e.date).slice(0,7)]))].sort().reverse();
    let lastMonth = '', lastDate = '';
    const rows = filtered.slice(0, scheduleLimit).map((e, index) => {
      const month = scheduleMonth !== 'all' ? scheduleMonth : e.date.slice(0, 7);
      const heading = month !== lastMonth ? `<h2 class="timeline-month">${month.slice(5)}<span>月 / ${month.slice(0, 4)}</span></h2>` : ''; lastMonth = month;
      const showDate = e.date !== lastDate; lastDate = e.date;
      const shortDay = e.precision === 'month' ? '月内' : e.date.slice(8);
      const weekday = e.precision === 'month' ? '未详' : new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', {weekday:'short'});
      return `${heading}<article class="timeline-row ${filtered[index + 1]?.date !== e.date ? 'day-end' : ''}" data-entry="${e.id}" tabindex="-1"><time datetime="${e.date}" class="${showDate ? '' : 'same-day-date'}" aria-label="${e.date}">${showDate ? `<small>${e.date.slice(5,7)}</small><strong>${shortDay}</strong><span>${weekday}</span>` : ''}</time><div class="timeline-track"><span class="${U.status(e)}"></span></div><div class="timeline-info"><div class="timeline-tags">${artistTag(e.artist)}${(e.categories || [U.categoryOf(e)]).map(c => tag(D.categories[c] || '活动')).join('')}${e.tentative ? tag('项目待确认','tentative') : e.type !== 'schedule' ? tag(statusLabel(e),U.status(e)) : ''}${e.precision === 'range' ? tag('区间记录') : ''}</div><div class="schedule-title">${e.activities ? e.activities.map(activity => `<span class="schedule-activity">${esc(scheduleActivityLabel(activity))}</span>`).join('') : esc(e.title)}</div></div><div class="timeline-actions"><button class="icon-button" data-action="detail" data-id="${e.id}" aria-label="查看${esc(e.title)}">${icon('arrow')}</button></div></article>`;
    }).join('');
    return `<div class="container page schedule-page">${pageHead('Schedule', '行程', '从第一场拍摄，到下一次相见。循着时间，重读每个篇章。')}
      <div class="schedule-filters"><div class="filter-bar">${personFilters('schedule-artist', scheduleArtist)}</div></div>
      <div class="schedule-layout"><div><p class="results-count" role="status" aria-live="polite">共 ${filtered.length} 条记录 <span>按时间倒序 · 已展示 ${Math.min(scheduleLimit, filtered.length)} 条</span></p><div class="timeline">${rows || empty('没有符合条件的记录', '试试其他人物、月份或类型，也可以重置全部筛选。')}</div>${filtered.length > scheduleLimit ? `<div class="load-more"><button class="button secondary" data-action="schedule-more">继续查看较早记录 ${icon('arrow')}</button><span>还有 ${filtered.length - scheduleLimit} 条记录</span></div>` : filtered.length ? '<p class="timeline-end">已读到这段时间的起点。</p>' : ''}</div>
      <aside class="schedule-aside"><h2>每一个日子，<br><em>都是故事的一页。</em></h2><p>选择一个月份，<br>回到那一段共同记忆。</p><nav class="month-index" aria-label="按月份浏览">${months.map(m => `<button data-action="schedule-jump" data-value="${m}" aria-pressed="${scheduleMonth === m}" class="${scheduleMonth === m ? 'active' : ''}"><span>${Number(m.slice(5))} 月 <small>${m.slice(0,4)}</small></span><span>${U.filterSchedule({month:m}).length}</span></button>`).join('')}</nav><div class="aside-note"><h3>资料说明</h3><p>本行程表以出行、直播、双人杂志/商务活动为主，部分单人商务或无明确日期的活动暂未收录。</p><p>见面活动安排如有调整，请以主办方公告为准。</p><small>资料更新 · ${D.updated.replaceAll('-', '.')}</small></div></aside></div></div>`;
  }
  function eventCard(e) {
    return `<article class="event-card"><div class="event-visual event-poster"><button class="image-link" data-action="detail" data-id="${e.id}" aria-label="查看${e.title}"><span class="poster-city">${e.english}</span><span class="poster-date">${e.date.slice(5).replace('-', '.')}</span><span class="poster-names">KIM YOON SIK & PARK SI WOO</span><span class="event-status">${tag(statusLabel(e), U.status(e))}</span></button></div><div class="event-info"><span class="event-date">${dateLabel(e)}${e.sessions > 1 ? ' · ' + e.sessions + ' 场' : ''}</span><button class="title-button" data-action="detail" data-id="${e.id}">${e.title} ${icon('arrow')}</button><p>${e.image ? '现场影像已收录' : U.status(e) === 'past' ? '活动影像待补充' : (e.time ? esc(e.time) : '具体时间与场地待公布')}</p></div></article>`;
  }
  function fanmeeting() {
    const events = D.events.filter(e => fmStatus === 'all' || (fmStatus === 'upcoming' ? U.status(e) !== 'past' : U.status(e) === 'past')).sort((a,b) => a.date.localeCompare(b.date));
    return `<div class="container page">${pageHead('Fanmeeting', '相见的日子', '穿过城市与人海，与你共同珍藏的每一次相遇。')}<div class="fm-banner"><p>Different cities.<br><em>The same heartbeat.</em></p><div><span class="tiny-dots"><i></i><i></i></span><span>从澳门、首尔，到更多远方。<br>让故事，在每一次相见中继续。</span></div></div><div class="filter-bar"><div class="tabs" role="group" aria-label="活动状态">${[['all','全部相见'],['upcoming','即将开始'],['past','往期回顾']].map(([id,label]) => `<button class="${fmStatus === id ? 'active' : ''}" data-action="fm-status" data-value="${id}" aria-pressed="${fmStatus === id}">${label} <span>${D.events.filter(e => id === 'all' || (id === 'upcoming' ? U.status(e) !== 'past' : U.status(e) === 'past')).length}</span></button>`).join('')}</div></div><div class="event-grid">${events.map(eventCard).join('')}</div>${!events.length ? empty('新的相见正在路上', '暂未收录此状态的活动，可切换查看全部相见。') : ''}</div>`;
  }
  function liveReading(item) {
    const titles = item.chapters ? item.chapters.map(c => c.title) : ['突然开播','炸鸡话题','回家路上','下次再见'];
    const starts = item.chapters ? item.chapters.map(c => c.start) : [0, item.messages.findIndex(m => m.text.includes('听说你最近在吃播')), item.messages.findIndex(m => m.text.includes('我们又要短暂地结束直播')), item.messages.findIndex(m => m.text.includes('我们很快又会和大家见面'))];
    let previous = '';
    const messages = item.messages.map((m,i) => {
      const chapter = starts.indexOf(i);
      const heading = chapter >= 0 ? '<h2 class="chat-chapter" id="chat-chapter-' + chapter + '"><span>0' + (chapter+1) + '</span>' + titles[chapter] + '</h2>' : '';
      if (m.speaker === 'action') { previous = ''; return heading + '<p class="chat-action">' + esc(m.text) + '</p>'; }
      const repeated = previous === m.speaker && chapter < 0; previous = m.speaker;
      return heading + '<div class="chat-message ' + m.speaker + (repeated ? ' continued' : '') + '"><div class="chat-avatar">' + (repeated ? '' : image(item.avatars[m.speaker], names(m.speaker))) + '</div><div class="chat-content">' + (repeated ? '' : '<p class="chat-name">' + names(m.speaker) + '</p>') + '<p class="chat-bubble">' + esc(m.text) + '</p></div></div>';
    }).join('');
    return '<div class="container page live-reading"><a class="text-link page-back" href="#/live">' + icon('arrow') + '<span>返回直播档案</span></a><header class="chat-header"><div class="chat-cover">' + image(item.image,item.title,'',true) + '</div><div><span class="eyebrow">LIVE ARCHIVE / ' + esc(item.date.replaceAll('-','.')) + '</span><h1>' + esc(item.title) + '</h1><p>' + esc(item.subtitle) + '</p>' + (item.imageNote ? '<p class="small-note">' + esc(item.imageNote) + '</p>' : '') + '<p class="chat-intro">' + esc(item.description) + '</p><div class="button-row"><span>直播文字整理 · ' + item.messages.filter(m=>m.speaker !== 'action').length + ' 条对话</span></div></div></header><div class="chat-layout"><aside class="chat-navigation"><p>这场对话</p>' + titles.map((title,i)=>'<button data-action="article-jump" data-target="chat-chapter-' + i + '"><span>0' + (i+1) + '</span>' + title + '</button>').join('') + '</aside><section class="chat-stream" aria-label="直播对话">' + messages + '<div class="chat-end">这次先聊到这里。<br><span>期待下一次，更久的相见。</span></div></section></div></div>';
  }
  function live() {
    const id = location.hash.split('/')[2];
    if (id) { const item = D.lives.find(l => l.id === id); if (item?.messages) return liveReading(item); }
    const filtered = D.lives.filter(e => liveArtist === 'all' || e.artist === liveArtist).sort((a,b) => b.date.localeCompare(a.date));
    return `<div class="container page live-archive-page">${pageHead('Live Archive', '直播时光', '留下声音、文字，和那些不经意的心动。')}<div class="filter-bar">${personFilters('live-artist', liveArtist)}<span class="results-count" role="status">${filtered.length} 场直播 · 按日期从新到旧</span></div><div class="live-archive-grid">${filtered.map(l => `<article class="live-archive-entry"><a class="live-archive-cover" href="#/live/${l.id}" aria-label="阅读${esc(l.title)}">${image(l.image, l.title)}</a><div class="live-archive-copy"><div class="live-archive-date"><time datetime="${l.date}">${dateLabel(l)}</time>${artistTag(l.artist)}</div><h2><a href="#/live/${l.id}">${esc(l.title)}</a></h2><p>${esc(l.description)}</p><div class="live-archive-status"><span>${icon('book')}${l.transcript ? '文字与中文翻译已收录' : '中文对话待补充'}</span><span>${icon('audio')}${l.audio ? '音频已收录' : '音频待补充'}</span></div><a class="text-link" href="#/live/${l.id}">阅读对话 ${icon('arrow')}</a></div></article>`).join('')}</div>${!filtered.length ? empty('这段时光，待续', '暂未收录该人物的单人直播。选择「双人」可查看现有直播档案。') : ''}</div>`;

  }
  function enhanceSelects() {
    main.querySelectorAll('select').forEach(select => {
      const label = select.parentElement;
      const name = label.firstChild.textContent.trim();
      const wrapper = document.createElement('span');
      wrapper.className = 'custom-select';
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.id = select.id + '-trigger';
      trigger.className = 'select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-label', name + '：' + select.selectedOptions[0].textContent);
      trigger.innerHTML = esc(select.selectedOptions[0].textContent) + icon('chevron');
      const menu = document.createElement('span');
      menu.className = 'select-menu'; menu.id = select.id + '-options';
      menu.setAttribute('role', 'listbox'); menu.setAttribute('aria-label', name); menu.hidden = true;
      trigger.setAttribute('aria-controls', menu.id);
      const close = () => { menu.hidden = true; trigger.setAttribute('aria-expanded', 'false'); };
      const options = [...select.options].map(option => {
        const button = document.createElement('button');
        button.type = 'button'; button.tabIndex = -1; button.setAttribute('role', 'option');
        button.setAttribute('aria-selected', String(option.selected));
        button.textContent = option.textContent;
        button.addEventListener('click', event => {
          event.preventDefault(); select.value = option.value;
          select.dispatchEvent(new Event('change', {bubbles:true}));
          document.getElementById(select.id + '-trigger')?.focus({preventScroll:true});
        });
        menu.append(button); return button;
      });
      const open = () => {
        main.querySelectorAll('.select-menu').forEach(el => { el.hidden = true; });
        main.querySelectorAll('.select-trigger').forEach(el => el.setAttribute('aria-expanded','false'));
        menu.hidden = false; trigger.setAttribute('aria-expanded', 'true');
        options[select.selectedIndex]?.focus({preventScroll:true});
        options[select.selectedIndex]?.scrollIntoView({block:'nearest',behavior:'instant'});
      };
      trigger.addEventListener('click', event => { event.preventDefault(); menu.hidden ? open() : close(); });
      wrapper.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); trigger.focus(); }
        if (event.key === 'Tab') close();
        if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
          event.preventDefault(); if (menu.hidden) { open(); return; }
          const current = options.indexOf(document.activeElement);
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
          options[next].focus();
        }
      });
      wrapper.addEventListener('focusout', event => { if (!wrapper.contains(event.relatedTarget)) close(); });
      select.hidden = true; label.append(wrapper); wrapper.append(trigger,menu);
    });
  }
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.custom-select')) {
      main.querySelectorAll('.select-menu').forEach(el => { el.hidden = true; });
      main.querySelectorAll('.select-trigger').forEach(el => el.setAttribute('aria-expanded','false'));
    }
  });
  function render(focus = false) {
    main.innerHTML = ({ home, profile, schedule, fanmeeting, live })[route]?.() || `<div class="container page">${empty('这一页还没有故事', '你可以从首页重新开始。')}<a class="button primary" href="#/">返回首页 ${icon('arrow')}</a></div>`;
    enhanceSelects();
    updateBackToTop();
    document.querySelectorAll('[data-route]').forEach(el => { const active = el.dataset.route === route; el.classList.toggle('active', active); if (active) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
    document.title = `${({home:'Two Paths, One Story.',profile:'Profile · 人物',schedule:'Schedule · 行程',fanmeeting:'Fanmeeting · 相见的日子',live:'Live · 直播时光'})[route] || '页面未找到'} — 金允植 & 朴时宇`;
    if (route === 'profile' && magazineId) document.title = `${D.magazines.find(m => m.id === magazineId)?.title || '杂志'} · 采访与画报 — 金允植 & 朴时宇`;
    if (focus) main.focus({ preventScroll: true });
  }
  function navigate() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    route = parts[0] || 'home';
    magazineId = '';
    if (route === 'profile') { artist = ['kys','psw'].includes(parts[1]) ? parts[1] : 'kys'; profileTab = parts[1] === 'magazines' ? 'magazines' : 'intro'; if (parts[1] === 'magazines' && parts[2]) { magazineId = parts[2]; magazineTab = 'interview'; } }
    document.querySelector('.site-header').classList.remove('menu-open');
    document.querySelector('[data-action="menu"]').setAttribute('aria-expanded', 'false');
    if (detail.open) detail.close(); if (searchDialog.open) searchDialog.close();
    render(); window.scrollTo({top:0, behavior:'instant'});
  }
  function showModal(modal) { if (!modal.open) modal.showModal(); document.body.classList.add('modal-open'); }
  function detailMarkup(item) {
    if (item.type === 'schedule') return scheduleDetail(item);
    const gallery = item.gallery || (item.image ? [item.image] : []);
    if (item.type === 'work') return `<div class="work-photo-gallery"><h2 id="detail-title" class="sr-only">${esc(item.title)}作品影像</h2>${gallery.map((src, index) => image(src, item.title + '作品照片 ' + (index + 1), '', true)).join('')}</div>`;
    return `<div class="detail-layout ${!gallery.length ? 'no-photo' : ''}">${gallery.length ? `<div class="detail-media"><button class="detail-image-button" data-action="expand-image" aria-label="放大或还原图片">${image(gallery[0], item.title, '', true)}<span>${icon('expand')}</span></button>${gallery.length > 1 ? `<div class="gallery-controls" role="group" aria-label="选择作品照片">${gallery.map((src, i) => `<button data-action="gallery" data-index="${i}" aria-label="照片 ${i + 1}" aria-pressed="${i === 0}" class="${i === 0 ? 'active' : ''}">${image(src, '作品照片 ' + (i + 1))}</button>`).join('')}</div>` : ''}</div>` : ''}<div class="detail-content"><div class="detail-tags">${artistTag(item.artist)}${item.type === 'fanmeeting' ? tag(statusLabel(item), U.status(item)) : tag({magazine:'杂志画报',work:'作品影像',live:'直播档案'}[item.type])}</div><h2 id="detail-title">${item.title}</h2><p class="detail-subtitle">${item.subtitle || names(item.artist)}</p>${item.date ? `<p class="detail-date">${icon('calendar')} ${dateLabel(item)}</p>` : ''}<p class="detail-description">${item.description}</p>${item.type === 'fanmeeting' ? `<dl class="event-facts"><div><dt>城市</dt><dd>${item.city} · ${item.english}</dd></div><div><dt>场地</dt><dd>${item.venue || '待补充'}</dd></div><div><dt>开场时间</dt><dd>${item.time || '待公布'}</dd></div><div><dt>场次</dt><dd>${item.sessions} 场${item.sessions > 1 && !item.time ? ' · 具体场次时间待补充' : ''}</dd></div></dl>` : ''}${item.type === 'live' ? `<div class="tabs detail-tabs" role="group" aria-label="直播资料类型">${[['transcript','文字整理'],['audio','直播音频'],['translation','中文翻译']].map(([id, name], i) => `<button class="${i === 0 ? 'active' : ''}" data-action="live-resource" data-value="${id}" aria-pressed="${i === 0}">${name}</button>`).join('')}</div><div id="live-resource-content">${resource(item, 'transcript')}</div>` : ''}${item.type === 'magazine' || item.type === 'work' ? `<div class="detail-reading"><h3>${item.type === 'magazine' ? '采访与文字' : '作品介绍'}</h3><p>${item.text ? esc(item.text) : item.type === 'magazine' ? '画报影像已收录，采访原文与翻译待补充。' : '作品简介、角色与播出信息待补充。可点击缩略图浏览现有作品影像。'}</p></div>` : ''}${item.type !== 'fanmeeting' ? `<p class="source-note">资料来源：${item.source}</p>` : ''}</div></div>`;
  }
  function scheduleDetail(item) {
    const title = scheduleActivityLabel({text:item.title, artist:item.artist, category:item.category});
    const participants = item.participants || [names(item.artist), ...['赵珉奎','薛俊秀'].filter(name => item.title.includes(name))].join('、').replace(' & ', '、');
    const details = item.details || (item.description !== item.title ? item.description : '') || '待补充';
    const photos = item.photos || item.gallery || (item.image ? [item.image] : []);
    return `<div class="schedule-detail schedule-editorial"><div class="detail-tags">${artistTag(item.artist)}${tag(D.categories[item.category] || '活动')}</div><h2 id="detail-title">${esc(title)}</h2><p class="detail-subtitle" aria-label="参与人">${esc(participants)}</p><p class="detail-date">${icon('calendar')} ${dateLabel(item)}</p><section class="schedule-detail-section"><h3>行程详情</h3><p class="${details === '待补充' ? 'pending-detail' : ''}">${esc(details)}</p></section>${photos.length ? `<section class="schedule-detail-section"><h3>行程照片</h3><div class="schedule-detail-photos">${photos.map(src => image(src, title)).join('')}</div></section>` : ''}</div>`;

  }
  function resource(item, key) {
    if (!item[key]) return `<div class="resource-empty">${icon(key === 'audio' ? 'audio' : 'book')}<p>${{transcript:'文字整理',audio:'直播音频',translation:'中文翻译'}[key]}待补充</p><small>已保存这场直播的影像，更多内容敬请期待。</small></div>`;
    if (key === 'audio') return `<audio controls preload="metadata" src="${esc(item.audio)}">浏览器不支持音频播放。</audio>`;
    return `<div class="resource-text">${esc(item[key])}</div>`;
  }
  function openDetail(id) {
    const item = D.all.find(x => x.id === id); if (!item) return;
    if (item.type === 'live' && item.messages) { if (searchDialog.open) searchDialog.close(); location.hash = '#/live/' + id; return; }
    if (item.type === 'magazine') { if (searchDialog.open) searchDialog.close(); location.hash = '#/profile/magazines/' + id; return; }
    activeDetail = item; galleryIndex = 0;
    if (searchDialog.open) searchDialog.close();
    detail.classList.remove('expanded-image');
    document.querySelector('#detail-body').innerHTML = detailMarkup(item);
    showModal(detail); detail.scrollTop = 0;
  }
  function renderSearch() {
    const query = document.querySelector('#search-input').value;
    const items = U.search(query, D.all);
    document.querySelector('#search-results').innerHTML = `<p class="results-count">全部档案 · ${items.length} 条结果</p>${items.map(item => `<div class="search-result"><button data-action="detail" data-id="${item.id}" class="search-result-main">${item.image ? image(item.image, item.title) : `<span class="search-result-placeholder">${icon('calendar')}</span>`}<span><strong>${item.title}</strong><small>${D.categories[U.categoryOf(item)] || ({work:'作品影像'}[item.type]) || '活动记录'} · ${names(item.artist)}${item.date ? ' · ' + item.date : ''}</small></span>${icon('chevron')}</button></div>`).join('') || empty('还没有找到这段故事', '试试其他人物、城市、杂志名称或日期。')}`;
  }
  function openSearch() { document.querySelector('#search-title').textContent = '寻找一个瞬间'; document.querySelector('#search-input').value = ''; renderSearch(); showModal(searchDialog); document.querySelector('#search-input').focus(); }
  function downloadCalendar(id) {
    const item = D.events.find(e => e.id === id); if (!item) return;
    const url = URL.createObjectURL(new Blob([U.calendar(item)], {type:'text/calendar;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = `${item.date}-${item.title}.ics`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 3000); toast('日历文件已生成，请在下载后导入日历');
  }
  function rerenderKeepingFocus(button) {
    const { action, id, tab, value } = button.dataset;
    render();
    const candidate = [...main.querySelectorAll(`[data-action="${action}"]`)].find(el => el.dataset.id === id && el.dataset.tab === tab && el.dataset.value === value);
    candidate?.focus({preventScroll:true});
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const {action, id, value, tab} = button.dataset;
    if (action === 'skip-main') { event.preventDefault(); main.focus({preventScroll:true}); main.scrollIntoView({block:'start'}); }
    if (action === 'detail') openDetail(id);
    if (action === 'search') openSearch();
    if (action === 'close') detail.close();
    if (action === 'close-search') searchDialog.close();
    if (action === 'calendar') downloadCalendar(id);
    if (action === 'menu') { const open = document.querySelector('.site-header').classList.toggle('menu-open'); button.setAttribute('aria-expanded', String(open)); button.setAttribute('aria-label', open ? '关闭导航' : '打开导航'); }
    if (action === 'episodes-expand' || action === 'episodes-collapse') {
      document.querySelectorAll('#work-episodes > .episode').forEach(episode => { episode.open = action === 'episodes-expand'; });
    }
    if (action === 'episode-photo') {
      const episode = D.works[0].episodes.find(e => e.number === Number(button.dataset.episode));
      const src = episode?.images[Number(button.dataset.index)];
      if (src) { activeDetail = null; detail.classList.remove('expanded-image'); document.querySelector('#detail-body').innerHTML = `<div class="still-lightbox"><h2 id="detail-title" class="sr-only">第${episode.number}集剧照</h2>${image(src, '第'+episode.number+'集剧照', '', true)}</div>`; showModal(detail); detail.scrollTop = 0; }
    }
    if (action === 'artist') { artist = value; rerenderKeepingFocus(button); }
    if (action === 'profile-tab') { profileTab = tab; rerenderKeepingFocus(button); }
    if (action === 'magazine-tab') { magazineTab = value; render(); const current = document.querySelector(`.magazine-tabbar [data-value="${value}"]`); current?.focus({preventScroll:true}); document.querySelector('.magazine-tabbar').scrollIntoView({block:'start'}); }
    if (action === 'article-jump') { const target = document.getElementById(button.dataset.target); target?.scrollIntoView({block:'start',behavior:'auto'}); }
    if (action === 'magazine-image') { const item = D.magazines.find(m=>m.id===id); if(item) { activeDetail=item; galleryIndex=Number(button.dataset.index); detail.classList.remove('expanded-image'); document.querySelector('#detail-body').innerHTML=`<div class="gallery-lightbox"><h2 id="detail-title">${esc(item.title)} · 影像</h2><img class="gallery-full-image" src="./${esc(item.gallery[galleryIndex])}" alt="${esc(item.title)}画报 ${galleryIndex+1}"><div class="lightbox-controls"><button class="icon-button" data-action="magazine-prev" aria-label="上一张">${icon('arrow')}</button><span id="gallery-position">${galleryIndex+1} / ${item.gallery.length}</span><button class="icon-button" data-action="magazine-next" aria-label="下一张">${icon('arrow')}</button></div></div>`; showModal(detail); } }
    if ((action === 'magazine-prev' || action === 'magazine-next') && activeDetail?.type === 'magazine') { galleryIndex=(galleryIndex+(action==='magazine-next'?1:-1)+activeDetail.gallery.length)%activeDetail.gallery.length; const img=detail.querySelector('.gallery-full-image'); img.src='./'+activeDetail.gallery[galleryIndex]; img.alt=activeDetail.title+'画报 '+(galleryIndex+1); detail.querySelector('#gallery-position').textContent=`${galleryIndex+1} / ${activeDetail.gallery.length}`; }
    if (action === 'schedule-artist') { scheduleArtist = value; scheduleLimit = 20; rerenderKeepingFocus(button); }
    if (action === 'schedule-jump') { scheduleMonth = scheduleMonth === value ? 'all' : value; scheduleLimit = 20; render(); document.querySelector('.schedule-filters').scrollIntoView({block:'start',behavior:'auto'}); document.querySelector('[data-action="schedule-jump"][data-value="' + value + '"]').focus({preventScroll:true}); }
    if (action === 'schedule-more') { const previous = scheduleLimit; scheduleLimit += 20; render(); const next = document.querySelectorAll('.timeline-row')[previous]; next?.focus({preventScroll:true}); }
    if (action === 'fm-status') { fmStatus = value; rerenderKeepingFocus(button); }
    if (action === 'live-artist') { liveArtist = value; rerenderKeepingFocus(button); }
    if (action === 'expand-image') { const expanded = detail.classList.toggle('expanded-image'); button.setAttribute('aria-label', expanded ? '还原图片' : '放大图片'); }
    if (action === 'gallery' && activeDetail) {
      galleryIndex = Number(button.dataset.index);
      const img = detail.querySelector('.detail-image-button img'); img.src = './' + activeDetail.gallery[galleryIndex]; img.alt = activeDetail.title + ' · 照片 ' + (galleryIndex + 1);
      detail.querySelectorAll('[data-action="gallery"]').forEach(el => { const selected = el === button; el.classList.toggle('active', selected); el.setAttribute('aria-pressed', String(selected)); });
    }
    if (action === 'live-resource' && activeDetail) { detail.querySelectorAll('[data-action="live-resource"]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); }); document.querySelector('#live-resource-content').innerHTML = resource(activeDetail, value); }
    if (action === 'about-language') {
      detail.querySelectorAll('[data-action="about-language"]').forEach(tab => {
        const selected = tab === button;
        tab.classList.toggle('active', selected);
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !selected;
      });
    }
    if (action === 'about') {
      activeDetail = null;
      detail.classList.remove('expanded-image');
      const content = D.about.map((section, i) => '<section class="about-language" id="about-panel-'+i+'" role="tabpanel" aria-labelledby="about-tab-'+i+'" lang="'+section.lang+'"'+(i ? ' hidden' : '')+'>'+section.lines.map(line => {
        if (/^\d+\.\s/.test(line)) return '<h4>'+esc(line)+'</h4>';
        const text = esc(line).replace(/rinsatoaki@gmail\.com/g, '<a href="mailto:rinsatoaki@gmail.com">rinsatoaki@gmail.com</a>');
        return '<p'+(/^(资料更新于|Last Updated)/.test(line)?' class="about-updated"':'')+'>'+text+'</p>';
      }).join('')+'</section>').join('');
      const tabs = '<div class="tabs about-tabs" role="tablist" aria-label="语言 / Language">'+D.about.map((section,i) => '<button type="button" role="tab" id="about-tab-'+i+'" aria-controls="about-panel-'+i+'" aria-selected="'+(i===0)+'" tabindex="'+(i===0?0:-1)+'" class="'+(i===0?'active':'')+'" data-action="about-language" data-value="'+i+'">'+(i===0?'中文':'ENGLISH')+'</button>').join('')+'</div>';
      document.querySelector('#detail-body').innerHTML = '<div class="about-content about-bilingual"><h2 id="detail-title">Two Paths, One Story.</h2>'+tabs+content+'</div>';
      showModal(detail);
      detail.scrollTop = 0;
    }
  });

  document.querySelector('#search-input').addEventListener('input', renderSearch);
  [detail, searchDialog].forEach(dialog => { dialog.addEventListener('close', () => { if (!detail.open && !searchDialog.open) document.body.classList.remove('modal-open'); }); dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } }); });
  document.addEventListener('keydown', e => {
    if (e.target.matches('[data-action="about-language"]') && ['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault();
      const tabs = [...detail.querySelectorAll('[data-action="about-language"]')];
      const index = tabs.indexOf(e.target);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length-1 : (index+(e.key === 'ArrowRight'?1:-1)+tabs.length)%tabs.length;
      tabs[next].click(); tabs[next].focus();
    }
    if (e.key === 'Escape' && (detail.open || searchDialog.open)) { e.preventDefault(); if (detail.open) detail.close(); if (searchDialog.open) searchDialog.close(); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); if (!detail.open) openSearch(); }
  });
  document.querySelector('[data-action="search"]').innerHTML = icon('search');
  document.querySelector('[data-action="menu"]').innerHTML = icon('menu');
  document.querySelectorAll('[data-action="close"], [data-action="close-search"]').forEach(el => el.innerHTML = icon('close'));
  document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
  document.querySelector('#year').textContent = new Date().getFullYear();
  // Capture nested scrolling too (dialogs, search results and horizontal lists).
  const backToTop = document.getElementById('back-to-top');
  function updateBackToTop() {
    backToTop.hidden = !main.querySelector('.live-reading, .live-archive-page, .magazine-page, .profile-page, .schedule-page') || window.scrollY < 500;
  }
  backToTop.addEventListener('click', () => {
    main.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  });
  window.addEventListener('scroll', updateBackToTop, {passive:true});
  const scrollbarTimers = new WeakMap();
  document.addEventListener('scroll', event => {
    const scroller = event.target === document ? document.documentElement : event.target;
    if (!(scroller instanceof Element)) return;
    scroller.classList.add('is-scrolling');
    clearTimeout(scrollbarTimers.get(scroller));
    scrollbarTimers.set(scroller, setTimeout(() => {
      scroller.classList.remove('is-scrolling');
      scrollbarTimers.delete(scroller);
    }, 800));
  }, { capture: true, passive: true });
  window.addEventListener('hashchange', navigate);
  navigate();
})();
