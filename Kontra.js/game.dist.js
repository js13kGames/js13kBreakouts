(() => {
  // ZzFX.js
  function zzfx(...parameters) {
    return ZZFX.play(...parameters);
  }
  var ZZFX = {
    volume: 0.3,
    sampleRate: 44100,
    x: new (window.AudioContext || webkitAudioContext)(),
    play: function(...parameters) {
      return this.playSamples(this.buildSamples(...parameters));
    },
    playSamples: function(...samples) {
      const buffer = this.x.createBuffer(samples.length, samples[0].length, this.sampleRate);
      const source = this.x.createBufferSource();
      samples.map((d, i) => buffer.getChannelData(i).set(d));
      source.buffer = buffer;
      source.connect(this.x.destination);
      source.start();
      return source;
    },
    buildSamples: function(volume = 1, randomness = 0.05, frequency = 220, attack = 0, sustain = 0, release = 0.1, shape = 0, shapeCurve = 1, slide = 0, deltaSlide = 0, pitchJump = 0, pitchJumpTime = 0, repeatTime = 0, noise = 0, modulation = 0, bitCrush = 0, delay = 0, sustainVolume = 1, decay = 0, tremolo = 0) {
      const PI2 = Math.PI * 2;
      let sampleRate = this.sampleRate, sign = (v) => v > 0 ? 1 : -1, startSlide = slide *= 500 * PI2 / sampleRate / sampleRate, startFrequency = frequency *= (1 + randomness * 2 * Math.random() - randomness) * PI2 / sampleRate, b = [], t = 0, tm = 0, i = 0, j = 1, r = 0, c = 0, s = 0, f, length;
      attack = attack * sampleRate + 9;
      decay *= sampleRate;
      sustain *= sampleRate;
      release *= sampleRate;
      delay *= sampleRate;
      deltaSlide *= 500 * PI2 / sampleRate ** 3;
      modulation *= PI2 / sampleRate;
      pitchJump *= PI2 / sampleRate;
      pitchJumpTime *= sampleRate;
      repeatTime = repeatTime * sampleRate | 0;
      for (length = attack + decay + sustain + release + delay | 0; i < length; b[i++] = s) {
        if (!(++c % (bitCrush * 100 | 0))) {
          s = shape ? shape > 1 ? shape > 2 ? shape > 3 ? Math.sin((t % PI2) ** 3) : Math.max(Math.min(Math.tan(t), 1), -1) : 1 - (2 * t / PI2 % 2 + 2) % 2 : 1 - 4 * Math.abs(Math.round(t / PI2) - t / PI2) : Math.sin(t);
          s = (repeatTime ? 1 - tremolo + tremolo * Math.sin(PI2 * i / repeatTime) : 1) * sign(s) * Math.abs(s) ** shapeCurve * volume * this.volume * (i < attack ? i / attack : i < attack + decay ? 1 - (i - attack) / decay * (1 - sustainVolume) : i < attack + decay + sustain ? sustainVolume : i < length - delay ? (length - i - delay) / release * sustainVolume : 0);
          s = delay ? s / 2 + (delay > i ? 0 : (i < length - delay ? 1 : (length - i) / delay) * b[i - delay | 0] / 2) : s;
        }
        f = (frequency += slide += deltaSlide) * Math.cos(modulation * tm++);
        t += f - f * noise * (1 - (Math.sin(i) + 1) * 1e9 % 2);
        if (j && ++j > pitchJumpTime) {
          frequency += pitchJump;
          startFrequency += pitchJump;
          j = 0;
        }
        if (repeatTime && !(++r % repeatTime)) {
          frequency = startFrequency;
          slide = startSlide;
          j = j || 1;
        }
      }
      return b;
    },
    getNote: function(semitoneOffset = 0, rootNoteFrequency = 440) {
      return rootNoteFrequency * 2 ** (semitoneOffset / 12);
    }
  };

  // kontra.mjs
  var noop = () => {
  };
  var callbacks$2 = {};
  function on(event, callback) {
    callbacks$2[event] = callbacks$2[event] || [];
    callbacks$2[event].push(callback);
  }
  function emit(event, ...args) {
    (callbacks$2[event] || []).map((fn) => fn(...args));
  }
  var canvasEl;
  var context;
  var handler$1 = {
    get(target, key) {
      if (key == "_proxy")
        return true;
      return noop;
    }
  };
  function getCanvas() {
    return canvasEl;
  }
  function getContext() {
    return context;
  }
  function init$1(canvas, { contextless = false } = {}) {
    canvasEl = document.getElementById(canvas) || canvas || document.querySelector("canvas");
    if (contextless) {
      canvasEl = canvasEl || new Proxy({}, handler$1);
    }
    context = canvasEl.getContext("2d") || new Proxy({}, handler$1);
    context.imageSmoothingEnabled = false;
    emit("init");
    return { canvas: canvasEl, context };
  }
  var leadingSlash = /^\//;
  var trailingSlash = /\/$/;
  var dataMap = /* @__PURE__ */ new WeakMap();
  var imagePath = "";
  function getUrl(url, base) {
    return new URL(url, base).href;
  }
  function joinPath(base, url) {
    return [
      base.replace(trailingSlash, ""),
      base ? url.replace(leadingSlash, "") : url
    ].filter((s) => s).join("/");
  }
  function getExtension(url) {
    return url.split(".").pop();
  }
  function getName(url) {
    let name = url.replace("." + getExtension(url), "");
    return name.split("/").length == 2 ? name.replace(leadingSlash, "") : name;
  }
  var imageAssets = {};
  var dataAssets = {};
  function addGlobal() {
    if (!window.__k) {
      window.__k = {
        dm: dataMap,
        u: getUrl,
        d: dataAssets,
        i: imageAssets
      };
    }
  }
  function loadImage(url) {
    addGlobal();
    return new Promise((resolve, reject) => {
      let resolvedUrl, image, fullUrl;
      resolvedUrl = joinPath(imagePath, url);
      if (imageAssets[resolvedUrl])
        return resolve(imageAssets[resolvedUrl]);
      image = new Image();
      image.onload = function loadImageOnLoad() {
        fullUrl = getUrl(resolvedUrl, window.location.href);
        imageAssets[getName(url)] = imageAssets[resolvedUrl] = imageAssets[fullUrl] = this;
        emit("assetLoaded", this, url);
        resolve(this);
      };
      image.onerror = function loadImageOnError() {
        reject(
          resolvedUrl
        );
      };
      image.src = resolvedUrl;
    });
  }
  function degToRad(deg) {
    return deg * Math.PI / 180;
  }
  function rotatePoint(point, angle) {
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);
    return {
      x: point.x * cos - point.y * sin,
      y: point.x * sin + point.y * cos
    };
  }
  function movePoint(point, angle, distance) {
    return {
      x: point.x + Math.sin(angle) * distance,
      y: point.y - Math.cos(angle) * distance
    };
  }
  function randInt(min, max) {
    return (Math.random() * (max - min + 1) | 0) + min;
  }
  function clamp(min, max, value) {
    return Math.min(Math.max(min, value), max);
  }
  function getWorldRect(obj) {
    let { x = 0, y = 0, width, height } = obj.world || obj;
    if (obj.mapwidth) {
      width = obj.mapwidth;
      height = obj.mapheight;
    }
    if (obj.anchor) {
      x -= width * obj.anchor.x;
      y -= height * obj.anchor.y;
    }
    return {
      x,
      y,
      width,
      height
    };
  }
  var Vector = class {
    constructor(x = 0, y = 0, vec = {}) {
      this.x = x;
      this.y = y;
      if (vec._c) {
        this.clamp(vec._a, vec._b, vec._d, vec._e);
        this.x = x;
        this.y = y;
      }
    }
    add(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y, this);
    }
    length() {
      return Math.hypot(this.x, this.y);
    }
    clamp(xMin, yMin, xMax, yMax) {
      this._c = true;
      this._a = xMin;
      this._b = yMin;
      this._d = xMax;
      this._e = yMax;
    }
    get x() {
      return this._x;
    }
    get y() {
      return this._y;
    }
    set x(value) {
      this._x = this._c ? clamp(this._a, this._d, value) : value;
    }
    set y(value) {
      this._y = this._c ? clamp(this._b, this._e, value) : value;
    }
  };
  function factory$a() {
    return new Vector(...arguments);
  }
  var Updatable = class {
    constructor(properties) {
      return this.init(properties);
    }
    init(properties = {}) {
      this.position = factory$a();
      this.velocity = factory$a();
      this.ttl = Infinity;
      Object.assign(this, properties);
    }
    update(dt) {
      this.advance(dt);
    }
    advance(dt) {
      let velocity = this.velocity;
      this.position = this.position.add(velocity);
      this._pc();
      this.ttl--;
    }
    get dx() {
      return this.velocity.x;
    }
    get dy() {
      return this.velocity.y;
    }
    set dx(value) {
      this.velocity.x = value;
    }
    set dy(value) {
      this.velocity.y = value;
    }
    isAlive() {
      return this.ttl > 0;
    }
    _pc() {
    }
  };
  var GameObject = class extends Updatable {
    init({
      width = 0,
      height = 0,
      context: context2 = getContext(),
      render = this.draw,
      update = this.advance,
      anchor = { x: 0, y: 0 },
      opacity = 1,
      ...props
    } = {}) {
      super.init({
        width,
        height,
        context: context2,
        anchor,
        opacity,
        ...props
      });
      this._di = true;
      this._uw();
      this._rf = render;
      this._uf = update;
    }
    update(dt) {
      this._uf(dt);
    }
    render() {
      let context2 = this.context;
      context2.save();
      if (this.x || this.y) {
        context2.translate(this.x, this.y);
      }
      let anchorX = -this.width * this.anchor.x;
      let anchorY = -this.height * this.anchor.y;
      if (anchorX || anchorY) {
        context2.translate(anchorX, anchorY);
      }
      this.context.globalAlpha = this.opacity;
      this._rf();
      if (anchorX || anchorY) {
        context2.translate(-anchorX, -anchorY);
      }
      context2.restore();
    }
    draw() {
    }
    _pc() {
      this._uw();
    }
    get x() {
      return this.position.x;
    }
    get y() {
      return this.position.y;
    }
    set x(value) {
      this.position.x = value;
      this._pc();
    }
    set y(value) {
      this.position.y = value;
      this._pc();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._w = value;
      this._pc();
    }
    get height() {
      return this._h;
    }
    set height(value) {
      this._h = value;
      this._pc();
    }
    _uw() {
      if (!this._di)
        return;
      let {
        _wx = 0,
        _wy = 0,
        _wo = 1
      } = this.parent || {};
      this._wx = this.x;
      this._wy = this.y;
      this._ww = this.width;
      this._wh = this.height;
      this._wo = _wo * this.opacity;
    }
    get world() {
      return {
        x: this._wx,
        y: this._wy,
        width: this._ww,
        height: this._wh,
        opacity: this._wo
      };
    }
    get opacity() {
      return this._opa;
    }
    set opacity(value) {
      this._opa = value;
      this._pc();
    }
  };
  var Sprite = class extends GameObject {
    init({
      ...props
    } = {}) {
      super.init({
        ...props
      });
    }
    draw() {
      if (this.color) {
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height);
      }
    }
  };
  function factory$8() {
    return new Sprite(...arguments);
  }
  var fontSizeRegex = /(\d+)(\w+)/;
  function parseFont(font) {
    let match = font.match(fontSizeRegex);
    let size = +match[1];
    let unit = match[2];
    let computed = size;
    return {
      size,
      unit,
      computed
    };
  }
  var Text = class extends GameObject {
    init({
      text = "",
      textAlign = "",
      lineHeight = 1,
      font = getContext().font,
      ...props
    } = {}) {
      text = "" + text;
      super.init({
        text,
        textAlign,
        lineHeight,
        font,
        ...props
      });
      this._p();
    }
    get width() {
      return this._w;
    }
    set width(value) {
      this._d = true;
      this._w = value;
      this._fw = value;
    }
    get text() {
      return this._t;
    }
    set text(value) {
      this._d = true;
      this._t = "" + value;
    }
    get font() {
      return this._f;
    }
    set font(value) {
      this._d = true;
      this._f = value;
      this._fs = parseFont(value).computed;
    }
    get lineHeight() {
      return this._lh;
    }
    set lineHeight(value) {
      this._d = true;
      this._lh = value;
    }
    render() {
      if (this._d) {
        this._p();
      }
      super.render();
    }
    _p() {
      this._s = [];
      this._d = false;
      let context2 = this.context;
      context2.font = this.font;
      if (!this._s.length && this.text.includes("\n")) {
        let width = 0;
        this.text.split("\n").map((str) => {
          this._s.push(str);
          width = Math.max(width, context2.measureText(str).width);
        });
        this._w = this._fw || width;
      }
      if (!this._s.length) {
        this._s.push(this.text);
        this._w = this._fw || context2.measureText(this.text).width;
      }
      this.height = this._fs + (this._s.length - 1) * this._fs * this.lineHeight;
      this._uw();
    }
    draw() {
      let alignX = 0;
      let textAlign = this.textAlign;
      let context2 = this.context;
      textAlign = this.textAlign || (context2.canvas.dir == "rtl" ? "right" : "left");
      alignX = textAlign == "right" ? this.width : textAlign == "center" ? this.width / 2 | 0 : 0;
      this._s.map((str, index) => {
        context2.textBaseline = "top";
        context2.textAlign = textAlign;
        context2.fillStyle = this.color;
        context2.font = this.font;
        context2.fillText(
          str,
          alignX,
          this._fs * this.lineHeight * index
        );
      });
    }
  };
  function factory$7() {
    return new Text(...arguments);
  }
  var pointers = /* @__PURE__ */ new WeakMap();
  var callbacks$1 = {};
  var pressedButtons = {};
  var pointerMap = {
    0: "left",
    1: "middle",
    2: "right"
  };
  function getPointer(canvas = getCanvas()) {
    return pointers.get(canvas);
  }
  function circleRectCollision(object, pointer) {
    let { x, y, width, height } = getWorldRect(object);
    do {
      x -= object.sx || 0;
      y -= object.sy || 0;
    } while (object = object.parent);
    let dx = pointer.x - Math.max(x, Math.min(pointer.x, x + width));
    let dy = pointer.y - Math.max(y, Math.min(pointer.y, y + height));
    return dx * dx + dy * dy < pointer.radius * pointer.radius;
  }
  function getCurrentObject(pointer) {
    let renderedObjects = pointer._lf.length ? pointer._lf : pointer._cf;
    for (let i = renderedObjects.length - 1; i >= 0; i--) {
      let object = renderedObjects[i];
      let collides2 = object.collidesWithPointer ? object.collidesWithPointer(pointer) : circleRectCollision(object, pointer);
      if (collides2) {
        return object;
      }
    }
  }
  function getPropValue(style, value) {
    return parseFloat(style.getPropertyValue(value)) || 0;
  }
  function getCanvasOffset(pointer) {
    let { canvas, _s } = pointer;
    let rect = canvas.getBoundingClientRect();
    let transform = _s.transform != "none" ? _s.transform.replace("matrix(", "").split(",") : [1, 1, 1, 1];
    let transformScaleX = parseFloat(transform[0]);
    let transformScaleY = parseFloat(transform[3]);
    let borderWidth = (getPropValue(_s, "border-left-width") + getPropValue(_s, "border-right-width")) * transformScaleX;
    let borderHeight = (getPropValue(_s, "border-top-width") + getPropValue(_s, "border-bottom-width")) * transformScaleY;
    let paddingWidth = (getPropValue(_s, "padding-left") + getPropValue(_s, "padding-right")) * transformScaleX;
    let paddingHeight = (getPropValue(_s, "padding-top") + getPropValue(_s, "padding-bottom")) * transformScaleY;
    return {
      scaleX: (rect.width - borderWidth - paddingWidth) / canvas.width,
      scaleY: (rect.height - borderHeight - paddingHeight) / canvas.height,
      offsetX: rect.left + (getPropValue(_s, "border-left-width") + getPropValue(_s, "padding-left")) * transformScaleX,
      offsetY: rect.top + (getPropValue(_s, "border-top-width") + getPropValue(_s, "padding-top")) * transformScaleY
    };
  }
  function pointerDownHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = true;
    pointerHandler(evt, "onDown");
  }
  function pointerUpHandler(evt) {
    let button = evt.button != null ? pointerMap[evt.button] : "left";
    pressedButtons[button] = false;
    pointerHandler(evt, "onUp");
  }
  function mouseMoveHandler(evt) {
    pointerHandler(evt, "onOver");
  }
  function blurEventHandler$2(evt) {
    let pointer = pointers.get(evt.target);
    pointer._oo = null;
    pressedButtons = {};
  }
  function callCallback(pointer, eventName, evt) {
    let object = getCurrentObject(pointer);
    if (object && object[eventName]) {
      object[eventName](evt);
    }
    if (callbacks$1[eventName]) {
      callbacks$1[eventName](evt, object);
    }
    if (eventName == "onOver") {
      if (object != pointer._oo && pointer._oo && pointer._oo.onOut) {
        pointer._oo.onOut(evt);
      }
      pointer._oo = object;
    }
  }
  function pointerHandler(evt, eventName) {
    evt.preventDefault();
    let canvas = evt.target;
    let pointer = pointers.get(canvas);
    let { scaleX, scaleY, offsetX, offsetY } = getCanvasOffset(pointer);
    let isTouchEvent = evt.type.includes("touch");
    if (isTouchEvent) {
      Array.from(evt.touches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          if (!touch) {
            touch = pointer.touches[identifier] = {
              start: {
                x: (clientX - offsetX) / scaleX,
                y: (clientY - offsetY) / scaleY
              }
            };
            pointer.touches.length++;
          }
          touch.changed = false;
        }
      );
      Array.from(evt.changedTouches).map(
        ({ clientX, clientY, identifier }) => {
          let touch = pointer.touches[identifier];
          touch.changed = true;
          touch.x = pointer.x = (clientX - offsetX) / scaleX;
          touch.y = pointer.y = (clientY - offsetY) / scaleY;
          callCallback(pointer, eventName, evt);
          emit("touchChanged", evt, pointer.touches);
          if (eventName == "onUp") {
            delete pointer.touches[identifier];
            pointer.touches.length--;
            if (!pointer.touches.length) {
              emit("touchEnd");
            }
          }
        }
      );
    } else {
      pointer.x = (evt.clientX - offsetX) / scaleX;
      pointer.y = (evt.clientY - offsetY) / scaleY;
      callCallback(pointer, eventName, evt);
    }
  }
  function initPointer({
    radius = 5,
    canvas = getCanvas()
  } = {}) {
    let pointer = pointers.get(canvas);
    if (!pointer) {
      let style = window.getComputedStyle(canvas);
      pointer = {
        x: 0,
        y: 0,
        radius,
        touches: { length: 0 },
        canvas,
        _cf: [],
        _lf: [],
        _o: [],
        _oo: null,
        _s: style
      };
      pointers.set(canvas, pointer);
    }
    canvas.addEventListener("mousedown", pointerDownHandler);
    canvas.addEventListener("touchstart", pointerDownHandler);
    canvas.addEventListener("mouseup", pointerUpHandler);
    canvas.addEventListener("touchend", pointerUpHandler);
    canvas.addEventListener("touchcancel", pointerUpHandler);
    canvas.addEventListener("blur", blurEventHandler$2);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("touchmove", mouseMoveHandler);
    if (!pointer._t) {
      pointer._t = true;
      on("tick", () => {
        pointer._lf.length = 0;
        pointer._cf.map((object) => {
          pointer._lf.push(object);
        });
        pointer._cf.length = 0;
      });
    }
    return pointer;
  }
  function onPointer(direction, callback) {
    let eventName = direction[0].toUpperCase() + direction.substr(1);
    callbacks$1["on" + eventName] = callback;
  }
  function pointerPressed(button) {
    return !!pressedButtons[button];
  }
  function clear(context2) {
    let canvas = context2.canvas;
    context2.clearRect(0, 0, canvas.width, canvas.height);
  }
  function GameLoop({
    fps = 60,
    clearCanvas = true,
    update = noop,
    render,
    context: context2 = getContext(),
    blur = false
  } = {}) {
    let accumulator = 0;
    let delta = 1e3 / fps;
    let step = 1 / fps;
    let clearFn = clearCanvas ? clear : noop;
    let last, rAF, now, dt, loop;
    let focused = true;
    if (!blur) {
      window.addEventListener("focus", () => {
        focused = true;
      });
      window.addEventListener("blur", () => {
        focused = false;
      });
    }
    function frame() {
      rAF = requestAnimationFrame(frame);
      if (!focused)
        return;
      now = performance.now();
      dt = now - last;
      last = now;
      if (dt > 1e3) {
        return;
      }
      emit("tick");
      accumulator += dt;
      while (accumulator >= delta) {
        loop.update(step);
        accumulator -= delta;
      }
      clearFn(context2);
      loop.render();
    }
    loop = {
      update,
      render,
      isStopped: true,
      start() {
        last = performance.now();
        this.isStopped = false;
        requestAnimationFrame(frame);
      },
      stop() {
        this.isStopped = true;
        cancelAnimationFrame(rAF);
      }
    };
    return loop;
  }
  var gamepads = [];
  var gamepaddownCallbacks = {};
  var gamepadupCallbacks = {};
  var gamepadMap = {
    0: "south",
    1: "east",
    2: "west",
    3: "north",
    4: "leftshoulder",
    5: "rightshoulder",
    6: "lefttrigger",
    7: "righttrigger",
    8: "select",
    9: "start",
    10: "leftstick",
    11: "rightstick",
    12: "dpadup",
    13: "dpaddown",
    14: "dpadleft",
    15: "dpadright"
  };
  function gamepadConnectedHandler(event) {
    gamepads[event.gamepad.index] = {
      pressedButtons: {},
      axes: {}
    };
  }
  function gamepadDisconnectedHandler(event) {
    delete gamepads[event.gamepad.index];
  }
  function blurEventHandler$1() {
    gamepads.map((gamepad) => {
      gamepad.pressedButtons = {};
      gamepad.axes = {};
    });
  }
  function updateGamepad() {
    let pads = navigator.getGamepads ? navigator.getGamepads() : navigator.webkitGetGamepads ? navigator.webkitGetGamepads : [];
    for (let i = 0; i < pads.length; i++) {
      let gamepad = pads[i];
      if (!gamepad) {
        continue;
      }
      gamepad.buttons.map((button, index) => {
        let buttonName = gamepadMap[index];
        let { pressed } = button;
        let { pressedButtons: pressedButtons2 } = gamepads[gamepad.index];
        let state = pressedButtons2[buttonName];
        if (!state && pressed) {
          [
            gamepaddownCallbacks[gamepad.index],
            gamepaddownCallbacks
          ].map((callback) => {
            callback?.[buttonName]?.(gamepad, button);
          });
        } else if (state && !pressed) {
          [gamepadupCallbacks[gamepad.index], gamepadupCallbacks].map(
            (callback) => {
              callback?.[buttonName]?.(gamepad, button);
            }
          );
        }
        pressedButtons2[buttonName] = pressed;
      });
      let { axes } = gamepads[gamepad.index];
      axes.leftstickx = gamepad.axes[0];
      axes.leftsticky = gamepad.axes[1];
      axes.rightstickx = gamepad.axes[2];
      axes.rightsticky = gamepad.axes[3];
    }
  }
  function initGamepad() {
    window.addEventListener(
      "gamepadconnected",
      gamepadConnectedHandler
    );
    window.addEventListener(
      "gamepaddisconnected",
      gamepadDisconnectedHandler
    );
    window.addEventListener("blur", blurEventHandler$1);
    on("tick", updateGamepad);
  }
  function onGamepad(buttons, callback, { gamepad, handler = "gamepaddown" } = {}) {
    let callbacks2 = handler == "gamepaddown" ? gamepaddownCallbacks : gamepadupCallbacks;
    [].concat(buttons).map((button) => {
      if (isNaN(gamepad)) {
        callbacks2[button] = callback;
      } else {
        callbacks2[gamepad] = callbacks2[gamepad] || {};
        callbacks2[gamepad][button] = callback;
      }
    });
  }
  function gamepadAxis(name, gamepad) {
    return gamepads[gamepad]?.axes[name] || 0;
  }
  var callbacks = {};
  var currGesture;
  var init = false;
  var gestureMap = {
    swipe: {
      touches: 1,
      threshold: 10,
      touchend({ 0: touch }) {
        let x = touch.x - touch.start.x;
        let y = touch.y - touch.start.y;
        let absX = Math.abs(x);
        let absY = Math.abs(y);
        if (absX < this.threshold && absY < this.threshold)
          return;
        return absX > absY ? x < 0 ? "left" : "right" : y < 0 ? "up" : "down";
      }
    },
    pinch: {
      touches: 2,
      threshold: 2,
      touchstart({ 0: touch0, 1: touch1 }) {
        this.prevDist = Math.hypot(
          touch0.x - touch1.x,
          touch0.y - touch1.y
        );
      },
      touchmove({ 0: touch0, 1: touch1 }) {
        let dist = Math.hypot(touch0.x - touch1.x, touch0.y - touch1.y);
        if (Math.abs(dist - this.prevDist) < this.threshold)
          return;
        let dir = dist > this.prevDist ? "out" : "in";
        this.prevDist = dist;
        return dir;
      }
    }
  };
  function initGesture() {
    if (!init) {
      init = true;
      on("touchChanged", (evt, touches) => {
        Object.keys(gestureMap).map((name) => {
          let gesture = gestureMap[name];
          let type;
          if ((!currGesture || currGesture == name) && touches.length == gesture.touches && [...Array(touches.length).keys()].every(
            (key) => touches[key]
          ) && (type = gesture[evt.type]?.(touches) ?? "") && callbacks[name + type]) {
            currGesture = name;
            callbacks[name + type](evt, touches);
          }
        });
      });
      on("touchEnd", () => {
        currGesture = 0;
      });
    }
  }
  function onGesture(gestures, callback) {
    [].concat(gestures).map((gesture) => {
      callbacks[gesture] = callback;
    });
  }
  var keydownCallbacks = {};
  var keyupCallbacks = {};
  var pressedKeys = {};
  var keyMap = {
    Enter: "enter",
    Escape: "esc",
    Space: "space",
    ArrowLeft: "arrowleft",
    ArrowUp: "arrowup",
    ArrowRight: "arrowright",
    ArrowDown: "arrowdown"
  };
  function call(callback = noop, evt) {
    if (callback._pd) {
      evt.preventDefault();
    }
    callback(evt);
  }
  function keydownEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keydownCallbacks[key];
    pressedKeys[key] = true;
    call(callback, evt);
  }
  function keyupEventHandler(evt) {
    let key = keyMap[evt.code];
    let callback = keyupCallbacks[key];
    pressedKeys[key] = false;
    call(callback, evt);
  }
  function blurEventHandler() {
    pressedKeys = {};
  }
  function initKeys() {
    let i;
    for (i = 0; i < 26; i++) {
      keyMap["Key" + String.fromCharCode(i + 65)] = String.fromCharCode(
        i + 97
      );
    }
    for (i = 0; i < 10; i++) {
      keyMap["Digit" + i] = keyMap["Numpad" + i] = "" + i;
    }
    window.addEventListener("keydown", keydownEventHandler);
    window.addEventListener("keyup", keyupEventHandler);
    window.addEventListener("blur", blurEventHandler);
  }
  function onKey(keys, callback, { handler = "keydown", preventDefault = true } = {}) {
    let callbacks2 = handler == "keydown" ? keydownCallbacks : keyupCallbacks;
    callback._pd = preventDefault;
    [].concat(keys).map((key) => callbacks2[key] = callback);
  }
  function keyPressed(key) {
    return !!pressedKeys[key];
  }
  function contains(value, map) {
    return Object.values(map).includes(value);
  }
  function isGesture(value) {
    return Object.keys(gestureMap).some((name) => value.startsWith(name));
  }
  function initInput(options = {}) {
    initKeys();
    let pointer = initPointer(options.pointer);
    initGesture();
    initGamepad();
    return { pointer };
  }
  function onInput(inputs, callback, { gamepad, key } = {}) {
    [].concat(inputs).map((input) => {
      if (contains(input, gamepadMap)) {
        onGamepad(input, callback, gamepad);
      } else if (isGesture(input)) {
        onGesture(input, callback);
      } else if (contains(input, keyMap)) {
        onKey(input, callback, key);
      } else if (["down", "up"].includes(input)) {
        onPointer(input, callback);
      }
    });
  }

  // utils.js
  function roundRect(x, y, w, h, r, color) {
    let context2 = getContext();
    context2.fillStyle = color;
    context2.beginPath();
    context2.moveTo(x + r, y);
    context2.arcTo(x + w, y, x + w, y + h, r);
    context2.arcTo(x + w, y + h, x, y + h, r);
    context2.arcTo(x, y + h, x, y, r);
    context2.arcTo(x, y, x + w, y, r);
    context2.fill();
  }
  function circleRectCollision2(circle, rect) {
    let { x, y, width, height } = getWorldRect(rect);
    let dx = circle.x - clamp(x, x + width, circle.x);
    let dy = circle.y - clamp(y, y + height, circle.y);
    return dx * dx + dy * dy < circle.radius * circle.radius;
  }
  function vectorAngle(vector) {
    return Math.atan2(vector.y, vector.x) + Math.PI / 2;
  }
  function getSideOfCollision(ball, block) {
    let rect = getWorldRect(block);
    let isAboveAC = isOnUpperSideOfLine(
      { x: rect.x + rect.width, y: rect.y + rect.height },
      rect,
      ball
    );
    let isAboveDB = isOnUpperSideOfLine(
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x, y: rect.y + rect.height },
      ball
    );
    if (isAboveAC) {
      if (isAboveDB) {
        return { x: 0, y: -1 };
      } else {
        return { x: 1, y: 0 };
      }
    } else {
      if (isAboveDB) {
        return { x: -1, y: 0 };
      } else {
        return { x: 0, y: 1 };
      }
    }
  }
  function isOnUpperSideOfLine(corner1, oppositeCorner, ball) {
    return (oppositeCorner.x - corner1.x) * (ball.y - corner1.y) - (oppositeCorner.y - corner1.y) * (ball.x - corner1.x) > 0;
  }

  // gameObjects.js
  var usingKeyboard;
  var Paddle = class extends Sprite {
    constructor(props) {
      let canvas = getCanvas();
      let width = 231;
      let height = 53;
      super({
        ...props,
        type: 0,
        width,
        height,
        color: "#fff",
        anchor: { x: 0.5, y: 0.5 }
      });
      this.position.clamp(width / 2, 0, canvas.width - width / 2, canvas.height);
    }
    draw() {
      let { width, height, color } = this;
      roundRect(0, 0, width, height, 10, color);
    }
    update() {
      let pointer = getPointer();
      let axisX = gamepadAxis("leftstickx", 0);
      if (Math.abs(axisX) > 0.4) {
        this.x += axisX;
      }
      let keyboardDirection = keyPressed("arrowright") - keyPressed("arrowleft");
      if (keyboardDirection) {
        this.x += 38 * keyboardDirection;
        usingKeyboard = 1;
      } else if (!usingKeyboard || pointerPressed("left")) {
        this.x = pointer.x;
        usingKeyboard = 0;
      }
    }
  };
  var Block = class extends Sprite {
    constructor(props) {
      super({
        ...props,
        type: 1
      });
    }
    draw() {
      let { width, height, color } = this;
      roundRect(0, 0, width, height, 8, color);
    }
  };
  var Ball = class extends Sprite {
    constructor(props) {
      super({
        ...props,
        dy: 15,
        anchor: { x: 0.5, y: 0.5 },
        radius: 30
      });
    }
    draw() {
      let { context: context2, radius } = this;
      context2.fillStyle = "#fff";
      context2.beginPath();
      context2.arc(0, 0, radius, 0, 2 * Math.PI);
      context2.fill();
    }
    bounce() {
      zzfx(...[, , 1e3, , 0.03, 0.02, 1, 2, , , 940, 0.03, , , , , 0.2, 0.6, , 0.06]);
    }
  };

  // game.js
  async function main() {
    let maxLives = 3;
    let highScoreKey = "KontraJs_BreakoutHighScore";
    let ball, paddle, score, lives, bounceCount, isPlaying, usingKeyboard2, entities;
    let { canvas, context: context2 } = init$1();
    initInput();
    localStorage[highScoreKey] = localStorage[highScoreKey] || 0;
    let logoImage = await loadImage("logo.png");
    let mainText = factory$7({
      text: "Click to Play",
      font: "154px Arial",
      color: "white",
      x: canvas.width / 2,
      y: canvas.height / 2 + 76,
      anchor: { x: 0.5, y: 0.5 }
    });
    let secondaryText = factory$7({
      text: "High Score\n" + localStorage[highScoreKey],
      font: "77px Arial",
      color: "white",
      x: canvas.width / 2,
      y: canvas.height / 2 + 347,
      anchor: { x: 0.5, y: 0.5 },
      textAlign: "center"
    });
    let scoreText = factory$7({
      text: 0,
      font: "77px Arial",
      color: "white",
      x: 154,
      y: 111,
      anchor: { x: 0.5, y: 0.5 }
    });
    function startGame() {
      lives = maxLives;
      score = bounceCount = 0;
      isPlaying = 1;
      paddle = new Paddle({ x: 256, y: canvas.height - 111 });
      entities = [paddle];
      let startX = 12;
      let startY = 239;
      let height = 53;
      let width = 130;
      let padding = 24;
      let colors = ["#700e16", "#76111a", "#7d141d", "#831720", "#891a23", "#901d26", "#96202a", "#9b232d"];
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 7; col++) {
          let x = startX + col * (width + padding);
          let y = startY + row * (height + padding);
          entities.push(new Block({
            x,
            y,
            width,
            height,
            color: colors[row]
          }));
        }
      }
    }
    onInput(["down", "south", "enter", "space"], handleInput);
    function handleInput() {
      if (ball)
        return;
      if (!isPlaying)
        startGame();
      else if (!lives) {
        isPlaying = 0;
        entities = [];
      }
      if (isPlaying) {
        ball = new Ball({ x: canvas.width / 2, y: canvas.height / 2 });
        zzfx(...[, 0, 500, , 0.04, 0.3, 1, 2, , , 570, 0.02, 0.02, , , , 0.04]);
      }
    }
    function gameUpdate() {
      if (isPlaying) {
        if (ball) {
          let magnitude = ball.velocity.length();
          if (ball.y - ball.radius > canvas.height) {
            ball = 0;
            lives--;
            zzfx(...[1.31, , 154, 0.05, 0.3, 0.37, 1, 0.3, -9.9, -6.9, , , 0.11, , , 0.2, 0.02, 0.42, 0.16]);
          } else if (ball.x + ball.dx - ball.radius < 0 || ball.x + ball.dx + ball.radius > canvas.width) {
            ball.dx *= -1;
            ball.update();
            ball.bounce();
          } else if (ball.y + ball.dy - ball.radius < 0) {
            ball.dy *= -1;
            ball.update();
            ball.bounce();
          } else if (circleRectCollision2(ball, paddle)) {
            let radians = clamp(
              degToRad(-135),
              degToRad(-45),
              Math.atan2(ball.y - paddle.y, ball.x - paddle.x)
            );
            let { y } = rotatePoint(
              ball.velocity,
              radians
            );
            ball.dx = magnitude * Math.cos(radians);
            if (ball.y < paddle.y) {
              let dy = Math.max(Math.abs(y), 15);
              ball.dy = -clamp(0, 20, dy);
            }
            ball.update();
            ball.bounce();
            bounceCount = 0;
          } else {
            let step = ball.radius / 4;
            let accumulator = magnitude;
            let blocks = entities.filter((entity) => entity.type == 1);
            let pos = { x: ball.x, y: ball.y };
            while (accumulator > 0) {
              let { x, y } = movePoint(
                pos,
                vectorAngle(ball.velocity),
                accumulator > step ? step : accumulator
              );
              for (let i = 0, block; block = blocks[i]; i++) {
                if (circleRectCollision2(
                  { x, y, radius: ball.radius },
                  block
                )) {
                  blocks.splice(i, 1);
                  block.ttl = 0;
                  zzfx(...[, , 90, , 0.01, 0.03, 4, , , , , , , 9, 50, 0.2, , 0.2, 0.01]);
                  let rand = Math.random;
                  for (let j = randInt(20, 30); j--; ) {
                    entities.push(factory$8({
                      x: block.x + block.width / 2,
                      y: block.y + block.height / 2,
                      dx: (rand() < 0.5 ? 1 : -1) * (rand() * 8),
                      dy: (rand() < 0.5 ? 1 : -1) * (rand() * 8),
                      radius: randInt(15, 30),
                      opacity: rand(),
                      color: "#e8879c",
                      ttl: 60,
                      update() {
                        this.opacity = clamp(0, 1, this.opacity - 0.05);
                        this.advance();
                      },
                      render() {
                        let { context: context3, radius, color, alpha } = this;
                        context3.fillStyle = color;
                        context3.beginPath();
                        context3.arc(0, 0, radius, 0, Math.PI * 2);
                        context3.fill();
                      }
                    }));
                  }
                  let collision = getSideOfCollision(pos, block);
                  if (collision.y) {
                    ball.dy *= -1;
                  } else {
                    ball.dx *= -1;
                  }
                  score += ++bounceCount;
                  if (score > localStorage[highScoreKey])
                    localStorage[highScoreKey] = score;
                  break;
                }
              }
              pos.x = x;
              pos.y = y;
              accumulator -= step;
            }
            ball.x = pos.x;
            ball.y = pos.y;
          }
        }
        entities.map((entity) => entity.update());
        entities = entities.filter((entity) => entity.isAlive());
      }
    }
    function gameRender() {
      if (isPlaying) {
        entities.map((entity) => entity.render());
        if (ball)
          ball.render();
        scoreText.text = score;
        scoreText.render();
        for (let i = 0; i < maxLives; i++) {
          let color = i < lives ? "#fff" : "#4c4c4c";
          let size = 61;
          let padding = 16;
          let x = canvas.width / 2 - (size + size / 2 + padding) + i * (size + padding);
          roundRect(x, 81, size, size, 8, color);
          context2.fill();
        }
      } else {
        context2.drawImage(logoImage, canvas.width / 2 - logoImage.width / 2, 90);
      }
      if (!ball || !isPlaying) {
        mainText.text = lives || !isPlaying ? "Click to Play" : "Game Over";
        mainText.render();
      }
      if (!isPlaying)
        secondaryText.render();
    }
    let loop = GameLoop({
      update: gameUpdate,
      render: gameRender
    });
    loop.start();
  }
  main();
})();
