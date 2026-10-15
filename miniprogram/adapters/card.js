function wrap(context, text, x, y, maxWidth, lineHeight) {
  let line = '';
  for (const character of text) {
    if (line && context.measureText(line + character).width > maxWidth) {
      context.fillText(line, x, y); y += lineHeight; line = '';
    }
    line += character;
  }
  if (line) {context.fillText(line, x, y); y += lineHeight;}
  return y;
}
function lineCount(context, text, maxWidth) {
  let line = '', count = 1;
  for (const character of text) {
    if (line && context.measureText(line + character).width > maxWidth) {count++; line = '';}
    line += character;
  }
  return count;
}
function createCard(page, date, views) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery().in(page).select('#departureCanvas').fields({node: true, size: true}).exec(results => {
      try {
        const canvas = results[0] && results[0].node;
        if (!canvas) throw new Error('画布尚未准备好');
        canvas.width = 750;
        const x = canvas.getContext('2d');
        const rows = views.map(view => {
          x.font = 'bold 25px sans-serif';
          const titleLines = lineCount(x, view.title, 646);
          x.font = '21px sans-serif';
          const detail = view.id === 'cookie' ? view.subtitle : view.action;
          const height = Math.max(172, 80 + titleLines * 32 + 5 + lineCount(x, detail, 646) * 26 + 20);
          return {view, detail, height};
        });
        const height = 300 + rows.reduce((total, row) => total + row.height + 20, 0) + 160;
        canvas.height = height;
        x.fillStyle = '#faf8f2'; x.fillRect(0, 0, 750, height);
        x.fillStyle = '#f7dc91'; x.fillRect(0, 0, 750, 260);
        x.fillStyle = '#292820'; x.font = 'bold 44px sans-serif';
        x.fillText(views.length === 7 ? '好运叠满，今天轮到你闪耀！' : '把今天的好运，装进口袋。', 36, 110);
        x.font = '24px sans-serif'; x.fillStyle = '#8a7452';
        x.fillText(`${date}  /  霸服  /  ${views.length} 份 Buff`, 36, 170);
        x.fillText('玄学负责气氛，你负责人生。', 36, 218);
        let y = 290;
        rows.forEach(({view, detail, height: rowHeight}) => {
          x.fillStyle = view.tint; x.fillRect(30, y, 690, rowHeight);
          x.fillStyle = view.tone; x.font = 'bold 23px sans-serif'; x.fillText(view.name, 52, y + 38);
          x.fillStyle = '#292820'; x.font = 'bold 25px sans-serif';
          const end = wrap(x, view.title, 52, y + 80, 646, 32);
          x.font = '21px sans-serif'; x.fillStyle = '#726c60';
          wrap(x, detail, 52, Math.max(y + 120, end + 5), 646, 26);
          y += rowHeight + 20;
        });
        x.fillStyle = '#7d59a8'; x.font = 'bold 28px sans-serif';
        x.fillText('接下来的主场，交给你。', 36, height - 90);
        x.fillStyle = '#8a8376'; x.font = '22px sans-serif';
        x.fillText('好运是个好开头，行动才是真正的加成。', 36, height - 44);
        wx.canvasToTempFilePath({canvas, width: 750, height, destWidth: 750, destHeight: height,
          fileType: 'png', success: result => resolve(result.tempFilePath), fail: reject}, page);
      } catch (error) {reject(error);}
    });
  });
}
module.exports = {createCard};
