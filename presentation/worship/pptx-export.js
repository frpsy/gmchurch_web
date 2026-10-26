// 예배 슬라이드(JSON)를 PowerPoint(.pptx)로 내려받는다. 브라우저 안에서 PptxGenJS로 만든다.
// 화면(index.html)과 같은 배치 규칙을 쓰며, 슬라이드 높이를 100으로 본 단위(u)를 인치·pt로 옮긴다.
(() => {
  const W = 13.333;
  const H = 7.5;
  const U = H / 100; // 1u (인치)
  const PT = 5.4; // 1u의 글자 크기(pt): 슬라이드 높이 7.5in = 540pt의 1%
  const FONT = 'Malgun Gothic';
  const STAGES = ['모임', '말씀', '응답', '파송'];
  const SUBS = ['예물 준비', '성찬기도', '성체 나눔', '영성체'];
  const SYM = { p: '†', l: '○', a: '◎' };
  const COLOR = { fg: 'FFFFFF', muted: '9A9A9A', dim: '4A4A4A', accent: 'FFD866', resp: 'FFE9A3', panel: '161616', subBg: '2B2140', subText: 'B9AFCF' };
  const NAV_H = 7.5 * U;

  // 글자 수에 맞춰 크기를 줄인다(PowerPoint는 자동 줄임을 열 때 적용하지 않으므로 미리 계산한다)
  const fit = (text, maxPt, widthIn) => {
    const longest = Math.max(...String(text).split('\n').map(l => [...l].length), 1);
    return Math.max(24, Math.min(maxPt, Math.floor((widthIn * 72) / (longest * 1.02))));
  };

  // 글자 묶음이 영역(인치)에 들어가도록 모든 글자 크기를 같은 비율로 줄인다.
  // 한글 한 글자 ≈ 글자 크기, 한 줄 높이 ≈ 1.3배로 어림한다.
  const squeeze = (runs, widthIn, heightIn) => {
    const need = k => runs.reduce((h, r) => {
      const fs = r.options.fontSize * k;
      const lines = Math.max(1, Math.ceil(([...r.text].length * fs * 0.98) / (widthIn * 72)));
      return h + (lines * fs * 1.3 + (r.options.paraSpaceAfter || 0) * k) / 72;
    }, 0);
    let k = 1;
    while (k > 0.45 && need(k) > heightIn) k -= 0.04;
    return runs.map(r => ({ ...r, options: { ...r.options, lang: 'ko-KR', fontSize: Math.round(r.options.fontSize * k * 10) / 10, paraSpaceAfter: (r.options.paraSpaceAfter || 0) * k } }));
  };

  async function toData(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`그림을 불러오지 못했습니다: ${url}`);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  }
  const imgUrl = image => (/^https?:/.test(image) ? image : `../../${image}`);

  function addNav(slide, s) {
    const idx = STAGES.indexOf(s.stage);
    if (idx < 0) return 0;
    STAGES.forEach((n, i) => {
      slide.addShape('rect', { x: (W / 4) * i, y: H - NAV_H, w: W / 4, h: NAV_H, fill: { color: i === idx ? 'FFFFFF' : COLOR.panel }, line: { color: '000000', width: 1 } });
      slide.addText(n, { x: (W / 4) * i, y: H - NAV_H, w: W / 4, h: NAV_H, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 3.4 * PT, margin: 0, bold: i === idx, color: i === idx ? '000000' : i < idx ? COLOR.muted : COLOR.dim });
    });
    const si = SUBS.indexOf(s.sub);
    if (si < 0) return NAV_H;
    SUBS.forEach((n, i) => {
      slide.addShape('rect', { x: (W / 4) * i, y: H - NAV_H * 2, w: W / 4, h: NAV_H, fill: { color: i === si ? 'FFFFFF' : COLOR.subBg }, line: { color: '000000', width: 1 } });
      slide.addText(n, { x: (W / 4) * i, y: H - NAV_H * 2, w: W / 4, h: NAV_H, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 3.4 * PT, margin: 0, bold: i === si, color: i === si ? '000000' : COLOR.subText });
    });
    return NAV_H * 2;
  }

  // 대화 줄(r=p 사제, l 독서자, a 회중): 신호말은 흐리게, 응답은 크고 굵게
  const dialogRuns = lines => lines.flatMap(l => {
    const a = l.r === 'a';
    return [{ text: `${SYM[l.r]}  ${l.text}`, options: { breakLine: true, fontSize: a ? 7.4 * PT : 5 * PT, bold: a, color: a ? COLOR.fg : COLOR.muted, paraSpaceAfter: a ? 14 : 4 } }];
  });

  async function addSlide(pptx, s) {
    const slide = pptx.addSlide();
    slide.background = { color: '000000' };
    const chrome = addNav(slide, s);
    const areaH = H - chrome;
    const bodyW = W - 1.8;
    const bodyH = areaH - 0.8;
    const body = (runs, opt = {}) => slide.addText(Array.isArray(runs) ? squeeze(runs, bodyW, bodyH) : runs, { x: 0.9, y: 0.4, w: W - 1.8, h: areaH - 0.8, valign: 'middle', align: 'left', fontFace: FONT, color: COLOR.fg, margin: 0, lang: 'ko-KR', ...opt });
    const corner = label => label && slide.addText(label, { x: W - 5.5, y: areaH - 0.75, w: 5.1, h: 0.45, align: 'right', fontFace: FONT, fontSize: 3.4 * PT, color: COLOR.muted });

    switch (s.kind) {
    case 'notice': {
      if (s.image) {
        slide.addImage({ data: await toData(imgUrl(s.image)), x: 0, y: 0, w: W, h: H, altText: s.alt || '안내' });
        if (s.text) {
          const pos = s.pos || 'c';
          const size = { m: 8, l: 11, xl: 14 }[s.size || 'l'];
          const m = 5 * U;
          const bw = W * 0.8;
          const bh = H * 0.5;
          slide.addText(s.text, {
            x: pos[0] === 'l' ? m : pos[0] === 'r' ? W - m - bw : (W - bw) / 2,
            y: pos[1] === 't' ? m : pos[1] === 'b' ? H - m - bh : (H - bh) / 2,
            w: bw, h: bh, margin: 0,
            align: pos[0] === 'l' ? 'left' : pos[0] === 'r' ? 'right' : 'center',
            valign: pos[1] === 't' ? 'top' : pos[1] === 'b' ? 'bottom' : 'middle',
            fontFace: FONT, fontSize: size * PT, bold: true, color: COLOR.fg, shadow: { type: 'outer', blur: 8, offset: 2, angle: 90, color: '000000', opacity: 0.9 },
          });
        }
      } else {
        body(s.text, { align: 'center', fontSize: fit(s.text, 9 * PT, W - 1.8), bold: true });
      }
      break;
    }
    case 'theme': {
      if (s.image) {
        slide.addImage({ data: await toData(imgUrl(s.image)), x: 0, y: 0, w: W, h: areaH, sizing: { type: 'cover', w: W, h: areaH } });
        slide.addShape('rect', { x: 0, y: 0, w: W, h: areaH, fill: { color: '000000', transparency: 60 }, line: { type: 'none' } });
      }
      body([
        { text: s.title, options: { breakLine: true, fontSize: fit(s.title, 12 * PT, W - 1.8), bold: true } },
        ...(s.subtitle ? [{ text: s.subtitle, options: { fontSize: 8.6 * PT, bold: true, color: COLOR.accent } }] : []),
      ]);
      break;
    }
    case 'title': {
      body([
        { text: s.label, options: { breakLine: true, fontSize: 4.6 * PT, color: COLOR.muted, bold: true, paraSpaceAfter: 10 } },
        { text: s.text, options: { fontSize: fit(s.text, 14 * PT, W - 1.8), bold: true } },
      ], { align: 'center' });
      corner(s.caption);
      break;
    }
    case 'lyrics': {
      body(s.lines.map(l => ({ text: l.text, options: { breakLine: true, fontSize: 7 * PT, bold: true, paraSpaceAfter: 6 } })));
      corner(s.label);
      break;
    }
    case 'dialog':
      body(dialogRuns(s.lines));
      corner(s.label);
      break;
    case 'reading':
      body([
        { text: s.label, options: { breakLine: true, fontSize: 4.6 * PT, color: COLOR.muted, bold: true } },
        { text: s.ref, options: { breakLine: true, fontSize: fit(s.ref, 8 * PT, W - 1.8), bold: true, paraSpaceAfter: 28 } },
        ...dialogRuns(s.lines),
      ]);
      break;
    case 'psalm':
      body(s.lines.map(l => ({
        text: `${l.mark ? `${l.mark}  ` : '    '}${l.text}`,
        options: { breakLine: true, fontSize: 5.6 * PT, bold: true, color: l.mark === '○' ? COLOR.resp : COLOR.fg, indentLevel: 0, paraSpaceAfter: l.mark === '○' ? 12 : 3 },
      })));
      corner(s.label);
      break;
    default:
      break;
    }
  }

  // slides: 뷰어가 보여 주는 슬라이드 목록(그 주 안내 그림 포함), data: { date, title }
  window.buildWorshipPptx = async (data, slides, onProgress) => {
    const pptx = new window.PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in (16:9)
    pptx.title = data.title;
    pptx.author = '성공회 광명교회';
    pptx.company = '대한성공회 광명교회';
    for (let i = 0; i < slides.length; i++) {
      await addSlide(pptx, slides[i]);
      if (onProgress) onProgress(i + 1, slides.length);
    }
    await pptx.writeFile({ fileName: `예배슬라이드-${data.date.replaceAll('-', '')}.pptx` });
  };
})();
