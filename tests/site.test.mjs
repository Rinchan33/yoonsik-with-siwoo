import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
await import('../schedule-data.js');
await import('../magazine-data.js');
await import('../data.js');
const D = globalThis.SiteData, U = globalThis.SiteUtils;

test('需求中的七条活动与多场日期完整保留', () => {
  assert.equal(D.events.length, 7);
  assert.equal(D.events.find(e => e.id === 'fm-seoul').sessions, 2);
  assert.equal(D.events.find(e => e.id === 'fm-hongkong').endDate, '2026-09-06');
  assert.deepEqual(D.events.filter(e => U.status(e, '2026-09-20') === 'upcoming').map(e => e.date).sort(), ['2026-10-18', '2026-10-31', '2026-11-21']);
});
test('跨日活动状态包含最后一天，倒计时不受本地时区影响', () => {
  const e = D.events.find(e => e.id === 'fm-hongkong');
  assert.equal(U.status(e, '2026-09-04'), 'upcoming');
  assert.equal(U.status(e, '2026-09-05'), 'ongoing');
  assert.equal(U.status(e, '2026-09-06'), 'ongoing');
  assert.equal(U.status(e, '2026-09-07'), 'past');
  assert.equal(U.daysUntil('2026-10-18', '2026-09-20'), 28);
  assert.equal(U.daysUntil('2026-08-09', '2026-09-20'), 0);
});
test('中英文搜索、多关键词、日期和空结果', () => {
  assert.ok(U.search('澳门').length >= 2);
  assert.equal(U.search('MACAU').length, 2);
  assert.equal(U.search('澳门 2026-10').length, 6);
  assert.equal(U.search('Madame Figaro')[0].artist, 'both');
  assert.equal(U.search('不存在的条目').length, 0);
  assert.equal(U.search('2026-09-12').find(e=>e.type==='live').type, 'live');
});
test('日历使用全天事件和排他结束日期', () => {
  const content = U.calendar(D.events.find(e => e.id === 'fm-hongkong'));
  assert.ok(content.includes('DTSTART;VALUE=DATE:20260905\r\n'));
  assert.ok(content.includes('DTEND;VALUE=DATE:20260907\r\n'));
  assert.ok(content.includes('SUMMARY:香港见面会'));
  assert.ok(content.endsWith('END:VCALENDAR\r\n'));
  const yearEnd = U.calendar({id:'test',title:'test',date:'2026-12-31',endDate:'2026-12-31'});
  assert.ok(yearEnd.includes('DTEND;VALUE=DATE:20270101'));
});
test('文本输出进行 HTML 转义', () => {
  assert.equal(U.escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
test('所有条目 ID 唯一，引用的本地图片存在', async () => {
  assert.equal(new Set(D.all.map(e => e.id)).size, D.all.length);
  const images = [...D.artists, ...D.all].flatMap(e => [e.image, ...(e.gallery || [])]).filter(Boolean);
  for (const image of images) await access(new URL('../' + image, import.meta.url));
});
test('入口无需构建工具，使用相对路径兼容 GitHub 项目子目录', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('src="./data.js"'));
  assert.ok(html.includes('src="./app.js"'));
  assert.ok(html.indexOf('src="./schedule-data.js"') < html.indexOf('src="./data.js"'));
  assert.ok(html.indexOf('src="./magazine-data.js"') < html.indexOf('src="./data.js"'));
  assert.ok(!/(?:src|href)="\/(?!\/)/.test(html));
});

test('新版时间表保留源稿，时间轴按活动拆分', async () => {
  const source = await readFile(new URL('../resource/Schedule/schedule.md', import.meta.url), 'utf8');
  const lines = source.split(/\r?\n/).filter(line => /^2026\./.test(line));
  assert.equal(D.archive.filter(row => row.activities.some(a => !/开售|预售|发售/.test(a.text))).length, lines.length);
  assert.equal(D.timeline.length, D.archive.reduce((sum, row) => sum + row.activities.filter(a => !/开售|预售|发售/.test(a.text)).length, 0));
  assert.equal(new Set(D.timeline.map(e => e.date)).size, lines.length);
  for (const line of lines) {
    const [, y, m, d, text] = line.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2})[：:](.+)$/);
    const record = D.archive.find(e => e.date === y + '-' + m.padStart(2,'0') + '-' + d.padStart(2,'0'));
    const clean = value => value.replace(/（[^（）]*）|\([^()]*\)/g, '').trim().replace(/从(.+?)前往(.+)/, '$1飞往$2');
    const visible = record.activities.filter(a => !/开售|预售|发售/.test(a.text));
    assert.equal(visible.map(a => clean(a.text)).join('；'), clean(text));
    assert.deepEqual(visible.map(a => clean(a.text)), text.split('；').map(clean));
    assert.ok(!record.sourcePage && !record.tentative);
  }
  assert.ok(!D.timeline.some(e => e.date === '2026-09-11'));
  assert.equal(D.events.length, 7);
});
test('新版时间表支持同日多类型及人物筛选', () => {
  const date = '2026-07-10';
  for (const category of ['magazine','social','live']) {
    assert.ok(U.filterSchedule({category, month:'2026-07'}).some(e => e.date === date));
  }
  assert.ok(U.filterSchedule({artist:'psw', category:'live'}).some(e => e.date === date));
  assert.equal(U.filterSchedule({query:'不存在的活动'}).length,0);
  assert.equal(U.filterSchedule({query:'费加罗',category:'magazine'}).length,1);
  assert.equal(U.filterSchedule({month:'2026-02'})[0].date,'2026-02-05');
  assert.equal(new Set(U.filterSchedule({month:'2026-09'}).map(e => e.date)).size,18);
  const day = U.filterSchedule({query:'2026-08-30'});
  assert.equal(day.length,4);
  assert.deepEqual(Array.from(day, e => e.artist), ['psw','kys','psw','kys']);
  assert.equal(U.filterSchedule({artist:'both', query:'2026-08-30'}).length,0);
  assert.equal(U.filterSchedule({artist:'kys', category:'live', query:'2026-08-30'}).length,0);
});
test('三本双人杂志与三份文字采访', async () => {
  assert.equal(D.magazines.length,3);
  assert.ok(D.magazines.every(m=>m.artist==='both'));
  const figaro=D.magazines.find(m=>m.id==='mag-figaro');
  const loading=D.magazines.find(m=>m.id==='mag-loading');
  assert.equal(figaro.interview.qa.length,11);
  assert.equal(figaro.interview.sections.length,2);
  assert.equal(loading.interview.qa.length,8);
  assert.equal(D.magazines.find(m=>m.id==='mag-powercircles').interview.qa.length,7);
  assert.ok(U.search('三植').some(m=>m.id==='mag-powercircles'));
  for(const m of D.magazines){
    assert.equal(m.gallery.length,11);
    await access(new URL('../'+m.interview.sourceText,import.meta.url));
  }
  assert.ok(U.search('poker face').some(m=>m.id==='mag-figaro'));
  assert.ok(U.search('桂林').some(m=>m.id==='mag-loading'));
});

