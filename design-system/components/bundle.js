/* @ds-bundle: {"format":4,"namespace":"NousDeux","components":[{"name":"Button"},{"name":"Pill"},{"name":"PillGroup"},{"name":"Avatar"},{"name":"AvatarPair"},{"name":"CategoryTile"},{"name":"EventCard"},{"name":"DayStrip"},{"name":"BillCard"},{"name":"PaydayCard"},{"name":"TodoItem"},{"name":"DishCard"},{"name":"MatchSticker"},{"name":"Buddy"},{"name":"Sticker"},{"name":"StickerStack"},{"name":"HeroCard"},{"name":"PiggyBank"},{"name":"PlantCard"},{"name":"PlantBuddy"},{"name":"RecipeRow"},{"name":"SwipeDeck"},{"name":"RecipeView"},{"name":"WhoDoesItGame"},{"name":"FoodItem"},{"name":"StatTile"},{"name":"BarChart"},{"name":"LineChart"},{"name":"SplitBar"},{"name":"RankedBars"},{"name":"DivergingBars"},{"name":"CalendarHeatmap"},{"name":"GaugeTile"},{"name":"ChatThread"},{"name":"TabBar"},{"name":"Icon"}]} */
(function () {
  var React = window.React, h = React.createElement, useState = React.useState;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  var PATHS = {
    home: ["M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"],
    calendar: ["M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z", "M3 10h18", "M8 3v4", "M16 3v4"],
    plus: ["M12 5v14", "M5 12h14"],
    wallet: ["M3 8a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z", "M3 9h18", "M15 14.5h2"],
    chat: ["M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5 4v-4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"],
    heart: ["M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"],
    check: ["M5 12.5l4.5 4.5L19 7.5"],
    x: ["M6 6l12 12", "M18 6 6 18"],
    cart: ["M3 4h2.2l2.3 10.5h10.3L20 8H6.4", "M9 19.5h.01", "M17 19.5h.01"],
    meal: ["M7 3v7", "M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3", "M7 10v11", "M17 21V3c-2.2 1.6-3 4.4-3 7.5V13h3"],
    send: ["M12 19V5", "M6 11l6-6 6 6"],
    clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
    lock: ["M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z", "M8 11V8a4 4 0 0 1 8 0v3"],
    chevron: ["M9 6l6 6-6 6"],
    minus: ["M5 12h14"],
    sparkle: ["M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"]
  };
  function Icon(p) {
    var d = PATHS[p.name] || [];
    return h("svg", { className: cx("nd-icon", p.size === "sm" && "nd-icon-sm", p.className), viewBox: "0 0 24 24", "aria-hidden": p.label ? undefined : "true", role: p.label ? "img" : undefined, "aria-label": p.label },
      d.map(function (x, i) { return h("path", { key: i, d: x }); }));
  }

  function Button(p) {
    var rest = omit(p, ["variant", "size", "icon", "children", "className"]);
    return h("button", Object.assign({ type: "button" }, rest, { className: cx("nd-btn", "nd-btn-" + (p.variant || "primary"), p.size === "lg" && "nd-btn-lg", p.className) }),
      p.icon ? h(Icon, { name: p.icon, size: "sm" }) : null, p.children);
  }

  function Pill(p) {
    var rest = omit(p, ["selected", "children", "className", "icon"]);
    return h("button", Object.assign({ type: "button" }, rest, { className: cx("nd-pill", p.className), "aria-pressed": p.selected ? "true" : "false" }), p.icon ? h(Icon, { name: p.icon, size: "sm" }) : null, p.children);
  }
  function PillGroup(p) {
    var s = useState(p.defaultValue != null ? p.defaultValue : (p.options[0] && p.options[0].value));
    var value = p.value != null ? p.value : s[0];
    return h("div", { className: "nd-pill-group", role: "group", "aria-label": p.label },
      p.options.map(function (o) {
        return h(Pill, { key: o.value, selected: o.value === value, onClick: function () { s[1](o.value); p.onChange && p.onChange(o.value); } }, o.label);
      }));
  }

  function initials(n) { return (n || "?").split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); }
  function Avatar(p) {
    var sz = p.size || 36;
    return h("span", { className: cx("nd-avatar", "nd-avatar-" + (p.partner || "a")), style: { width: sz, height: sz, fontSize: Math.round(sz * 0.38) }, title: p.name, "aria-label": p.name, role: "img" }, initials(p.name));
  }
  function AvatarPair(p) {
    return h("span", { className: "nd-avatar-pair" }, h(Avatar, { name: p.a, partner: "a", size: p.size }), h(Avatar, { name: p.b, partner: "b", size: p.size }));
  }

  function CategoryTile(p) {
    return h("button", { type: "button", className: cx("nd-tile", "nd-tone-" + (p.tone || "lavande")), onClick: p.onClick },
      h("span", { className: "nd-tile-title" }, p.title),
      p.count != null ? h("span", { className: "nd-tile-count" }, p.count) : null);
  }

  var WHO_TONE = { a: "lavande", b: "peche", nous: "rose" };
  function EventCard(p) {
    var tone = p.tone || WHO_TONE[p.who || "nous"];
    var date = p.dow ? h("div", { className: "nd-event-date" }, p.dow, h("b", null, p.today ? h("span", { className: "nd-today" }, p.day) : p.day)) : h("div");
    var who = p.who === "nous" ? h(AvatarPair, { a: p.names && p.names[0], b: p.names && p.names[1], size: 32 })
      : p.who ? h(Avatar, { name: p.names && p.names[p.who === "a" ? 0 : 1], partner: p.who, size: 32 }) : null;
    return h("div", { className: "nd-event" }, date,
      h("div", { className: cx("nd-event-card", "nd-tone-" + tone) },
        h("div", null, h("p", { className: "nd-event-title" }, p.title), p.meta ? h("div", { className: "nd-event-meta" }, p.meta) : null),
        who));
  }

  function DayStrip(p) {
    var s = useState(p.selected);
    return h("div", { className: "nd-days", role: "group", "aria-label": "Semaine" },
      p.days.map(function (d) {
        return h("div", { key: d.day },
          h("div", { className: "nd-day-dow" }, d.dow),
          h("button", { type: "button", className: "nd-day-num", "aria-current": d.day === s[0] ? "date" : undefined, "aria-label": (d.label || d.dow + " " + d.day) + (d.who && d.who.length ? ", " + d.who.length + " événement" + (d.who.length > 1 ? "s" : "") : ""), onClick: function () { s[1](d.day); p.onSelect && p.onSelect(d.day); } }, d.day),
          h("div", { className: "nd-day-dots" }, (d.who || []).map(function (w, i) { return h("i", { key: i, style: { background: "var(--" + (w === "a" ? "partner-a" : w === "b" ? "partner-b" : "heart") + ")" } }); })));
      }));
  }

  var STATUS = { paid: "Payé", unpaid: "À payer", soon: "Bientôt", late: "En retard" };
  function BillCard(p) {
    var st = p.status || "unpaid";
    return h("div", { className: "nd-money" },
      h("div", { className: "nd-money-row" },
        h("div", null, h("div", { className: "nd-money-label" }, p.label), h("div", { className: "nd-money-amount" }, p.amount)),
        h("span", { className: cx("nd-status", "nd-status-" + st) }, st === "paid" ? h(Icon, { name: "check", size: "sm" }) : null, p.statusText || STATUS[st])),
      p.children);
  }
  function PaydayCard(p) {
    var bars = [];
    for (var i = 0; i < p.total; i++) bars.push(h("i", { key: i, className: i < p.elapsed ? "on" : "" }));
    var left = p.total - p.elapsed;
    return h("div", { className: "nd-money" },
      h("div", { className: "nd-payday-title" }, p.title || (left + " jours avant la paie")),
      h("div", { className: "nd-payday-bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": p.total, "aria-valuenow": p.elapsed, "aria-label": "Jours écoulés" }, bars));
  }

  function TodoItem(p) {
    var s = useState(!!p.done);
    var done = p.done != null && p.onToggle ? p.done : s[0];
    return h("div", { className: "nd-todo", "data-done": done ? "true" : "false" },
      h("button", { type: "button", className: "nd-check", role: "checkbox", "aria-checked": done ? "true" : "false", "aria-label": p.title,
        onClick: function () { s[1](!done); p.onToggle && p.onToggle(!done); } }, done ? h(Icon, { name: "check", size: "sm" }) : null),
      h("div", { className: "nd-todo-body" },
        h("div", { className: "nd-todo-title" }, p.title),
        p.note ? h("div", { className: "nd-todo-note" }, p.note) : null,
        p.points ? h("span", { className: "nd-points" }, p.points) : null),
      p.assignee ? h(Avatar, { name: p.assignee.name, partner: p.assignee.partner, size: 30 }) : null);
  }

  function DishCard(p) {
    return h("div", null,
      h("div", { className: "nd-dish" },
        h("div", { className: cx("nd-dish-visual", "nd-tone-" + (p.tone || "peche")) }, p.image ? h("img", { src: p.image, alt: "" }) : h("span", { "aria-hidden": "true" }, p.emoji || foodEmoji(p.name))),
        h("div", { className: "nd-dish-body" },
          h("p", { className: "nd-dish-name" }, p.name),
          p.tags ? h("div", { className: "nd-dish-tags" }, p.tags.map(function (t) { return h("span", { key: t }, t); })) : null)),
      p.onNo || p.onYes || p.actions !== false ? h("div", { className: "nd-swipe" },
        h("button", { type: "button", className: "nd-swipe-btn nd-swipe-no", "aria-label": "Pas envie", onClick: p.onNo }, h(Icon, { name: "x" })),
        h("button", { type: "button", className: "nd-swipe-btn nd-swipe-yes", "aria-label": "J'ai envie", onClick: p.onYes }, h(Icon, { name: "heart" }))) : null);
  }




  /* ---------- Food emoji ---------- */
  var FOOD = [
    ["riz au lait","🍮"],["riz","🍚"],["risotto","🍚"],["sushi","🍣"],["maki","🍣"],["ramen","🍜"],["nouilles","🍜"],["pho","🍜"],["pâtes","🍝"],["pates","🍝"],["spaghetti","🍝"],["lasagne","🍝"],["tagliatelle","🍝"],["carbonara","🍝"],["pizza","🍕"],["burger","🍔"],["hamburger","🍔"],["frites","🍟"],["hot dog","🌭"],["saucisse","🌭"],["sandwich","🥪"],["tacos","🌮"],["burrito","🌯"],["kebab","🥙"],["falafel","🧆"],["salade","🥗"],["soupe","🍲"],["velouté","🍲"],["pot-au-feu","🍲"],["curry","🍛"],["dahl","🍛"],["couscous","🥘"],["tajine","🥘"],["paella","🥘"],["fondue","🫕"],["raclette","🧀"],["fromage","🧀"],["quiche","🥧"],["tarte","🥧"],["poulet","🍗"],["dinde","🍗"],["steak","🥩"],["boeuf","🥩"],["bœuf","🥩"],["viande","🥩"],["agneau","🍖"],["côtelette","🍖"],["bacon","🥓"],["jambon","🥓"],["poisson","🐟"],["saumon","🐟"],["thon","🐟"],["cabillaud","🐟"],["crevette","🍤"],["moules","🦪"],["huître","🦪"],["crabe","🦀"],["homard","🦞"],["omelette","🍳"],["oeufs","🥚"],["œufs","🥚"],["oeuf","🥚"],["œuf","🥚"],["crêpe","🥞"],["crepe","🥞"],["pancake","🥞"],["gaufre","🧇"],["croissant","🥐"],["baguette","🥖"],["pain","🍞"],["brioche","🍞"],["bagel","🥯"],["gâteau","🍰"],["gateau","🍰"],["cookie","🍪"],["biscuit","🍪"],["chocolat","🍫"],["glace","🍨"],["donut","🍩"],["beignet","🍩"],["miel","🍯"],["dumpling","🥟"],["ravioli","🥟"],["nem","🥟"],["bento","🍱"],["popcorn","🍿"],["yaourt","🥛"],["lait","🥛"],["café","☕"],["cafe","☕"],["thé","🍵"],["the vert","🍵"],["jus","🧃"],["eau","💧"],["vin","🍷"],["bière","🍺"],["biere","🍺"],["champagne","🥂"],["banane","🍌"],["pomme de terre","🥔"],["patate","🥔"],["pomme","🍎"],["poire","🍐"],["orange","🍊"],["clémentine","🍊"],["mandarine","🍊"],["citron","🍋"],["fraise","🍓"],["framboise","🫐"],["myrtille","🫐"],["cerise","🍒"],["pêche","🍑"],["abricot","🍑"],["raisin","🍇"],["pastèque","🍉"],["melon","🍈"],["ananas","🍍"],["mangue","🥭"],["kiwi","🥝"],["noix de coco","🥥"],["avocat","🥑"],["tomate","🍅"],["aubergine","🍆"],["carotte","🥕"],["maïs","🌽"],["mais","🌽"],["piment","🌶️"],["poivron","🫑"],["concombre","🥒"],["courgette","🥒"],["brocoli","🥦"],["chou","🥬"],["épinard","🥬"],["laitue","🥬"],["champignon","🍄"],["oignon","🧅"],["ail","🧄"],["haricot","🫘"],["lentille","🫘"],["pois chiche","🫘"],["cacahuète","🥜"],["noix","🌰"],["amande","🌰"],["beurre","🧈"],["sel","🧂"],["olive","🫒"],["gingembre","🫚"],["farine","🌾"],["céréales","🥣"],["muesli","🥣"],["porridge","🥣"]
  ];
  function norm(s) { return (s || "").toLowerCase(); }
  function foodEmoji(name, fallback) {
    var n = norm(name);
    for (var i = 0; i < FOOD.length; i++) { if (new RegExp("(^|[^a-zà-ÿœ])" + FOOD[i][0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(s|x)?($|[^a-zà-ÿœ])").test(n)) return FOOD[i][1]; }
    return fallback || "🍽️";
  }
  function FoodItem(p) {
    var s = useState(!!p.done), done = p.done != null && p.onToggle ? p.done : s[0];
    return h("div", { className: "nd-food", "data-done": done ? "true" : "false" },
      h("span", { className: cx("nd-food-emoji", "nd-tone-" + (p.tone || "neutre")), "aria-hidden": "true" }, p.emoji || foodEmoji(p.name)),
      h("div", { className: "nd-food-body" }, h("div", { className: "nd-food-name" }, p.name), p.qty ? h("div", { className: "nd-food-qty" }, p.qty) : null),
      p.checkable === false ? null : h("button", { type: "button", className: "nd-check", role: "checkbox", "aria-checked": done ? "true" : "false", "aria-label": (done ? "Retirer la coche : " : "Cocher : ") + p.name,
        onClick: function () { s[1](!done); p.onToggle && p.onToggle(!done); } }, done ? h(Icon, { name: "check", size: "sm" }) : null));
  }

  /* ---------- Charts (style Nous deux : pilules, pastels, stickers) ---------- */
  function nice(max, n) {
    n = n || 4; if (max <= 0) return { max: 1, ticks: [0, 1] };
    var raw = max / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = mag * ([1, 2, 2.5, 5, 10].filter(function (m) { return m * mag >= raw; })[0]);
    var top = Math.ceil(max / step) * step, t = []; for (var v = 0; v <= top + 1e-9; v += step) t.push(Math.round(v * 100) / 100);
    return { max: top, ticks: t };
  }
  function money(v, unit) { unit = unit == null ? "€" : unit; return (Math.round(v * 100) / 100).toLocaleString("fr-FR") + (unit ? " " + unit : ""); }
  function compact(v) { return Math.abs(v) >= 1000 ? (Math.round(v / 100) / 10).toLocaleString("fr-FR") + " k" : Math.round(v).toLocaleString("fr-FR"); }
  function colOf(c, i) { return "var(--" + (c || "data-" + (i + 1)) + ")"; }
  function pillV(x, y, w, hh) { var r = Math.min(w / 2, hh / 2); return "M" + x + " " + (y + r) + "a" + r + " " + r + " 0 0 1 " + w + " 0V" + (y + hh - r) + "a" + r + " " + r + " 0 0 1 -" + w + " 0z"; }
  function smooth(pts) {
    var d = "M" + pts[0][0] + " " + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6) + " " + (p1[1] + (p2[1] - p0[1]) / 6) + " " + (p2[0] - (p3[0] - p1[0]) / 6) + " " + (p2[1] - (p3[1] - p1[1]) / 6) + " " + p2[0] + " " + p2[1];
    }
    return d;
  }
  var uid = 0;
  var TONE_FILL = { lavande: "data-1", peche: "data-2", menthe: "data-3", rose: "data-5", beurre: "data-6", lilas: "data-5", citron: "data-6" };

  function Legend(p) {
    return h("ul", { className: "nd-legend" }, p.items.map(function (it, i) {
      return h("li", { key: i }, it.who ? h(Avatar, { name: it.name, partner: it.who, size: 22 }) : h("span", { className: cx("nd-key", it.line && "line"), style: { background: it.color } }), it.name);
    }));
  }
  function ChartFrame(p) {
    var st = useState(false), id = useState(function () { return "ndc" + (++uid); })[0];
    var tip = p.tip;
    return h("figure", { className: cx("nd-chart", p.deco && "nd-chart-deco-" + p.deco), "aria-labelledby": id + "-t" },
      p.deco ? h("svg", { className: "nd-chart-blob", viewBox: "0 0 100 100", "aria-hidden": "true" }, h("path", { d: "M50 4c10 0 14 12 22 16s22 2 24 12-8 16-8 26 10 18 2 26-20 0-28 6-14 10-24 6-6-16-14-22-22-4-24-14 10-14 10-24-8-20 2-26 18 2 26-2S40 4 50 4z" })) : null,
      h("div", { className: "nd-chart-head" },
        p.emoji ? h("span", { className: "nd-chart-emoji", "aria-hidden": "true" }, p.emoji) : null,
        h("div", { className: "nd-chart-titles" }, h("figcaption", { id: id + "-t", className: "nd-chart-title" }, p.title), p.subtitle ? h("p", { className: "nd-chart-sub" }, p.subtitle) : null),
        p.table ? h("button", { type: "button", className: "nd-chart-toggle", "aria-expanded": st[0] ? "true" : "false", "aria-controls": id + "-tb", onClick: function () { st[1](!st[0]); } }, st[0] ? "Graphique" : "Tableau") : null),
      p.headline && !st[0] ? h("div", { className: "nd-chart-headline" }, h("span", { className: "nd-chart-big" }, p.headline), p.badge ? h(Sticker, { tone: p.badge.tone || "citron", size: "sm", rotate: -5 }, p.badge.text) : null) : null,
      p.legend && p.legend.length > 1 && !st[0] ? h(Legend, { items: p.legend }) : null,
      st[0] && p.table ? h("div", { id: id + "-tb", className: "nd-chart-table" },
        h("table", null, h("caption", { className: "nd-sr" }, p.title),
          h("thead", null, h("tr", null, p.table.cols.map(function (c, i) { return h("th", { key: i, scope: "col" }, c); }))),
          h("tbody", null, p.table.rows.map(function (r, i) { return h("tr", { key: i }, r.map(function (c, j) { return j === 0 ? h("th", { key: j, scope: "row" }, c) : h("td", { key: j }, c); })); }))))
        : h("div", { className: "nd-chart-plot", id: id + "-tb" }, p.children,
          tip ? h("div", { className: "nd-tip", role: "status", style: { left: tip.x + "%", top: tip.y + "%" } }, tip.content) : null),
      p.footer && !st[0] ? h("div", { className: "nd-chart-foot" }, p.footer) : null);
  }
  function useTip() { return useState(null); }
  function markProps(setTip, x, y, content, label) {
    var show = function () { setTip({ x: x, y: y, content: content }); }, hide = function () { setTip(null); };
    return { tabIndex: 0, role: "img", "aria-label": label, onMouseEnter: show, onMouseLeave: hide, onFocus: show, onBlur: hide, className: "nd-mark" };
  }
  function MonthPills(p) {
    return h("div", { className: "nd-xpills", "aria-hidden": "true", style: { gridTemplateColumns: "repeat(" + p.labels.length + ",1fr)" } }, p.labels.map(function (l, i) { return h("span", { key: i, className: i === p.current ? "on" : "" }, l); }));
  }

  function BarChart(p) {
    var t = useTip(), series = p.series || [{ name: p.title }], W = 320, H = 170, T = 34, unit = p.unit, n = series.length;
    var max = 0; p.data.forEach(function (d) { d.values.forEach(function (v) { max = Math.max(max, v); }); });
    var band = W / p.data.length, bw = n > 1 ? 12 : 18, gap = 4, gw = n * bw + (n - 1) * gap, cur = p.current != null ? p.current : p.data.length - 1;
    var y = function (v) { return T + (H - T) * (1 - v / max); };
    var peak = null; p.data.forEach(function (d, i) { d.values.forEach(function (v, j) { if (!peak || v > peak.v) peak = { v: v, i: i, j: j }; }); });
    var total = 0; p.data[cur].values.forEach(function (v) { total += v; });
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji, deco: p.deco || "lavande", tip: t[0], headline: p.headline || money(total, unit), badge: p.badge,
      legend: series.map(function (s, i) { return { name: s.name, who: s.who, color: colOf(s.color, i) }; }),
      table: { cols: [p.xLabel || "Mois"].concat(series.map(function (s) { return s.name; })), rows: p.data.map(function (d) { return [d.label].concat(d.values.map(function (v) { return money(v, unit); })); }) } },
      h("svg", { viewBox: "0 0 " + W + " " + H, className: "nd-svg", role: "group", "aria-label": p.summary || p.title },
        p.data.map(function (d, i) {
          var gx = band * i + (band - gw) / 2;
          return h("g", { key: i },
            h("path", { className: "nd-track", d: pillV(gx - 4, 8, gw + 8, H - 8) }),
            d.values.map(function (v, j) {
              var x = gx + j * (bw + gap), yy = y(v), lab = d.label + ", " + series[j].name + " : " + money(v, unit);
              return h("path", Object.assign(markProps(t[1], (x + bw / 2) / W * 100, yy / H * 100, lab, lab), { key: j, d: pillV(x, yy, bw, H - yy), fill: colOf(series[j].color, j) }));
            }));
        }),
        peak ? h("g", { className: "nd-peak", "aria-hidden": "true" }, h("rect", { x: band * peak.i + band / 2 - 22, y: y(peak.v) - 30, width: 44, height: 22, rx: 11, transform: "rotate(-6 " + (band * peak.i + band / 2) + " " + (y(peak.v) - 19) + ")" }), h("text", { x: band * peak.i + band / 2, y: y(peak.v) - 15, textAnchor: "middle", transform: "rotate(-6 " + (band * peak.i + band / 2) + " " + (y(peak.v) - 19) + ")" }, compact(peak.v))) : null),
      h(MonthPills, { labels: p.data.map(function (d) { return d.label; }), current: cur }));
  }

  function LineChart(p) {
    var t = useTip(), series = p.series, W = 320, H = 170, T = 24, B = 10, X0 = 10, X1 = 310, unit = p.unit;
    var max = 0, min = Infinity; series.forEach(function (s) { s.values.forEach(function (v) { max = Math.max(max, v); min = Math.min(min, v); }); }); if (p.goal) max = Math.max(max, p.goal);
    max = max * 1.08; var lo = p.fromZero ? 0 : Math.max(0, min - (max - min) * .35);
    var n = p.labels.length, x = function (i) { return X0 + (X1 - X0) * i / (n - 1); }, y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (max - lo)); };
    var hov = t[0] && t[0].i, last = n - 1;
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji, deco: p.deco || "menthe", tip: t[0], headline: p.headline || money(series[0].values[last], unit), badge: p.badge,
      legend: series.map(function (s, i) { return { name: s.name, who: s.who, color: colOf(s.color, i), line: true }; }),
      table: { cols: [p.xLabel || "Mois"].concat(series.map(function (s) { return s.name; })), rows: p.labels.map(function (lb, i) { return [lb].concat(series.map(function (s) { return money(s.values[i], unit); })); }) } },
      h("svg", { viewBox: "0 0 " + W + " " + H, className: "nd-svg", role: "group", "aria-label": p.summary || p.title },
        p.goal ? h("g", { "aria-hidden": "true" }, h("line", { className: "nd-goal", x1: X0, x2: X1, y1: y(p.goal), y2: y(p.goal) }),
          h("rect", { className: "nd-goal-pill", x: X0, y: y(p.goal) - 11, width: 112, height: 22, rx: 11 }), h("text", { className: "nd-goal-text", x: X0 + 56, y: y(p.goal) + 4, textAnchor: "middle" }, "objectif " + money(p.goal, unit))) : null,
        hov != null ? h("line", { className: "nd-cross", x1: x(hov), x2: x(hov), y1: T - 10, y2: H }) : null,
        series.map(function (s, si) {
          var pts = s.values.map(function (v, i) { return [x(i), y(v)]; }), d = smooth(pts);
          return h("g", { key: si },
            h("path", { d: d + "L" + x(last) + " " + H + "L" + x(0) + " " + H + "Z", fill: colOf(s.color, si), opacity: series.length === 1 ? .16 : .08 }),
            h("path", { d: d, fill: "none", stroke: colOf(s.color, si), strokeWidth: 3, strokeLinecap: "round" }),
            h("circle", { className: "nd-dot", cx: x(hov != null ? hov : last), cy: y(s.values[hov != null ? hov : last]), r: 6, fill: colOf(s.color, si) }));
        }),
        p.labels.map(function (lb, i) {
          var content = h("div", null, h("b", null, lb), series.map(function (s, si) { return h("div", { key: si, className: "nd-tip-row" }, h("span", { className: "nd-key line", style: { background: colOf(s.color, si) } }), s.name + " : " + money(s.values[i], unit)); }));
          var lab = lb + " : " + series.map(function (s) { return s.name + " " + money(s.values[i], unit); }).join(", ");
          var mp = markProps(function (v) { t[1](v ? Object.assign(v, { i: i }) : null); }, x(i) / W * 100, 0, content, lab);
          var bw = (X1 - X0) / (n - 1);
          return h("rect", Object.assign(mp, { key: "h" + i, className: "nd-hit", x: x(i) - bw / 2, y: 0, width: bw, height: H }));
        })),
      h(MonthPills, { labels: p.labels, current: hov != null ? hov : last }));
  }

  function SplitBar(p) {
    var t = useTip(), total = p.items.reduce(function (a, b) { return a + b.value; }, 0);
    var a = p.items[0], b = p.items[1], diff = (a.value - b.value) / 2;
    var verdict = p.verdict || (Math.abs(diff) < 1 ? "Vous êtes à l'équilibre" : (diff > 0 ? b.name + " doit " + money(Math.abs(diff)) + " à " + a.name : a.name + " doit " + money(Math.abs(diff)) + " à " + b.name));
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji || "⚖️", deco: p.deco || "rose", tip: null, headline: money(total), badge: p.badge,
      table: { cols: ["Personne", "Payé", "Part"], rows: p.items.map(function (it) { return [it.name, money(it.value), Math.round(it.value / total * 100) + " %"]; }) },
      footer: h("p", { className: "nd-verdict" }, h(Buddy, { shape: "flower", tone: "rose", mood: Math.abs(diff) < 1 ? "love" : "happy", size: 40 }), h("span", null, verdict)) },
      h("div", { className: "nd-split", role: "group", "aria-label": p.summary || p.title }, p.items.map(function (it, i) {
        var pct = Math.round(it.value / total * 100);
        return h("div", { key: i, className: cx("nd-split-seg", i === 1 && "right"), style: { flexGrow: it.value, background: colOf(it.color, i) }, role: "img", "aria-label": it.name + " a payé " + money(it.value) + ", " + pct + " %" },
          h(Avatar, { name: it.name, partner: it.who || (i === 0 ? "a" : "b"), size: 34 }),
          h("span", { className: "nd-split-val", "aria-hidden": "true" }, pct + " %"));
      })),
      h("div", { className: "nd-split-labels", "aria-hidden": "true" }, p.items.map(function (it, i) { return h("span", { key: i }, h("b", null, it.name), " " + money(it.value)); })));
  }

  function RankedBars(p) {
    var tones = ["menthe", "rose", "peche", "lavande", "beurre", "lilas"];
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji, deco: p.deco || "beurre",
      table: { cols: ["Catégorie", "Dépensé"].concat(p.items[0].budget ? ["Budget", "Utilisé"] : []), rows: p.items.map(function (it) { return [it.label, money(it.value)].concat(it.budget ? [money(it.budget), Math.round(it.value / it.budget * 100) + " %"] : []); }) } },
      h("ul", { className: "nd-cat-grid" }, p.items.map(function (it, i) {
        var tone = it.tone || tones[i % tones.length], pct = it.budget ? Math.round(it.value / it.budget * 100) : null, over = pct > 100;
        return h("li", { key: i, className: cx("nd-cat", "nd-tone-" + tone) },
          h("div", { className: "nd-cat-top" }, h("span", { className: "nd-cat-label" }, it.label), h("span", { className: "nd-cat-emoji", "aria-hidden": "true" }, it.emoji || foodEmoji(it.label, "🏷️"))),
          h("div", { className: "nd-cat-pct" }, pct != null ? pct + " %" : money(it.value)),
          pct != null ? h("div", { className: "nd-cat-track", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.min(pct, 100), "aria-label": it.label + " : " + pct + " % du budget" + (over ? ", dépassé" : "") },
            h("span", { style: { width: Math.min(100, pct) + "%", background: "var(--" + (TONE_FILL[tone] || "data-1") + ")" } })) : null,
          h("div", { className: "nd-cat-foot" }, money(it.value) + (it.budget ? " / " + money(it.budget) : "")),
          over ? h(Sticker, { tone: "heart", size: "sm", rotate: 8, className: "nd-cat-over" }, "dépassé") : null);
      })));
  }

  function DivergingBars(p) {
    var t = useTip(), W = 320, H = 180, unit = p.unit, mid = H / 2, half = H / 2 - 10;
    var m = 0; p.data.forEach(function (d) { m = Math.max(m, Math.abs(d.value)); });
    var band = W / p.data.length, bw = 18, best = 0; p.data.forEach(function (d, i) { if (d.value > p.data[best].value) best = i; });
    var sum = p.data.reduce(function (a, d) { return a + d.value; }, 0);
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji, deco: p.deco || "lavande", tip: t[0], headline: (sum >= 0 ? "+" : "") + money(sum, unit), badge: p.badge,
      legend: [{ name: p.posLabel || "Épargné", color: "var(--div-pos)" }, { name: p.negLabel || "Dépassé", color: "var(--div-neg)" }],
      table: { cols: [p.xLabel || "Mois", "Solde"], rows: p.data.map(function (d) { return [d.label, (d.value > 0 ? "+" : "") + money(d.value, unit)]; }) } },
      h("svg", { viewBox: "0 0 " + W + " " + H, className: "nd-svg", role: "group", "aria-label": p.summary || p.title },
        h("line", { className: "nd-base-dot", x1: 4, x2: W - 4, y1: mid, y2: mid }),
        p.data.map(function (d, i) {
          var x = band * i + (band - bw) / 2, pos = d.value >= 0, hh = Math.max(bw, Math.abs(d.value) / m * half);
          var lab = d.label + " : " + (pos ? "+" : "") + money(d.value, unit) + (pos ? ", épargné" : ", dépassé");
          return h("g", { key: i }, h("path", { className: "nd-track", d: pillV(x - 4, mid - half - 4, bw + 8, half * 2 + 8) }),
            h("path", Object.assign(markProps(t[1], (x + bw / 2) / W * 100, (pos ? mid - hh : mid + hh) / H * 100, lab, lab), { d: pos ? pillV(x, mid - hh, bw, hh) : pillV(x, mid, bw, hh), fill: pos ? "var(--div-pos)" : "var(--div-neg)" })));
        })),
      h(MonthPills, { labels: p.data.map(function (d) { return d.label; }), current: best }));
  }

  function CalendarHeatmap(p) {
    var t = useTip(), max = 0; p.days.forEach(function (d) { max = Math.max(max, d.value || 0); });
    var step = function (v) { return !v ? 0 : Math.min(5, Math.ceil(v / max * 5)); };
    var total = p.days.reduce(function (a, d) { return a + (d.value || 0); }, 0);
    var cells = []; for (var i = 0; i < (p.startDow || 0); i++) cells.push(h("span", { key: "e" + i, className: "nd-heat-cell empty", "aria-hidden": "true" }));
    p.days.forEach(function (d) {
      var s = step(d.value), lab = d.day + " " + (p.month || "") + " : " + (d.value ? money(d.value) : "aucune dépense");
      cells.push(h("span", Object.assign(markProps(t[1], 50, 0, lab, lab), { key: d.day, className: cx("nd-mark nd-heat-cell", d.today && "today"), style: { background: s ? "var(--seq-" + s + ")" : "var(--surface-sunken)", color: s >= 4 ? "var(--surface)" : undefined } }), d.day));
    });
    return h(ChartFrame, { title: p.title, subtitle: p.subtitle, emoji: p.emoji || "🗓️", deco: p.deco || "menthe", tip: t[0], headline: money(total), badge: p.badge,
      table: { cols: ["Jour", "Dépenses"], rows: p.days.filter(function (d) { return d.value; }).map(function (d) { return [d.day + " " + (p.month || ""), money(d.value)]; }) } },
      h("div", { className: "nd-heat-dows", "aria-hidden": "true" }, ["L", "M", "M", "J", "V", "S", "D"].map(function (x, i) { return h("span", { key: i }, x); })),
      h("div", { className: "nd-heat", role: "group", "aria-label": p.summary || p.title }, cells),
      h("div", { className: "nd-heat-scale", "aria-hidden": "true" }, "Moins", [1, 2, 3, 4, 5].map(function (s) { return h("i", { key: s, style: { background: "var(--seq-" + s + ")" } }); }), "Plus"));
  }

  function StatTile(p) {
    var d = p.delta, sp = p.trend, W = 120, H = 40, tone = p.tone;
    var spark = null;
    if (sp) { var mx = Math.max.apply(null, sp), mn = Math.min.apply(null, sp); var pts = sp.map(function (v, i) { return [i / (sp.length - 1) * (W - 8) + 4, H - 6 - (v - mn) / ((mx - mn) || 1) * (H - 12)]; }), dd = smooth(pts), lp = pts[pts.length - 1];
      spark = h("svg", { viewBox: "0 0 " + W + " " + H, className: "nd-spark", "aria-hidden": "true" }, h("path", { d: dd + "L" + lp[0] + " " + H + "L4 " + H + "Z", fill: "var(--ink)", opacity: .07 }), h("path", { d: dd, fill: "none", stroke: "var(--ink)", strokeWidth: 2.5, strokeLinecap: "round" }), h("circle", { cx: lp[0], cy: lp[1], r: 4.5, fill: "var(--surface)", stroke: "var(--ink)", strokeWidth: 2.5 })); }
    return h("div", { className: cx("nd-stat", tone && "nd-tone-" + tone) },
      h("div", { className: "nd-stat-top" }, h("span", { className: "nd-stat-label" }, p.label), p.emoji ? h("span", { className: "nd-stat-emoji", "aria-hidden": "true" }, p.emoji) : null),
      h("div", { className: "nd-stat-value" }, p.value),
      d ? h("div", { className: cx("nd-stat-delta", d.good ? "good" : "bad") }, h("span", { "aria-hidden": "true" }, d.up ? "↑ " : "↓ "), h("span", { className: "nd-sr" }, d.up ? "En hausse de " : "En baisse de "), d.value, h("span", { className: "nd-stat-vs" }, " " + (d.vs || ""))) : null,
      spark);
  }

  function GaugeTile(p) {
    var pct = Math.max(0, Math.min(1, p.value / (p.max || 100))), R = 46, C = Math.PI * R, tone = p.tone || "menthe";
    var arc = "M14 64A46 46 0 0 1 106 64";
    return h("div", { className: cx("nd-gauge", "nd-tone-" + tone) },
      h("div", { className: "nd-stat-top" }, h("span", { className: "nd-stat-label" }, p.label), p.emoji ? h("span", { className: "nd-stat-emoji", "aria-hidden": "true" }, p.emoji) : null),
      h("svg", { viewBox: "0 0 120 72", className: "nd-gauge-svg", role: "img", "aria-label": p.label + " : " + Math.round(pct * 100) + " %" + (p.caption ? ", " + p.caption : "") },
        h("path", { d: arc, className: "nd-gauge-track" }),
        h("path", { d: arc, className: "nd-gauge-fill", style: { stroke: "var(--" + (p.color || TONE_FILL[tone] || "data-1") + ")", strokeDasharray: C, strokeDashoffset: C * (1 - pct) } }),
        h("text", { x: 60, y: 62, textAnchor: "middle", className: "nd-gauge-pct" }, Math.round(pct * 100) + " %")),
      h("div", { className: "nd-gauge-value" }, p.display || p.value),
      p.caption ? h("div", { className: "nd-gauge-cap" }, p.caption) : null);
  }

  /* ---------- Fun ---------- */
  var BODY = {
    blob: function (c) { return h("path", { className: "body " + c, d: "M60 8C94 8 112 28 112 62s-20 52-52 52S8 96 8 62 26 8 60 8z" }); },
    pill: function (c) { return h("rect", { className: "body " + c, x: 16, y: 4, width: 88, height: 112, rx: 44 }); },
    flower: function (c) { return h("g", { className: c }, [[38, 38], [82, 38], [38, 82], [82, 82], [60, 60]].map(function (q, i) { return h("circle", { key: i, className: "body " + c, cx: q[0], cy: q[1], r: 30 }); })); },
    dome: function (c) { return h("path", { className: "body " + c, d: "M2 118C2 62 28 30 60 30s58 32 58 88z" }); },
    pot: function (c) { return h("g", null, h("path", { className: "body " + c, d: "M20 44h80l-9 66a9 9 0 0 1-9 8H38a9 9 0 0 1-9-8z" }), h("rect", { className: "body " + c, x: 10, y: 30, width: 100, height: 22, rx: 11 })); }
  };
  var EYES_Y = { blob: 56, pill: 50, flower: 58, dome: 80, pot: 76 };
  function heartPath(x, y, s) { return "M" + x + " " + (y + s * .9) + "C" + (x - s * 1.5) + " " + y + " " + (x - s * .8) + " " + (y - s) + " " + x + " " + (y - s * .3) + "C" + (x + s * .8) + " " + (y - s) + " " + (x + s * 1.5) + " " + y + " " + x + " " + (y + s * .9) + "z"; }
  function Buddy(p) {
    var shape = p.shape || "blob", tone = "f-" + (p.tone || "lavande"), mood = p.mood || "wow", sz = p.size || 96;
    var ey = EYES_Y[shape], r = shape === "pot" ? 11 : 14, xs = shape === "pot" ? [46, 74] : [43, 77];
    var look = { left: [-4, 1], right: [4, 1], up: [0, -4], down: [0, 4] }[p.look] || [1, 1];
    var face = [];
    xs.forEach(function (x, i) {
      if (mood === "happy") face.push(h("path", { key: "e" + i, className: "lid", d: "M" + (x - 9) + " " + (ey + 3) + "q9-11 18 0" }));
      else if (mood === "sleepy") face.push(h("path", { key: "e" + i, className: "lid", d: "M" + (x - 9) + " " + ey + "q9 7 18 0" }));
      else {
        face.push(h("circle", { key: "w" + i, className: "eye", cx: x, cy: ey, r: r }));
        if (mood === "love") face.push(h("path", { key: "p" + i, className: "heart-eye", d: heartPath(x + look[0] * .5, ey + look[1] * .5, r * .55) }));
        else { face.push(h("circle", { key: "p" + i, className: "pupil", cx: x + look[0], cy: ey + look[1], r: r * .58 })); face.push(h("circle", { key: "g" + i, className: "glint", cx: x + look[0] - r * .22, cy: ey + look[1] - r * .25, r: r * .2 })); }
        if (mood === "wow") face.push(h("path", { key: "b" + i, className: "brow", d: "M" + (x - 8) + " " + (ey - r - 7) + "q8-6 16 0" }));
      }
    });
    if (mood === "happy" || mood === "love") {
      face.push(h("path", { key: "m", className: "mouth", d: "M" + (xs[0] + 8) + " " + (ey + 18) + "q" + ((xs[1] - xs[0] - 16) / 2) + " 10 " + (xs[1] - xs[0] - 16) + " 0" }));
      face.push(h("circle", { key: "c1", className: "cheek", cx: xs[0] - 8, cy: ey + 14, r: 7 }), h("circle", { key: "c2", className: "cheek", cx: xs[1] + 8, cy: ey + 14, r: 7 }));
    }
    if (mood === "sleepy") face.push(h("path", { key: "m", className: "mouth", d: "M" + (60 - 5) + " " + (ey + 17) + "h10" }));
    return h("svg", { className: cx("nd-buddy", p.bob && "nd-buddy-bob", p.className), viewBox: "0 0 120 120", width: sz, height: sz, role: p.label ? "img" : undefined, "aria-label": p.label, "aria-hidden": p.label ? undefined : "true", style: p.style },
      BODY[shape] ? BODY[shape](tone) : null, face);
  }

  function Flower(p) {
    var petals = [];
    for (var i = 0; i < 6; i++) { var a = i * Math.PI / 3; petals.push(h("circle", { key: i, className: cx("nd-flower", p.alt && "alt"), cx: 50 + Math.cos(a) * 24, cy: 50 + Math.sin(a) * 24, r: 20 })); }
    return h("svg", { className: p.className, viewBox: "0 0 100 100", "aria-hidden": "true" }, petals, h("circle", { className: "nd-flower-core", cx: 50, cy: 50, r: 15 }));
  }

  function Sticker(p) {
    return h("span", { className: cx("nd-sticker", "nd-tone-" + (p.tone || "citron"), p.tone === "ink" && "nd-sticker-ink", p.tone === "heart" && "nd-sticker-heart", p.tone === "sapin" && "nd-sticker-sapin", p.size === "sm" && "nd-sticker-sm", p.className), style: Object.assign({ transform: "rotate(" + (p.rotate != null ? p.rotate : -6) + "deg)" }, p.style) }, p.children);
  }
  var STACK_ROT = [-8, 6, -4, 9], STACK_X = [0, 44, 10, 60];
  function StickerStack(p) {
    return h("div", { className: "nd-stack", role: "group", "aria-label": p.words.map(function (w) { return w.text; }).join(" ") },
      p.words.map(function (w, i) { return h(Sticker, { key: i, tone: w.tone, size: p.size, rotate: STACK_ROT[i % 4], style: { left: STACK_X[i % 4], zIndex: p.words.length - i } }, w.text); }));
  }

  function MatchSticker(p) {
    return h("div", { className: "nd-match", role: "status", "aria-label": (p.title || "C'est un match !") + (p.subtitle ? " " + p.subtitle : "") },
      h(Flower, { className: "deco" }), h(Flower, { className: "deco2", alt: true }),
      h("div", { className: "title nd-pop" }, h(Sticker, { tone: "heart", rotate: 0 }, p.title || "C'est un match !")),
      p.subtitle ? h("div", { className: "sub" }, h(Sticker, { tone: "citron", size: "sm", rotate: 0 }, p.subtitle)) : null,
      h(Buddy, { className: "b1", shape: "pill", tone: p.toneA || "lavande", mood: "love", look: "right", size: 120, bob: true }),
      h(Buddy, { className: "b2", shape: "flower", tone: p.toneB || "peche", mood: "happy", size: 128, bob: true, style: { animationDelay: ".6s" } }));
  }

  function HeroCard(p) {
    var tone = p.tone || "citron";
    return h("div", { className: cx("nd-hero", "nd-tone-" + tone) },
      h("svg", { className: "nd-hero-blob", viewBox: "0 0 100 100", "aria-hidden": "true" }, h("path", { d: "M50 4c10 0 14 12 22 16s22 2 24 12-8 16-8 26 10 18 2 26-20 0-28 6-14 10-24 6-6-16-14-22-22-4-24-14 10-14 10-24-8-20 2-26 18 2 26-2S40 4 50 4z" })),
      h("h3", { className: "nd-hero-title" }, p.title),
      p.text ? h("div", { className: "nd-hero-text" }, p.text) : null,
      p.action ? h(Button, { variant: tone === "sapin" ? "outline" : "ink", onClick: p.onAction }, p.action) : null,
      h(Buddy, Object.assign({ shape: "flower", tone: "lavande", mood: "happy", size: 116 }, p.buddy || {})));
  }

  function euros(n) { return Math.round(n).toLocaleString("fr-FR") + " €"; }
  function wavePath(y) { var w = "M20 " + y; for (var x = 20; x < 220; x += 30) w += "q7.5-7 15 0t15 0"; return w + "L222 190L20 190z"; }
  function drop(x, y) { return h("path", { className: "drop", d: "M" + x + " " + y + "c4 6 7 10 7 13a7 7 0 0 1-14 0c0-3 3-7 7-13z" }); }
  var PIGS = {
    classique: function (pct, high, id) {
      var y = 164 - pct * 128;
      return [h("defs", { key: "d" }, h("clipPath", { id: id }, h("ellipse", { cx: 118, cy: 102, rx: 90, ry: 62 }))),
        h("path", { key: 1, className: "pig-line", d: "M30 104c-16 0-20-14-11-18s11 9 2 14" }),
        h("rect", { key: 2, className: "pig", x: 60, y: 140, width: 26, height: 32, rx: 9 }), h("rect", { key: 3, className: "pig", x: 148, y: 140, width: 26, height: 32, rx: 9 }),
        h("path", { key: 4, className: "pig", d: "M78 54 70 22l32 20z" }),
        h("ellipse", { key: 5, className: "pig", cx: 118, cy: 102, rx: 90, ry: 62 }),
        h("path", { key: 6, className: "pig-fill", d: wavePath(y), clipPath: "url(#" + id + ")" }),
        h("ellipse", { key: 7, className: "pig-line", cx: 118, cy: 102, rx: 90, ry: 62 }),
        h("path", { key: 8, className: "pig", d: "M142 46 158 14l16 34z" }),
        h("rect", { key: 9, className: "pig-ink", x: 96, y: 36, width: 44, height: 8, rx: 4 }),
        h("circle", { key: 10, className: "coin", cx: 118, cy: 4, r: 14 }), h("path", { key: 11, className: "pig-line", d: "M118-3v14", style: { strokeWidth: 3 } }),
        h("ellipse", { key: 12, className: "pig-snout", cx: 206, cy: 104, rx: 20, ry: 17 }),
        h("ellipse", { key: 13, className: "pig-ink", cx: 200, cy: 104, rx: 3, ry: 5 }), h("ellipse", { key: 14, className: "pig-ink", cx: 212, cy: 104, rx: 3, ry: 5 }),
        h("circle", { key: 15, className: "pig-ink", cx: 172, cy: 82, r: 6.5 }),
        h("path", { key: 16, className: "pig-line", d: high ? "M162 64l20 7" : "M164 68q8-6 16 0" }),
        h("circle", { key: 17, className: "pig-cheek", cx: 178, cy: 114, r: 10 }),
        h("path", { key: 18, className: "pig-line", d: high ? "M188 134q8-5 16 0" : "M188 130q8 6 16 0" }),
        high ? h("g", { key: 19 }, drop(196, 50)) : null];
    },
    bulle: function (pct, high, id) {
      var y = 170 - pct * 134;
      return [h("defs", { key: "d" }, h("clipPath", { id: id }, h("ellipse", { cx: 116, cy: 104, rx: 94, ry: 68 }))),
        h("path", { key: 1, className: "bul-tail", d: "M26 98c-14-4-12-20 0-18 10 2 4 16-6 12" }),
        h("rect", { key: 2, className: "bul", x: 56, y: 146, width: 30, height: 30, rx: 15 }), h("rect", { key: 3, className: "bul", x: 146, y: 146, width: 30, height: 30, rx: 15 }),
        h("path", { key: 4, className: "bul", d: "M70 58C58 28 76 18 104 40z" }), h("path", { key: 5, className: "bul", d: "M140 40c26-22 44-12 34 18z" }),
        h("ellipse", { key: 6, className: "bul", cx: 116, cy: 104, rx: 94, ry: 68 }),
        h("path", { key: 7, className: "bul-fill", d: wavePath(y), clipPath: "url(#" + id + ")" }),
        h("ellipse", { key: 8, className: "bul-shine", cx: 70, cy: 76, rx: 18, ry: 10, transform: "rotate(-30 70 76)" }),
        h("rect", { key: 9, className: "pig-pupil", x: 92, y: 38, width: 44, height: 8, rx: 4 }),
        h("circle", { key: 10, className: "coin", cx: 114, cy: 4, r: 14 }),
        h("circle", { key: 11, className: "bul-eye", cx: 150, cy: 86, r: 12 }), h("circle", { key: 12, className: "bul-eye", cx: 182, cy: 82, r: 12 }),
        h("circle", { key: 13, className: "pig-pupil", cx: high ? 151 : 153, cy: high ? 82 : 88, r: 7 }), h("circle", { key: 14, className: "pig-pupil", cx: high ? 183 : 185, cy: high ? 78 : 84, r: 7 }),
        high ? h("path", { key: 15, className: "bul-brow", d: "M140 66l18 4M174 66l18-6" }) : null,
        h("ellipse", { key: 16, className: "bul-snout", cx: 196, cy: 112, rx: 22, ry: 16 }),
        h("ellipse", { key: 17, className: "pig-pupil", cx: 190, cy: 112, rx: 3, ry: 5 }), h("ellipse", { key: 18, className: "pig-pupil", cx: 202, cy: 112, rx: 3, ry: 5 }),
        h("circle", { key: 19, className: "pig-cheek", cx: 150, cy: 112, r: 9 }),
        high ? h("g", { key: 20 }, drop(208, 52)) : null];
    },
    geo: function (pct, high, id) {
      var y = 176 - pct * 144;
      return [h("defs", { key: "d" }, h("clipPath", { id: id }, h("circle", { cx: 108, cy: 104, r: 72 }))),
        h("path", { key: 1, className: "geo-tail", d: "M38 112c-16 2-18-16-6-18s10 12-2 14" }),
        h("rect", { key: 2, className: "geo-leg", x: 66, y: 156, width: 22, height: 30, rx: 11, transform: "rotate(-8 77 171)" }), h("rect", { key: 3, className: "geo-leg", x: 124, y: 158, width: 22, height: 30, rx: 11, transform: "rotate(10 135 173)" }),
        h("polygon", { key: 4, className: "geo-ear2", points: "84,40 100,10 116,44" }),
        h("circle", { key: 5, className: "geo-body", cx: 108, cy: 104, r: 72 }),
        h("path", { key: 6, className: "geo-fill", d: wavePath(y), clipPath: "url(#" + id + ")" }),
        h("polygon", { key: 7, className: "geo-ear", points: "132,26 172,38 140,62" }),
        h("rect", { key: 8, className: "geo-snout", x: 160, y: 88, width: 58, height: 38, rx: 19, transform: "rotate(-6 189 107)" }),
        h("circle", { key: 9, className: "pig-pupil", cx: 182, cy: 108, r: 4 }), h("circle", { key: 10, className: "pig-pupil", cx: 198, cy: 106, r: 4 }),
        h("circle", { key: 11, className: "pig-pupil", cx: 146, cy: 78, r: 7 }), h("circle", { key: 12, className: "glint-w", cx: 144, cy: 76, r: 2 }),
        h("circle", { key: 13, className: "geo-coin", cx: 44, cy: 26, r: 18 }), h("rect", { key: 14, className: "pig-pupil", x: 40, y: 18, width: 8, height: 16, rx: 4 }),
        h("path", { key: 15, className: "geo-spark", d: "M206 30c1 7 4 10 11 11-7 1-10 4-11 11-1-7-4-10-11-11 7-1 10-4 11-11z" }),
        high ? h("g", { key: 16 }, drop(166, 40)) : null];
    },
    pieces: function (pct, high, id) {
      var rows = Math.round(pct * 9), coins = [];
      for (var r = 0; r < rows; r++) for (var c = 0; c < 7; c++) coins.push(h("ellipse", { key: r + "-" + c, className: "coin-s", cx: 44 + c * 26 + (r % 2 ? 13 : 0), cy: 160 - r * 14, rx: 14, ry: 7 }));
      var base = PIGS.classique(0, high, id + "c");
      return [h("defs", { key: "d" }, h("clipPath", { id: id }, h("ellipse", { cx: 118, cy: 102, rx: 88, ry: 60 })))].concat(base.slice(1, 6), [h("g", { key: "coins", clipPath: "url(#" + id + ")" }, coins)], base.slice(7));
    }
  };
  function PiggyBank(p) {
    var goal = p.goal || 1, pct = Math.max(0, Math.min(1, (p.value || 0) / goal)), mode = p.mode || "budget", variant = p.variant || "classique";
    var high = mode === "budget" && pct >= .9;
    var note = p.note || (mode === "budget" ? (high ? "Attention, presque tout est dépensé" : "Il reste " + euros(goal - p.value) + " ce mois-ci") : "Encore " + euros(goal - p.value) + " pour l'objectif");
    var id = useState(function () { return "pig" + (++uid); })[0];
    return h("div", { className: cx("nd-piggy", "nd-piggy-" + variant), "data-level": high ? "high" : "ok" },
      h("div", { className: "nd-piggy-head" }, h("div", { className: "nd-money-label" }, p.label),
        h("span", { className: cx("nd-status", high ? "nd-status-soon" : "nd-status-paid") }, Math.round(pct * 100) + " %", h("span", { className: "nd-sr" }, high ? " : budget presque épuisé" : mode === "budget" ? " du budget utilisé" : " de l'objectif"))),
      h("svg", { viewBox: "0 -14 240 204", role: "img", "aria-label": "Tirelire remplie à " + Math.round(pct * 100) + " %" }, (PIGS[variant] || PIGS.classique)(pct, high, id)),
      h("div", { className: "nd-piggy-amount" }, euros(p.value), h("small", null, " / " + euros(goal))),
      h("div", { className: "nd-piggy-note" }, note),
      p.envelopes ? h("div", { className: "nd-envelopes" }, p.envelopes.map(function (e) {
        return h("div", { key: e.label, className: "nd-env" },
          h("div", { className: "nd-env-bar", role: "img", "aria-label": e.label + " : " + e.pct + " %" }, h("b", { "aria-hidden": "true" }, e.pct + " %"), h("i", { className: "nd-tone-" + (e.tone || "lavande"), style: { height: Math.min(100, e.pct) + "%" } })), h("span", { "aria-hidden": "true" }, e.label));
      })) : null);
  }


  /* ---------- Plantes : mascottes feuilles ---------- */
  var PLANT_PHRASES = {
    love: ["Glou glou, je revis !", "Ahhh, merci, ça fait du bien !", "Je vous aime, vous deux."],
    happy: ["Je me sens pousser des feuilles !", "Il fait beau dans mon pot aujourd'hui.", "Merci de prendre soin de moi."],
    ok: ["Tout roule, je fais ma photosynthèse.", "Encore {n} jour{s} et j'aurai soif.", "Je profite de la lumière, tranquille."],
    thirsty: ["Psst ! C'est l'heure de l'arrosage.", "J'ai un peu soif… un verre d'eau ?", "Ma terre est toute sèche, aide-moi !"],
    sad: ["Vous m'avez un peu oubliée…", "Je commence à faner, au secours !", "De l'eau, s'il vous plaît, vite !"],
    sleep: ["Chut, je fais ma nuit.", "Zzz… à demain matin."]
  };
  var PLANT_MOOD_LABEL = { love: "vient d'être arrosée", happy: "en pleine forme", ok: "bien", thirsty: "a soif", sad: "fane, à arroser vite", sleep: "dort" };
  function plantMood(days, every, night) {
    if (night) return "sleep"; if (days == null) return "happy";
    var r = days / (every || 3); return days === 0 ? "love" : r < .6 ? "happy" : r < 1 ? "ok" : r < 1.6 ? "thirsty" : "sad";
  }
  function hashStr(s) { var x = 0; for (var i = 0; i < (s || "").length; i++) x = (x * 31 + s.charCodeAt(i)) | 0; return Math.abs(x); }
  function plantPhrase(mood, seed, left) {
    var list = PLANT_PHRASES[mood] || PLANT_PHRASES.happy, s = list[seed % list.length];
    return s.replace("{n}", left).replace("{s}", left > 1 ? "s" : "");
  }
  function plantFace(cx, cy, mood) {
    var f = [], eyes = mood === "sleep" ? "closed" : mood === "love" ? "heart" : "open";
    var look = mood === "thirsty" ? [0, -3] : mood === "sad" ? [0, 2] : [1, 0];
    [cx - 13, cx + 13].forEach(function (x, i) {
      if (eyes === "closed") f.push(h("path", { key: "e" + i, className: "pl-line", d: "M" + (x - 6) + " " + cy + "q6 5 12 0" }));
      else {
        f.push(h("circle", { key: "w" + i, className: "eye", cx: x, cy: cy, r: 8.5 }));
        if (eyes === "heart") f.push(h("path", { key: "p" + i, className: "heart-eye", d: heartPath(x, cy, 5) }));
        else { f.push(h("circle", { key: "p" + i, className: "pupil", cx: x + look[0], cy: cy + look[1], r: 5 })); f.push(h("circle", { key: "g" + i, className: "glint", cx: x + look[0] - 1.5, cy: cy + look[1] - 2, r: 1.6 })); }
      }
    });
    if (mood === "sad") f.push(h("path", { key: "b", className: "pl-line", d: "M" + (cx - 20) + " " + (cy - 12) + "l9 3M" + (cx + 20) + " " + (cy - 12) + "l-9 3" }));
    if (mood === "thirsty") f.push(h("path", { key: "b", className: "pl-line", d: "M" + (cx - 19) + " " + (cy - 14) + "q6-4 12 0M" + (cx + 7) + " " + (cy - 14) + "q6-4 12 0" }));
    var m = { love: "M" + (cx - 8) + " " + (cy + 10) + "q8 12 16 0z", happy: "M" + (cx - 8) + " " + (cy + 10) + "q8 12 16 0z", ok: "M" + (cx - 6) + " " + (cy + 12) + "q6 5 12 0",
      thirsty: "M" + (cx - 8) + " " + (cy + 14) + "q2-3 4 0t4 0t4 0t4 0", sad: "M" + (cx - 6) + " " + (cy + 16) + "q6-6 12 0", sleep: "M" + (cx - 3) + " " + (cy + 13) + "h6" }[mood];
    f.push(h("path", { key: "m", className: mood === "love" || mood === "happy" ? "pl-mouth-open" : "pl-line", d: m }));
    if (mood === "love" || mood === "happy") f.push(h("circle", { key: "c1", className: "cheek", cx: cx - 21, cy: cy + 8, r: 5 }), h("circle", { key: "c2", className: "cheek", cx: cx + 21, cy: cy + 8, r: 5 }));
    return h("g", { className: "pl-face" }, f);
  }
  var PLANT_SPECIES = {
    feuille: function (mood, id) { return h("g", null,
      h("path", { className: "pl-stem", d: "M60 112V92" }),
      h("path", { className: "pl-leaf", d: "M60 96C22 90 16 46 60 8c44 38 38 82 0 88z" }),
      h("path", { className: "pl-vein", d: "M60 44V16M60 30l-9-8M60 30l9-8" }),
      plantFace(60, 62, mood)); },
    pousse: function (mood, id) { return h("g", null,
      h("path", { className: "pl-leaf pl-sprout-l", d: "M58 52C40 54 28 38 32 20c18 2 28 16 26 32z" }),
      h("path", { className: "pl-leaf pl-sprout-r", d: "M62 52C80 54 92 38 88 20c-18 2-28 16-26 32z" }),
      h("path", { className: "pl-vein", d: "M56 48 40 28M64 48l16-20" }),
      h("circle", { className: "pl-leaf", cx: 60, cy: 80, r: 30 }),
      plantFace(60, 80, mood)); },
    monstera: function (mood, id) { return h("g", null,
      h("defs", null, h("mask", { id: id }, h("rect", { x: 0, y: 0, width: 120, height: 140, fill: "#fff" }),
        [[20, 46, -20], [22, 72, 15], [100, 46, 20], [98, 72, -15]].map(function (n, i) { return h("ellipse", { key: i, cx: n[0], cy: n[1], rx: 14, ry: 4.5, transform: "rotate(" + n[2] + " " + n[0] + " " + n[1] + ")", fill: "#000" }); }),
        h("ellipse", { cx: 36, cy: 32, rx: 4, ry: 7, fill: "#000", transform: "rotate(-30 36 32)" }), h("ellipse", { cx: 84, cy: 32, rx: 4, ry: 7, fill: "#000", transform: "rotate(30 84 32)" }))),
      h("path", { className: "pl-stem", d: "M60 112V96" }),
      h("circle", { className: "pl-leaf", cx: 60, cy: 60, r: 42, mask: "url(#" + id + ")" }),
      h("path", { className: "pl-vein", d: "M60 20v14" }),
      plantFace(60, 64, mood)); },
    cactus: function (mood, id) { return h("g", null,
      h("rect", { className: "pl-leaf", x: 12, y: 44, width: 18, height: 34, rx: 9 }), h("rect", { className: "pl-leaf", x: 18, y: 66, width: 22, height: 14, rx: 7 }),
      h("rect", { className: "pl-leaf", x: 90, y: 34, width: 18, height: 30, rx: 9 }), h("rect", { className: "pl-leaf", x: 80, y: 54, width: 22, height: 14, rx: 7 }),
      h("rect", { className: "pl-leaf", x: 34, y: 26, width: 52, height: 86, rx: 26 }),
      [[44, 42], [76, 44], [42, 100], [78, 98], [60, 104]].map(function (q, i) { return h("path", { key: i, className: "pl-vein", d: "M" + q[0] + " " + q[1] + "l3 3m0-3-3 3" }); }),
      h("g", { className: "pl-flower" }, [0, 1, 2, 3, 4].map(function (i) { var a = i * 1.2566 - 1.57; return h("circle", { key: i, cx: 60 + Math.cos(a) * 6, cy: 22 + Math.sin(a) * 6, r: 5 }); }), h("circle", { className: "pl-flower-core", cx: 60, cy: 22, r: 3.5 })),
      plantFace(60, 66, mood)); }
  };
  function PlantBuddy(p) {
    var sp = p.species || "feuille", sz = p.size || 120, id = useState(function () { return "pl" + (++uid); })[0];
    var st = useState(0), pokes = st[0];
    var wt = useState(false), justWatered = wt[0];
    var mood = justWatered ? "love" : (p.mood || plantMood(p.daysSinceWater, p.every, p.night));
    var left = Math.max(1, Math.round((p.every || 3) - (p.daysSinceWater || 0)));
    var phrase = p.phrase || plantPhrase(mood, hashStr(p.name) + pokes, left);
    var react = function () { st[1](pokes + 1); p.onPoke && p.onPoke(); };
    var water = function () { wt[1](true); st[1](pokes + 1); p.onWater && p.onWater(); };
    var art = h("svg", { key: "a" + pokes + mood, className: cx("nd-plantb", "mood-" + mood, pokes && "poked"), viewBox: "0 0 120 140", width: sz, height: sz * 140 / 120, "aria-hidden": "true" },
      h("ellipse", { className: "pl-shadow", cx: 60, cy: 137, rx: 30, ry: 3 }),
      h("g", { className: "pl-body" }, PLANT_SPECIES[sp](mood, id)),
      h("rect", { className: "pl-pot f-" + (p.potTone || "peche"), x: 34, y: 108, width: 52, height: 10, rx: 5 }),
      h("path", { className: "pl-pot f-" + (p.potTone || "peche"), d: "M38 116h44l-5 20a4 4 0 0 1-4 3H47a4 4 0 0 1-4-3z" }),
      mood === "thirsty" || mood === "sad" ? h("path", { className: "pl-sweat", d: "M98 30c4 6 7 10 7 13a7 7 0 0 1-14 0c0-3 3-7 7-13z" }) : null,
      mood === "sad" ? h("path", { className: "pl-tear", d: "M42 74c2 3 3 5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-6.5z" }) : null,
      mood === "love" ? h("g", { className: "pl-drops" }, [36, 60, 84].map(function (x, i) { return h("path", { key: i, style: { animationDelay: i * .12 + "s" }, d: "M" + x + " -6c3 5 5 8 5 10a5 5 0 0 1-10 0c0-2 2-5 5-10z" }); })) : null,
      mood === "love" ? h("g", { className: "pl-hearts" }, h("path", { d: heartPath(96, 20, 6) }), h("path", { style: { animationDelay: ".3s" }, d: heartPath(22, 30, 5) })) : null,
      mood === "sleep" ? h("g", { className: "pl-zzz" }, h("text", { x: 88, y: 24 }, "z"), h("text", { x: 98, y: 12, style: { fontSize: "16px" } }, "z")) : null);
    return h("div", { className: cx("nd-plantb-wrap", p.className) },
      p.speech !== false ? h("div", { className: cx("nd-speech", "nd-speech-" + mood), role: "status", "aria-live": "polite" }, h("span", { className: "nd-sr" }, (p.name || "La plante") + " dit : "), phrase) : null,
      p.interactive ? h("button", { type: "button", className: "nd-plantb-hit", onClick: react, "aria-label": "Faire coucou à " + (p.name || "la plante") + ", " + PLANT_MOOD_LABEL[mood] }, art) : h("div", { role: "img", "aria-label": (p.name || "Plante") + ", " + PLANT_MOOD_LABEL[mood] }, art),
      p.waterButton ? h(Button, { variant: "secondary", icon: "check", onClick: water, disabled: justWatered }, justWatered ? "Arrosée" : "Arroser") : null);
  }

  function PlantCard(p) {
    var wt = useState(false), watered = wt[0];
    var days = watered ? 0 : (p.daysSinceWater != null ? p.daysSinceWater : (p.thirsty ? (p.every || 3) : 0));
    var mood = watered ? "love" : (p.mood || plantMood(days, p.every || 3, p.night));
    var tag = { love: ["merci !", "citron"], happy: ["en forme", "citron"], ok: ["ça va", "menthe"], thirsty: ["j'ai soif !", "rose"], sad: ["au secours !", "peche"], sleep: ["dodo", "lavande"] }[mood];
    return h("div", { className: "nd-plant" },
      h("div", { className: "nd-plant-visual" },
        h(PlantBuddy, { key: watered ? "w" : "n", species: p.species || "feuille", potTone: p.potTone, mood: mood, name: typeof p.name === "string" ? p.name : p.label, every: p.every, daysSinceWater: days, size: 116, interactive: true }),
        h("div", { className: "nd-plant-tag" }, h(Sticker, { tone: tag[1], size: "sm", rotate: 0 }, tag[0]))),
      h("p", { className: "nd-plant-name" }, p.name),
      h("div", { className: "nd-plant-meta" }, p.who ? h(Avatar, { name: p.who.name, partner: p.who.partner, size: 26 }) : null, watered ? "Arrosée aujourd'hui" : p.next),
      p.week ? h("div", { className: "nd-water", role: "group", "aria-label": "Arrosages de la semaine" }, p.week.map(function (d) {
        var state = watered && d.today ? "done" : d.state;
        return h("div", { key: d.day }, h("span", { "aria-hidden": "true" }, d.dow), h("i", { className: cx(state, d.today && "today"), role: "img", "aria-label": (d.label || d.dow + " " + d.day) + (state === "done" ? ", arrosée" : state === "due" ? ", à arroser" : "") }, state === "done" ? "✓" : d.day));
      })) : null,
      h(Button, { onClick: function () { wt[1](true); p.onWater && p.onWater(); }, icon: "check", disabled: watered }, watered ? "Merci pour elle !" : (p.action || "C'est arrosé")));
  }


  /* ---------- Recettes et matching ---------- */
  function RecipeRow(p) {
    return h("button", { type: "button", className: "nd-recipe-row", onClick: p.onClick },
      h("span", { className: cx("nd-recipe-thumb", "nd-tone-" + (p.tone || "peche")), "aria-hidden": "true" }, p.emoji || foodEmoji(p.name)),
      h("span", { className: "nd-recipe-row-body" },
        h("span", { className: "nd-recipe-row-name" }, p.name),
        h("span", { className: "nd-recipe-row-meta" }, h(Icon, { name: "clock", size: "sm" }), p.time,
          p.rating ? h(React.Fragment, null, h("span", { className: "nd-dotsep", "aria-hidden": "true" }), h("span", { "aria-hidden": "true" }, "⭐"), h("span", { className: "nd-sr" }, "Note "), p.rating) : null,
          p.by ? h(React.Fragment, null, h("span", { className: "nd-dotsep", "aria-hidden": "true" }), h(Avatar, { name: p.by.name, partner: p.by.partner, size: 20 })) : null)),
      h(Icon, { name: "chevron" }));
  }

  function SwipeDeck(p) {
    var dishes = p.dishes, st = useState({ i: 0, likes: [], dx: 0, drag: false, last: null }), s = st[0], set = st[1];
    var start = React.useRef(null);
    var done = s.i >= dishes.length;
    function decide(like) {
      if (done) return;
      var d = dishes[s.i], likes = like ? s.likes.concat([d.name]) : s.likes;
      set({ i: s.i + 1, likes: likes, dx: 0, drag: false, last: (like ? "J'ai envie : " : "Pas envie : ") + d.name });
      if (s.i + 1 >= dishes.length && p.onFinish) p.onFinish(likes);
    }
    function down(e) { start.current = e.clientX; e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); set(Object.assign({}, s, { drag: true })); }
    function move(e) { if (start.current == null) return; set(Object.assign({}, s, { dx: e.clientX - start.current, drag: true })); }
    function up() { if (start.current == null) return; var dx = s.dx; start.current = null; if (Math.abs(dx) > 90) decide(dx > 0); else set(Object.assign({}, s, { dx: 0, drag: false })); }
    function key(e) { if (e.key === "ArrowRight") { e.preventDefault(); decide(true); } if (e.key === "ArrowLeft") { e.preventDefault(); decide(false); } }
    var matches = done && p.partnerLikes ? s.likes.filter(function (n) { return p.partnerLikes.indexOf(n) >= 0; }) : [];
    var partner = p.partner || { name: "Inès", partner: "a" };
    var top = dishes[s.i], next = dishes[s.i + 1];
    var head = h("div", { className: "nd-deck-head" },
      h("span", { className: "nd-deck-count" }, done ? "Terminé" : (s.i + 1) + " / " + dishes.length),
      h("span", { className: "nd-deck-partner" }, h(Avatar, { name: partner.name, partner: partner.partner, size: 26 }), p.partnerDone ? partner.name + " a fini de swiper" : partner.name + " swipe aussi"));
    if (done) {
      var m = matches[0], dish = m && dishes.filter(function (d) { return d.name === m; })[0];
      return h("section", { className: "nd-deck", "aria-label": "Qu'est-ce qu'on mange ?" }, head,
        h("div", { role: "status", "aria-live": "polite", className: "nd-deck-result" },
          dish ? h(React.Fragment, null,
            h(MatchSticker, { subtitle: dish.name.toLowerCase(), toneA: "lavande", toneB: "peche" }),
            matches.length > 1 ? h("p", { className: "nd-deck-more" }, "Et aussi : " + matches.slice(1).join(", ")) : null,
            h("div", { className: "nd-deck-actions" }, h(Button, { variant: "love", icon: "heart", onClick: function () { p.onOpenRecipe && p.onOpenRecipe(dish); } }, "Voir la recette"), h(Button, { variant: "secondary", onClick: function () { set({ i: 0, likes: [], dx: 0, drag: false, last: null }); } }, "Rejouer")))
          : h(React.Fragment, null, h(Buddy, { shape: "blob", tone: "lavande", mood: "sleepy", size: 96 }), h("p", { className: "nd-deck-nomatch" }, p.partnerLikes ? "Pas de match cette fois… on relance ?" : "C'est envoyé ! On attend " + partner.name + "."), h(Button, { variant: "secondary", onClick: function () { set({ i: 0, likes: [], dx: 0, drag: false, last: null }); } }, "Rejouer"))));
    }
    var rot = s.dx / 14, likeO = Math.max(0, Math.min(1, s.dx / 90)), nopeO = Math.max(0, Math.min(1, -s.dx / 90));
    return h("section", { className: "nd-deck", "aria-label": "Qu'est-ce qu'on mange ?" }, head,
      h("p", { className: "nd-deck-private" }, h(Icon, { name: "lock", size: "sm" }), partner.name + " ne voit pas tes choix"),
      h("div", { className: "nd-deck-stack", tabIndex: 0, role: "group", "aria-roledescription": "pile de plats", "aria-label": top.name + ". Flèche droite : j'ai envie, flèche gauche : pas envie.", onKeyDown: key },
        next ? h("div", { className: "nd-deck-card under", "aria-hidden": "true" }, h(DishCard, { name: next.name, emoji: next.emoji, tone: next.tone, tags: next.tags, actions: false })) : null,
        h("div", { className: cx("nd-deck-card", s.drag && "drag"), style: { transform: "translateX(" + s.dx + "px) rotate(" + rot + "deg)" }, onPointerDown: down, onPointerMove: move, onPointerUp: up, onPointerCancel: up },
          h(DishCard, { name: top.name, emoji: top.emoji, tone: top.tone, tags: top.tags, actions: false }),
          h("span", { className: "nd-stamp yes", style: { opacity: likeO }, "aria-hidden": "true" }, h(Sticker, { tone: "citron", rotate: -12 }, "miam !")),
          h("span", { className: "nd-stamp no", style: { opacity: nopeO }, "aria-hidden": "true" }, h(Sticker, { tone: "ink", rotate: 12 }, "bof")))),
      h("div", { className: "nd-swipe" },
        h("button", { type: "button", className: "nd-swipe-btn nd-swipe-no", "aria-label": "Pas envie de " + top.name, onClick: function () { decide(false); } }, h(Icon, { name: "x" })),
        h("button", { type: "button", className: "nd-swipe-btn nd-swipe-yes", "aria-label": "J'ai envie de " + top.name, onClick: function () { decide(true); } }, h(Icon, { name: "heart" }))),
      h("p", { className: "nd-sr", role: "status", "aria-live": "polite" }, s.last || ""));
  }

  function parseQty(q) { var m = /^([\d.,\/]+)\s*(.*)$/.exec(q || ""); if (!m) return null; var fr = m[1].split("/"), n = fr.length === 2 ? parseFloat(fr[0]) / parseFloat(fr[1]) : parseFloat(m[1].replace(",", ".")); return { n: n, unit: m[2] }; }
  function scaleQty(q, f) { var x = parseQty(q); if (!x) return q; var v = Math.round(x.n * f * 10) / 10; return v.toLocaleString("fr-FR") + (x.unit ? " " + x.unit : ""); }

  function Timer(p) {
    var st = useState(null), left = st[0];
    React.useEffect(function () { if (left == null || left <= 0) return; var t = setTimeout(function () { st[1](left - 1); }, 1000); return function () { clearTimeout(t); }; }, [left]);
    var mm = left != null ? Math.floor(left / 60) + ":" + ("0" + left % 60).slice(-2) : null;
    return h("div", { className: "nd-timer" },
      h("button", { type: "button", className: "nd-timer-btn", onClick: function () { st[1](left == null ? p.minutes * 60 : null); } }, h(Icon, { name: left == null ? "plus" : "x", size: "sm" })),
      h("span", { className: "nd-timer-label" }, left == null ? "Lancer le minuteur " + p.label : (left > 0 ? p.label + " : " + mm : p.label + " : c'est prêt !")),
      left === 0 ? h("span", { role: "alert", className: "nd-sr" }, p.label + " est prêt") : null);
  }

  function RecipeView(p) {
    var r = p.recipe, sv = useState(r.servings || 2), serv = sv[0], tab = useState("ing"), fav = useState(!!p.favorite), stepS = useState(0);
    var f = serv / (r.servings || 2);
    return h("article", { className: "nd-recipe", "aria-labelledby": "rv-" + hashStr(r.name) },
      h("div", { className: cx("nd-recipe-hero", "nd-tone-" + (r.tone || "peche")) },
        r.image ? h("img", { src: r.image, alt: "" }) : h("span", { className: "nd-recipe-hero-emoji", "aria-hidden": "true" }, r.emoji || foodEmoji(r.name)),
        h("button", { type: "button", className: "nd-round-btn left", "aria-label": "Fermer la recette", onClick: p.onClose }, h(Icon, { name: "x" })),
        h("button", { type: "button", className: cx("nd-round-btn right", fav[0] && "on"), "aria-label": "Recette favorite", "aria-pressed": fav[0] ? "true" : "false", onClick: function () { fav[1](!fav[0]); } }, h(Icon, { name: "heart" })),
        r.matched ? h("span", { className: "nd-recipe-match" }, h(Sticker, { tone: "heart", size: "sm", rotate: -6 }, "votre match")) : null),
      h("div", { className: "nd-recipe-sheet" },
        h("span", { className: "nd-sheet-handle", "aria-hidden": "true" }),
        h("h2", { id: "rv-" + hashStr(r.name), className: "nd-recipe-title" }, r.name),
        r.by ? h("p", { className: "nd-recipe-by" }, h(Avatar, { name: r.by.name, partner: r.by.partner, size: 22 }), "Ajoutée par " + r.by.name) : null,
        h("ul", { className: "nd-recipe-facts" },
          [["clock", "Temps", r.time], ["sparkle", "Difficulté", r.difficulty], ["meal", "Portions", serv + " pers."]].map(function (x, i) {
            return h("li", { key: i }, h(Icon, { name: x[0] }), h("span", { className: "k" }, x[1]), h("span", { className: "v" }, x[2]));
          })),
        h("div", { className: "nd-servings" }, h("span", { id: "srv-l" }, "Pour combien ?"),
          h("div", { className: "nd-stepper", role: "group", "aria-labelledby": "srv-l" },
            h("button", { type: "button", "aria-label": "Une personne de moins", disabled: serv <= 1, onClick: function () { sv[1](serv - 1); } }, h(Icon, { name: "minus", size: "sm" })),
            h("output", { "aria-live": "polite" }, serv + " personne" + (serv > 1 ? "s" : "")),
            h("button", { type: "button", "aria-label": "Une personne de plus", onClick: function () { sv[1](serv + 1); } }, h(Icon, { name: "plus", size: "sm" })))),
        h("div", { className: "nd-seg", role: "tablist", "aria-label": "Recette" },
          [["ing", "Ingrédients (" + r.ingredients.length + ")"], ["steps", "Étapes (" + r.steps.length + ")"]].map(function (t) {
            return h("button", { key: t[0], type: "button", role: "tab", id: "tab-" + t[0], "aria-selected": tab[0] === t[0] ? "true" : "false", "aria-controls": "panel-" + t[0], onClick: function () { tab[1](t[0]); } }, t[1]);
          })),
        tab[0] === "ing" ? h("div", { role: "tabpanel", id: "panel-ing", "aria-labelledby": "tab-ing", className: "nd-recipe-list" },
          r.ingredients.map(function (it, i) { return h(FoodItem, { key: i, name: it.name, emoji: it.emoji, tone: it.tone || "neutre", qty: scaleQty(it.qty, f) }); }))
          : h("ol", { role: "tabpanel", id: "panel-steps", "aria-labelledby": "tab-steps", className: "nd-steps" },
            r.steps.map(function (s, i) {
              return h("li", { key: i, className: cx("nd-step", i === stepS[0] && "current") },
                h("button", { type: "button", className: "nd-step-head", "aria-expanded": i === stepS[0] ? "true" : "false", onClick: function () { stepS[1](i); } }, h("span", { className: "nd-step-num" }, "Étape " + (i + 1)), h("span", { className: "nd-step-short" }, s.title)),
                i === stepS[0] ? h("div", { className: "nd-step-body" }, h("p", null, s.text), s.timer ? h(Timer, { minutes: s.timer, label: s.timerLabel || s.timer + " min" }) : null) : null);
            })),
        h(Button, { size: "lg", icon: "cart", className: "nd-recipe-cta", onClick: p.onAddToList }, "Ajouter aux courses")));
  }

  function WhoDoesItGame(p) {
    var players = p.players, tasks = p.tasks || [{ name: "Cuisine", emoji: "🍳" }, { name: "Vaisselle", emoji: "🧽" }];
    var st = useState({ k: 0, rot: 0, res: [], spinning: false }), s = st[0];
    var reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var SEG = 8, segs = []; for (var i = 0; i < SEG; i++) segs.push(i % 2);
    function spin() {
      if (s.spinning || s.k >= tasks.length) return;
      var win = Math.floor(Math.random() * 2);
      if (p.otherDoesNext && s.k > 0) win = 1 - s.res[s.k - 1];
      var seg = win === 0 ? 2 * Math.floor(Math.random() * 4) : 2 * Math.floor(Math.random() * 4) + 1;
      var target = s.rot + 360 * 4 + (360 - (seg * 45 + 22.5)) - (s.rot % 360);
      st[1]({ k: s.k, rot: target, res: s.res, spinning: true });
      setTimeout(function () { st[1]({ k: s.k + 1, rot: target, res: s.res.concat([win]), spinning: false }); }, reduce ? 50 : 2600);
    }
    var finished = s.k >= tasks.length, lastW = s.res.length ? players[s.res[s.res.length - 1]] : null, lastT = s.res.length ? tasks[s.res.length - 1] : null;
    return h("section", { className: "nd-game", "aria-label": "Qui fait quoi ?" },
      h("div", { className: "nd-game-head" }, h(StickerStack, { size: "sm", words: [{ text: "qui fait", tone: "citron" }, { text: "quoi ?", tone: "lilas" }] })),
      h("div", { className: "nd-wheel-wrap" },
        h("span", { className: "nd-wheel-pointer", "aria-hidden": "true" }),
        h("svg", { className: "nd-wheel", viewBox: "-100 -100 200 200", "aria-hidden": "true", style: { transform: "rotate(" + s.rot + "deg)", transitionDuration: reduce ? "0s" : "2.5s" } },
          segs.map(function (w, i) {
            var a0 = (i * 45 - 90) * Math.PI / 180, a1 = ((i + 1) * 45 - 90) * Math.PI / 180, am = ((i + .5) * 45 - 90) * Math.PI / 180;
            return h("g", { key: i },
              h("path", { className: w === 0 ? "seg-a" : "seg-b", d: "M0 0L" + 96 * Math.cos(a0) + " " + 96 * Math.sin(a0) + "A96 96 0 0 1 " + 96 * Math.cos(a1) + " " + 96 * Math.sin(a1) + "Z" }),
              h("text", { x: 64 * Math.cos(am), y: 64 * Math.sin(am) + 6, textAnchor: "middle", transform: "rotate(" + ((i + .5) * 45) + " " + 64 * Math.cos(am) + " " + 64 * Math.sin(am) + ")" }, players[w].name.charAt(0)));
          }),
          h("circle", { r: 30, className: "hub" })),
        h("button", { type: "button", className: "nd-wheel-btn", onClick: spin, disabled: s.spinning || finished }, finished ? "Fini !" : s.spinning ? "…" : "Tourner")),
      h("div", { role: "status", "aria-live": "polite", className: "nd-game-status" },
        s.spinning ? "La roue tourne pour : " + tasks[s.k].name.toLowerCase() + "…"
          : lastW ? h(Sticker, { tone: lastW === players[0] ? "lavande" : "peche", rotate: -4 }, lastW.name + " : " + lastT.name.toLowerCase() + " !")
          : "On tire au sort : " + tasks[0].name.toLowerCase() + " d'abord."),
      h("ul", { className: "nd-game-tasks" }, tasks.map(function (t, i) {
        var w = s.res[i] != null ? players[s.res[i]] : null;
        return h("li", { key: i, className: cx(i === s.k && !finished && "current") },
          h("span", { className: "nd-game-task" }, h("span", { "aria-hidden": "true" }, t.emoji + " "), t.name),
          w ? h("span", { className: "nd-game-who" }, h(Avatar, { name: w.name, partner: w.partner, size: 26 }), w.name) : h("span", { className: "nd-game-wait" }, i === s.k ? "à tirer" : "en attente"));
      })),
      finished ? h("div", { className: "nd-deck-actions" }, h(Button, { variant: "primary", icon: "check", onClick: p.onDone }, "C'est noté"), h(Button, { variant: "secondary", onClick: function () { st[1]({ k: 0, rot: s.rot, res: [], spinning: false }); } }, "Rejouer")) : null);
  }

  function ChatThread(p) {
    return h("div", { className: "nd-chat" },
      p.messages.map(function (m, i) {
        return h("div", { key: i, className: cx("nd-bubble", m.from === "me" ? "nd-bubble-me" : "nd-bubble-them") }, m.text, m.time ? h("span", { className: "nd-bubble-time" }, m.time) : null);
      }),
      p.composer !== false ? h("div", { className: "nd-composer" },
        h("input", { placeholder: p.placeholder || "Écris un message", "aria-label": "Message" }),
        h("button", { type: "button", "aria-label": "Envoyer" }, h(Icon, { name: "send", size: "sm" }))) : null);
  }

  var TABS = [["home", "home", "Accueil"], ["agenda", "calendar", "Agenda"], ["add", "plus", "Ajouter"], ["argent", "wallet", "Argent"], ["nous", "chat", "Nous"]];
  function TabBar(p) {
    var s = useState(p.active || "home");
    return h("nav", { className: "nd-tabbar", "aria-label": "Navigation principale" },
      TABS.map(function (t) {
        if (t[0] === "add") return h("button", { key: t[0], type: "button", className: "nd-tab nd-tab-add", "aria-label": "Ajouter", onClick: p.onAdd }, h("span", { className: "nd-icon-wrap" }, h(Icon, { name: "plus" })));
        return h("button", { key: t[0], type: "button", className: "nd-tab", "aria-current": s[0] === t[0] ? "page" : undefined, onClick: function () { s[1](t[0]); p.onChange && p.onChange(t[0]); } }, h(Icon, { name: t[1] }), t[2]);
      }));
  }

  window.NousDeux = Object.assign(window.NousDeux || {}, {
    Button: Button, Pill: Pill, PillGroup: PillGroup, Avatar: Avatar, AvatarPair: AvatarPair, CategoryTile: CategoryTile,
    EventCard: EventCard, DayStrip: DayStrip, BillCard: BillCard, PaydayCard: PaydayCard, TodoItem: TodoItem,
    DishCard: DishCard, MatchSticker: MatchSticker, Buddy: Buddy, Sticker: Sticker, StickerStack: StickerStack, HeroCard: HeroCard, PiggyBank: PiggyBank, PlantCard: PlantCard, PlantBuddy: PlantBuddy, RecipeRow: RecipeRow, SwipeDeck: SwipeDeck, RecipeView: RecipeView, WhoDoesItGame: WhoDoesItGame, plantMood: plantMood, FoodItem: FoodItem, foodEmoji: foodEmoji, StatTile: StatTile, BarChart: BarChart, LineChart: LineChart, SplitBar: SplitBar, RankedBars: RankedBars, DivergingBars: DivergingBars, CalendarHeatmap: CalendarHeatmap, GaugeTile: GaugeTile, Legend: Legend, ChatThread: ChatThread, TabBar: TabBar, Icon: Icon
  });
})();
