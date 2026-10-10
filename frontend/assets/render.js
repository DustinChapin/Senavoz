const fs = require('fs');
const sharp = require('sharp');

fs.mkdirSync('assets', { recursive: true });

// Marca: dos burbujas enfrentadas (la superior rotada 180°, como la pantalla dividida).
// Coordenadas sobre un lienzo de 1024.
const mark = `
  <g id="a">
    <rect x="150" y="520" width="480" height="280" rx="90" fill="#ffffff"/><path d="M235 770L205 890L360 790Z" fill="#ffffff"/>
    <circle cx="300" cy="660" r="30" fill="#0b1220"/>
    <circle cx="390" cy="660" r="30" fill="#0b1220"/>
    <circle cx="480" cy="660" r="30" fill="#0b1220"/>
  </g>
  <g transform="rotate(180 512 512)">
    <rect x="150" y="520" width="480" height="280" rx="90" fill="#38bdf8"/><path d="M235 770L205 890L360 790Z" fill="#38bdf8"/>
    <g stroke="#0b1220" stroke-width="36" stroke-linecap="round">
      <line x1="300" y1="640" x2="300" y2="680"/>
      <line x1="360" y1="610" x2="360" y2="710"/>
      <line x1="420" y1="630" x2="420" y2="690"/>
      <line x1="480" y1="650" x2="480" y2="670"/>
    </g>
  </g>`;

const bg = `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#0b1220"/><stop offset="1" stop-color="#12376b"/></linearGradient></defs>`;

const svg = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

const files = {
  // Icono completo (con fondo) y capas del icono adaptable de Android.
  'icon-only': svg(1024, 1024, `${bg}<rect width="1024" height="1024" fill="url(#g)"/>${mark}`),
  'icon-foreground': svg(1024, 1024, `<g transform="translate(512 512) scale(.62) translate(-512 -512)">${mark}</g>`),
  'icon-background': svg(1024, 1024, `${bg}<rect width="1024" height="1024" fill="url(#g)"/>`),
  // Pantalla de inicio (cuadrada; Capacitor la recorta para cada tamaño).
  splash: svg(2732, 2732, `${bg}<rect width="2732" height="2732" fill="#0b1220"/>
    <g transform="translate(1366 1180) scale(.9) translate(-512 -557)">${mark}</g>
    <text x="1366" y="1900" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="210" font-weight="700" fill="#ffffff">SeñaVoz</text>
    <text x="1366" y="2060" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="84" fill="#8fa3bf">Conversar sin barreras</text>`),
  // Portada para LinkedIn (1200x627).
  'linkedin-cover': svg(1200, 627, `${bg}<rect width="1200" height="627" fill="url(#g)"/>
    <g transform="translate(35 -7) scale(.3)">${mark}</g>
    <text x="80" y="420" font-family="Segoe UI, Arial, sans-serif" font-size="96" font-weight="700" fill="#ffffff">SeñaVoz</text>
    <text x="84" y="480" font-family="Segoe UI, Arial, sans-serif" font-size="34" fill="#8fa3bf">Comunicación entre personas sordas y oyentes</text>
    <text x="84" y="530" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#38bdf8">Angular · Capacitor · Node.js · PostgreSQL</text>
    <g transform="translate(820 70)">
      <rect width="260" height="500" rx="38" fill="#05090f" stroke="#2a3a55" stroke-width="6"/>
      <clipPath id="s"><rect x="14" y="14" width="232" height="472" rx="26"/></clipPath>
      <g clip-path="url(#s)">
        <rect x="14" y="14" width="232" height="236" fill="#11203a"/>
        <rect x="14" y="250" width="232" height="236" fill="#0f172a"/>
        <rect x="14" y="248" width="232" height="4" fill="#38bdf8"/>
        <g transform="rotate(180 130 132)">
          <rect x="70" y="100" width="120" height="44" rx="22" fill="#38bdf8"/>
          <text x="130" y="130" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="#04202e">Toca y habla</text>
          <text x="130" y="185" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="20" fill="#e5edf8">Hola, necesito ayuda</text>
        </g>
        <text x="130" y="305" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#e5edf8">Hola, necesito ayuda</text>
        <rect x="30" y="345" width="140" height="34" rx="10" fill="#0b1220" stroke="#28405f"/>
        <rect x="178" y="345" width="52" height="34" rx="10" fill="#38bdf8"/>
        <g fill="#16263f" stroke="#28405f">
          <rect x="30" y="395" width="64" height="40" rx="10"/><rect x="98" y="395" width="64" height="40" rx="10"/><rect x="166" y="395" width="64" height="40" rx="10"/>
          <rect x="30" y="440" width="64" height="40" rx="10"/><rect x="98" y="440" width="64" height="40" rx="10"/><rect x="166" y="440" width="64" height="40" rx="10"/>
        </g>
      </g>
    </g>`),
};

(async () => {
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(`assets/${name}.svg`, content);
    await sharp(Buffer.from(content), { density: 96 }).png().toFile(`assets/${name}.png`);
    console.log('ok', name);
  }
  // Variante oscura de la pantalla de inicio (misma imagen).
  fs.copyFileSync('assets/splash.png', 'assets/splash-dark.png');
})();
