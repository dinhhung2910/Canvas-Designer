const arrowHandler = {
  ismousedown: false,
  prevX: 0,
  prevY: 0,
  arrowSize: 10,
  mousedown: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    t.prevX = x;
    t.prevY = y;

    t.ismousedown = true;
  },
  mouseup: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;
    if (t.ismousedown) {
      points[points.length] = [
        'arrow',
        [t.prevX, t.prevY, x, y],
        drawHelper.getOptions(),
      ];

      t.ismousedown = false;
    }
  },
  mousemove: function(e) {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;

    const t = this;

    if (t.ismousedown) {
      tempContext.clearRect(0, 0, innerWidth, innerHeight);

      drawHelper.arrow(tempContext, [t.prevX, t.prevY, x, y]);
    }
  },
};