test('直播对话与动作保留原稿顺序，头像和封面存在', async () => {
 const item=D.lives.find(l=>l.id==='live-0912');
 const raw=await readFile(new URL('../resource/Live/2026-09-12.md',import.meta.url),'utf8');
 const lines=raw.split(/\r?\n/).filter(l=>l.trim()&&!l.startsWith('#'));
 assert.equal(item.messages.length,lines.length);
 assert.deepEqual(item.messages.map(m=>m.text),lines.map(l=>l.replace(/^(?:\* )?(朴时宇|金允植)：/,'')));
 for(const avatar of Object.values(item.avatars)) await access(new URL('../'+avatar,import.meta.url));
 assert.ok(item.messages.some(m=>m.speaker==='action'));
});

test('七月直播完整保留原稿、续句与动作，独立头像和目录可用', async () => {
 const item=D.lives.find(l=>l.id==='live-0712');
 const raw=await readFile(new URL('../resource/Live/2026-07-12.md',import.meta.url),'utf8');
 const normalized=raw.replace(/([^\n\s*])((?:[01]|金允植|朴时宇)[：:])/g,'$1\n$2');
 const expected=normalized.split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>l.replace(/^(?:[01]|金允植|朴时宇)[：:]\s*/,'')).join('\n');
 assert.equal(item.messages.map(m=>m.text).join('\n'),expected);
 const speakers=normalized.split(/\r?\n/).filter(l=>/^(?:[01]|金允植|朴时宇)[：:]/.test(l)).map(l=>/^(?:1|金允植)/.test(l)?'kys':'psw');
 assert.deepEqual(item.messages.filter(m=>m.speaker!=='action').map(m=>m.speaker),speakers);
 for(const path of [item.image,...Object.values(item.avatars)]) await access(new URL('../'+path,import.meta.url));
 assert.ok(item.chapters.every((c,i)=>c.start>=0&&c.start<item.messages.length&&(i===0||c.start>item.chapters[i-1].start)));
 assert.equal(D.lives.length,4);
});

