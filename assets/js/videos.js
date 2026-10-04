const videos = [
  {
    webm: "https://svs.gsfc.nasa.gov/vis/a020000/a020200/a020249/SolarSystem_H264_1080p.webm",
    title: "Солнечная система",
    text: "Анимация NASA с планетами Солнечной системы",
  },
  {
    mp4: "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005570/Earth_wAtmos_spin_02_1080p60.mp4",
    poster:
      "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005570/Earth_wAtmos_spin_02.01000.preview.jpg",
    title: "Земля с орбиты",
    text: "Вращающаяся Земля с облаками, атмосферой и ночными огнями — визуализация NASA",
  },
  {
    webm: "https://svs.gsfc.nasa.gov/vis/a030000/a031200/a031250/Perseverance-landing-1080p.webm",
    mp4: "https://svs.gsfc.nasa.gov/vis/a030000/a031200/a031250/Perseverance-landing-1080p.mp4",
    title: "Посадка на Марс",
    text: "Реальные кадры спуска и посадки Perseverance на Марс",
  },
];

const player = document.querySelector("#video_player");
const sourceWebm = document.querySelector("#video_source_webm");
const sourceMp4 = document.querySelector("#video_source_mp4");
const title = document.querySelector("#video_title");
const text = document.querySelector("#video_text");
const buttons = [...document.querySelectorAll(".video_item")];

function selectVideo(index) {
  const video = videos[index];
  player.pause();

  sourceWebm.removeAttribute("src");
  sourceMp4.removeAttribute("src");

  if (video.webm) sourceWebm.src = video.webm;
  if (video.mp4) sourceMp4.src = video.mp4;

  if (video.poster) player.poster = video.poster;
  else player.removeAttribute("poster");

  player.load();
  title.textContent = video.title;
  text.textContent = video.text;
  buttons.forEach((button, i) => button.classList.toggle("active", i === index));
}

buttons.forEach((button, index) => button.addEventListener("click", () => selectVideo(index)));
selectVideo(0);