test('同一行的发言人标记拆为独立气泡', () => {
 const messages=D.lives.find(l=>l.id==='live-0712').messages;
 const index=messages.findIndex(m=>m.text==='剧里的脸，对不起。');
 assert.ok(index>0);
 assert.equal(messages[index].speaker,'psw');
 assert.equal(messages[index-1].speaker,'kys');
 assert.ok(!messages.some(m=>/[01][：:]/.test(m.text)));
});

test('所有直播与最新稿件一致', async()=>{for(const item of D.lives){const raw=await readFile(new URL('../'+item.transcriptFile,import.meta.url),'utf8');assert.equal(item.transcript,raw);const expected=raw.replace(/([^\n\s*])((?:[01]|金允植|朴时宇)[：:])/g,'$1\n$2').split(/\r?\n/).map(l=>l.trim()).filter(l=>l&&!l.startsWith('#')).map(l=>l.replace(/^(?:\*\s*)?(?:0|1|朴时宇|金允植)[：:]\s*/,'')).join('\n');assert.equal(item.messages.map(m=>m.text).join('\n'),expected);assert.ok(!/第[一二三四五六七八九十]+[集季]/.test(raw));}assert.equal(D.lives.find(l=>l.id==='live-0704').image, 'resource/Live/直播封面_2026-07-04.jpg');});

test('直播排序和八月直播资源、导航',async()=>{assert.deepEqual(D.lives.map(l=>l.date),['2026-09-12','2026-08-25','2026-07-12','2026-07-04']);const l=D.lives.find(l=>l.id==='live-0825');for(const p of Object.values(l.avatars))await access(new URL('../'+p,import.meta.url));assert.ok(l.chapters.every((c,i)=>c.start>=0&&c.start<l.messages.length&&(!i||c.start>l.chapters[i-1].start)));});

test('行程排除开售，保留本人参与的拍摄和签名会', () => {
  assert.ok(!D.timeline.some(e => /开售|预售|发售/.test(e.title)));
  assert.ok(D.timeline.some(e => e.title.includes('杂志拍摄')));
  assert.ok(D.timeline.some(e => e.title.includes('商务拍摄')));
  assert.ok(D.timeline.some(e => e.title.includes('视频签名会')));
});

test('作品分集文案和剧照同步，角色名统一', async () => {
  const work = D.works[0];
  const source = await readFile(new URL('../resource/Profile/检察官的提案.md', import.meta.url), 'utf8');
  assert.equal(work.episodes.length, 10);
  assert.equal(work.episodes.reduce((n,e)=>n+e.images.length,0),75);
  assert.ok(!/李彩河|李彩儿|李彩夏|李彩荷|周泰善|宋天空/.test(JSON.stringify(work)+source));
  for (const e of work.episodes) {
    assert.ok(source.includes(e.text));
    assert.ok(e.text.length >= 110 && e.text.length <= 230);
    for (const src of e.images) {
      assert.ok(src.startsWith('resource/Profile/剧照/'+e.number+'/'));
      await access(new URL('../'+src,import.meta.url));
    }
  }
  for(const c of work.characters) await access(new URL('../'+c.image,import.meta.url));
});
